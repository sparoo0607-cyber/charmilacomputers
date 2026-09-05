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
  const supabaseTheme = await readThemeFromSupabase();
  const activeTheme: ThemeId = supabaseTheme ?? localState?.activeTheme ?? "standard";

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
    const theme = normalizeTheme(body.theme, "standard");
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
    const writer = supabaseAdmin ?? supabase;
    const { error: upsertError } = await writer.from("store_settings").upsert({
      id: "default",
      active_theme: theme,
      updated_at: new Date().toISOString(),
    });
    if (upsertError) {
      console.warn("Supabase store_settings upsert error:", upsertError.message);
    }

    // 3. Sync hero & promo banners for the active theme to Supabase `banners` table via server writer
    const defaultMedia = getThemeMedia(theme);
    const savedCustomMedia = theme === "standard" ? state.standardMedia : (theme === "festive" ? state.festiveMedia : undefined);
    const media = savedCustomMedia ? { ...defaultMedia, ...savedCustomMedia } : defaultMedia;

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
      console.warn("Supabase banners upsert error:", bannerErr);
    }

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
