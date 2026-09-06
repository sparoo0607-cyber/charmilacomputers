import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getThemeMedia, HomePageMediaState } from "@/data/homeMedia";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabase } from "@/lib/supabase/client";
import { normalizeTheme, isThemeId, type ThemeId } from "@/lib/theme";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ─────────────────────────────────────────────────────────────────────────────
// THEME STATE FILE — primary persistence layer.
//
// Why two layers?  Supabase store_settings.active_theme had a CHECK constraint
// that only allowed 'festive' / 'standard'. When a Dussara theme is selected,
// the Supabase upsert would silently fail (error logged, not surfaced to UI),
// so every page refresh reverted to the old theme.
//
// The local JSON file is written first and is always up-to-date. Supabase is
// written too (with the constraint now patched), but if it fails, the file
// wins — theme stays correct across refreshes. Vercel /tmp is process-scoped
// and wiped on cold start, so on Vercel Supabase is the truth; locally the
// file provides instant persistence.
// ─────────────────────────────────────────────────────────────────────────────
const THEME_FILE = path.join(
  process.env.VERCEL ? "/tmp" : process.cwd(),
  ".theme_state.json"
);

interface ThemeStateFile {
  activeTheme: ThemeId;
  customMediaByTheme?: Partial<Record<ThemeId, HomePageMediaState>>;
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
    console.warn("[theme] Could not read local theme file:", e);
  }
  return null;
}

function saveLocalThemeState(state: ThemeStateFile) {
  try {
    fs.writeFileSync(THEME_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (e) {
    console.warn("[theme] Could not write local theme file:", e);
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

// ─────────────────────────────────────────────────────────────────────────────
// Priority: local file (freshest admin action) → Supabase (cross-server) → default
// The local file wins over Supabase when the active theme is a Dussara variant,
// because the DB constraint may still be the old one that rejects those IDs.
// ─────────────────────────────────────────────────────────────────────────────
function resolveActiveTheme(
  localState: ThemeStateFile | null,
  supabaseTheme: ThemeId | null
): ThemeId {
  const local = localState?.activeTheme ?? null;

  // If local is a dussara theme, always trust it — Supabase may have rejected it.
  if (local && local.startsWith("dussara-d")) return local;

  // Otherwise prefer Supabase (more reliable across server restarts / multiple instances).
  if (supabaseTheme) return supabaseTheme;

  // Fall back to local, then standard.
  return local ?? "standard";
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/theme — returns the active theme + media for the storefront
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  const localState = getLocalThemeState();
  const supabaseTheme = await readThemeFromSupabase();
  const activeTheme = resolveActiveTheme(localState, supabaseTheme);

  const defaultMedia = getThemeMedia(activeTheme);
  const customMedia =
    localState?.customMediaByTheme?.[activeTheme] ??
    (activeTheme === "standard"
      ? localState?.standardMedia
      : activeTheme === "festive"
      ? localState?.festiveMedia
      : undefined);
  const media = customMedia ? { ...defaultMedia, ...customMedia } : defaultMedia;

  return NextResponse.json({
    activeTheme,
    media,
    source: supabaseTheme === activeTheme ? "supabase" : localState ? "file" : "default",
    timestamp: Date.now(),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/theme — admin sets a new active theme
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const theme = normalizeTheme(body.theme, "standard");
    const customMedia = body.media as HomePageMediaState | undefined;

    // 1. Always save to local file first — this is the fastest and most reliable path.
    const state: ThemeStateFile =
      getLocalThemeState() ?? {
        activeTheme: theme,
        updatedAt: new Date().toISOString(),
      };
    state.activeTheme = theme;
    state.updatedAt = new Date().toISOString();

    if (customMedia) {
      if (!state.customMediaByTheme) state.customMediaByTheme = {};
      state.customMediaByTheme[theme] = customMedia;
      if (theme === "standard") state.standardMedia = customMedia;
      else if (theme === "festive") state.festiveMedia = customMedia;
    }
    saveLocalThemeState(state);

    // 2. Persist the active theme to Supabase via service-role key (bypasses RLS).
    //    The CHECK constraint may still be the old one that blocks dussara themes —
    //    we log the error but DO NOT fail the request, since the local file is now set.
    const writer = supabaseAdmin ?? supabase;
    let supabasePersisted = false;
    let supabaseError: string | null = null;

    try {
      const { error: upsertError } = await writer.from("store_settings").upsert({
        id: "default",
        active_theme: theme,
        updated_at: new Date().toISOString(),
      });
      if (upsertError) {
        supabaseError = upsertError.message;
        console.warn("[theme] Supabase store_settings upsert failed:", supabaseError);
        console.warn("[theme] Theme is saved locally. Run supabase/update_theme_constraint.sql in Supabase Dashboard to fix permanently.");
      } else {
        supabasePersisted = true;
      }
    } catch (e) {
      supabaseError = String(e);
      console.warn("[theme] Supabase upsert threw:", e);
    }

    // 3. Sync banners to Supabase (best-effort, errors are non-fatal)
    const defaultMedia = getThemeMedia(theme);
    const savedCustomMedia =
      state.customMediaByTheme?.[theme] ??
      (theme === "standard"
        ? state.standardMedia
        : theme === "festive"
        ? state.festiveMedia
        : undefined);
    const media = savedCustomMedia
      ? { ...defaultMedia, ...savedCustomMedia }
      : defaultMedia;

    try {
      for (const [id, item] of Object.entries(media.hero)) {
        await writer.from("banners").upsert({
          id,
          image_src: item.imageSrc,
          badge_text: item.badgeText,
          title_line1: item.titleLine1,
          title_line2: item.titleLine2,
          subtitle: item.subtitle,
          button_text: item.buttonText,
          button_link: item.buttonLink,
          button2_text: item.button2Text || null,
          button2_link: item.button2Link || null,
          updated_at: new Date().toISOString(),
        });
      }
      if (media.promos.buildDifferent) {
        await writer.from("banners").upsert({
          id: "buildDifferent",
          image_src: media.promos.buildDifferent.image,
          subtitle: media.promos.buildDifferent.alt || null,
          button_link: media.promos.buildDifferent.link,
          updated_at: new Date().toISOString(),
        });
      }
      if (media.promos.templeNight) {
        const tn = media.promos.templeNight;
        await writer.from("banners").upsert({
          id: "templeNight",
          image_src: tn.image,
          badge_text: tn.badge || null,
          title_line1: tn.titleLine1 || null,
          title_line2: tn.titleLine2 || null,
          subtitle: tn.subtitle || null,
          button_text: tn.buttonText || null,
          button_link: tn.buttonLink || null,
          button2_text: tn.button2Text || null,
          button2_link: tn.button2Link || null,
          updated_at: new Date().toISOString(),
        });
      }
      if (media.flagship) {
        const fl = media.flagship;
        await writer.from("banners").upsert({
          id: "flagshipGpu",
          image_src: fl.image,
          badge_text: fl.badge,
          title_line1: fl.name,
          title_line2: fl.series,
          subtitle: fl.specs,
          button_text: `₹${fl.price.toLocaleString()}`,
          button_link: fl.link,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (bannerErr) {
      console.warn("[theme] Supabase banners upsert error (non-fatal):", bannerErr);
    }

    // Always return success=true — the theme IS active via the local file.
    return NextResponse.json({
      success: true,
      activeTheme: theme,
      persisted: supabasePersisted,
      persistedLocally: true,
      supabaseError,
      media,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update theme";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
