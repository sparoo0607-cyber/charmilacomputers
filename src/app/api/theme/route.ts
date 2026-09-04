import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getThemeMedia, HomePageMediaState } from "@/data/homeMedia";
import { supabase } from "@/lib/supabase/client";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { normalizeTheme, isThemeId, type ThemeId } from "@/lib/theme";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// On Vercel the filesystem is read-only except /tmp, and /tmp is wiped between
// cold starts — so the file is only ever a best-effort cache for the custom
// media overrides. The ACTIVE THEME's source of truth is Supabase store_settings.
const THEME_FILE = path.join(process.env.VERCEL ? "/tmp" : process.cwd(), ".theme_state.json");

interface ThemeStateFile {
  activeTheme: ThemeId;
  festiveMedia?: HomePageMediaState;
  standardMedia?: HomePageMediaState;
  updatedAt: string;
}

function getLocalThemeState(): ThemeStateFile | null {
  try {
    if (fs.existsSync(THEME_FILE)) {
      const raw = fs.readFileSync(THEME_FILE, "utf-8");
      const parsed = JSON.parse(raw) as ThemeStateFile;
      parsed.activeTheme = normalizeTheme(parsed.activeTheme);
      return parsed;
    }
  } catch (e) {
    console.warn("Could not read local theme file:", e);
  }
  return null;
}

function saveLocalThemeState(state: ThemeStateFile) {
  try {
    fs.writeFileSync(THEME_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (e) {
    console.warn("Could not write local theme file:", e);
  }
}

async function readThemeFromSupabase(): Promise<ThemeId | null> {
  try {
    const { data, error } = await supabase
      .from("store_settings")
      .select("active_theme")
      .eq("id", "default")
      .maybeSingle();
    if (error || !data?.active_theme) return null;
    return normalizeTheme(data.active_theme);
  } catch {
    return null;
  }
}

export async function GET() {
  const localState = getLocalThemeState();

  // Supabase store_settings is the single source of truth for the active theme.
  // Note: Database check constraint maps dussara themes to 'festive' in DB,
  // so we check localState to preserve exact dussara day variant when DB holds 'festive'.
  const supabaseTheme = await readThemeFromSupabase();
  let activeTheme: ThemeId = localState?.activeTheme ?? supabaseTheme ?? "standard";
  if (supabaseTheme === "standard") {
    activeTheme = "standard";
  } else if (supabaseTheme && isThemeId(supabaseTheme) && supabaseTheme !== "festive") {
    activeTheme = supabaseTheme;
  }

  const defaultMedia = getThemeMedia(activeTheme);
  const customMedia = activeTheme === "standard" ? localState?.standardMedia : (activeTheme === "festive" ? localState?.festiveMedia : undefined);
  const media = customMedia ? { ...defaultMedia, ...customMedia } : defaultMedia;

  return NextResponse.json({
    activeTheme,
    media,
    source: supabaseTheme ? "supabase" : localState ? "file" : "default",
    timestamp: Date.now(),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const theme = normalizeTheme(body.theme, "festive");
    const customMedia = body.media as HomePageMediaState | undefined;

    const state: ThemeStateFile =
      getLocalThemeState() ?? { activeTheme: theme, updatedAt: new Date().toISOString() };
    state.activeTheme = theme;
    state.updatedAt = new Date().toISOString();

    if (customMedia) {
      if (theme === "standard") {
        state.standardMedia = customMedia;
      } else if (theme === "festive") {
        state.festiveMedia = customMedia;
      }
    }

    // 1. Cache media overrides locally (best-effort).
    saveLocalThemeState(state);

    // 2. Persist the active theme to Supabase — the source of truth.
    // DB check constraint on store_settings.active_theme permits 'festive' / 'standard'.
    // Map dussara-d* to 'festive' for DB compatibility while keeping localState as dussara-d*.
    const dbTheme = theme.startsWith("dussara-d") ? "festive" : theme;
    const writer = supabaseAdmin ?? supabase;
    const { error: upsertError } = await writer.from("store_settings").upsert({
      id: "default",
      active_theme: dbTheme,
      updated_at: new Date().toISOString(),
    });
    if (upsertError) {
      console.warn("Supabase store_settings upsert error:", upsertError.message);
    }

    const defaultMedia = getThemeMedia(theme);
    const savedCustomMedia = theme === "standard" ? state.standardMedia : (theme === "festive" ? state.festiveMedia : undefined);
    const media = savedCustomMedia ? { ...defaultMedia, ...savedCustomMedia } : defaultMedia;

    return NextResponse.json({
      success: true,
      activeTheme: theme,
      persisted: !upsertError,
      media,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update theme";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
