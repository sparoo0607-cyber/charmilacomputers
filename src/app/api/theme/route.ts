import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getThemeMedia, HomePageMediaState } from "@/data/homeMedia";
import { supabase } from "@/lib/supabase/client";

const THEME_FILE = path.join(process.cwd(), ".theme_state.json");

interface ThemeStateFile {
  activeTheme: "festive" | "standard";
  festiveMedia?: HomePageMediaState;
  standardMedia?: HomePageMediaState;
  updatedAt: string;
}

function getLocalThemeState(): ThemeStateFile {
  try {
    if (fs.existsSync(THEME_FILE)) {
      const raw = fs.readFileSync(THEME_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Could not read local theme file:", e);
  }
  return { activeTheme: "standard", updatedAt: new Date().toISOString() };
}

function saveLocalThemeState(state: ThemeStateFile) {
  try {
    fs.writeFileSync(THEME_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (e) {
    console.warn("Could not write local theme file:", e);
  }
}

export async function GET() {
  const localState = getLocalThemeState();
  let activeTheme: "festive" | "standard" = localState.activeTheme || "standard";

  // 1. Check Supabase store_settings
  try {
    const { data } = await supabase
      .from("store_settings")
      .select("active_theme")
      .eq("id", "default")
      .maybeSingle();

    if (data?.active_theme) {
      activeTheme = data.active_theme as "festive" | "standard";
    }
  } catch {
    // fallback to localState
  }

  const defaultMedia = getThemeMedia(activeTheme);
  const customMedia = activeTheme === "standard" ? localState.standardMedia : localState.festiveMedia;
  const media = customMedia ? { ...defaultMedia, ...customMedia } : defaultMedia;

  return NextResponse.json({
    activeTheme,
    media,
    timestamp: Date.now(),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const theme = (body.theme as "festive" | "standard") || "festive";
    const customMedia = body.media as HomePageMediaState | undefined;

    const state = getLocalThemeState();
    state.activeTheme = theme;
    state.updatedAt = new Date().toISOString();

    if (customMedia) {
      if (theme === "standard") {
        state.standardMedia = customMedia;
      } else {
        state.festiveMedia = customMedia;
      }
    }

    // 1. Save locally for server persistence
    saveLocalThemeState(state);

    // 2. Save to Supabase store_settings
    try {
      await supabase.from("store_settings").upsert({
        id: "default",
        active_theme: theme,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn("Supabase store_settings upsert error:", err);
    }

    const defaultMedia = getThemeMedia(theme);
    const savedCustomMedia = theme === "standard" ? state.standardMedia : state.festiveMedia;
    const media = savedCustomMedia ? { ...defaultMedia, ...savedCustomMedia } : defaultMedia;

    return NextResponse.json({
      success: true,
      activeTheme: theme,
      media,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update theme";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

