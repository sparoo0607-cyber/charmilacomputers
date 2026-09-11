import { supabase } from "@/lib/supabase/client";
import { normalizeTheme, DEFAULT_THEME, type ThemeId } from "@/lib/theme";
import fs from "fs";
import path from "path";

const THEME_FILE = path.join(process.env.VERCEL ? "/tmp" : process.cwd(), ".theme_state.json");

export async function getServerTheme(): Promise<ThemeId> {
  let localTheme: ThemeId | null = null;
  try {
    if (fs.existsSync(THEME_FILE)) {
      const raw = fs.readFileSync(THEME_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed.activeTheme) localTheme = normalizeTheme(parsed.activeTheme);
    }
  } catch {}

  try {
    const { data, error } = await supabase
      .from("store_settings")
      .select("active_theme")
      .eq("id", "default")
      .maybeSingle();
    // The local file (written unconditionally by every admin theme switch, see
    // /api/theme POST) is always the freshest source when present — the Supabase
    // write is best-effort and can fail silently, so trusting it over a
    // just-written local file let a switch to any non-Dussara theme appear to
    // apply and then revert once this resolver ran again on the next request.
    if (localTheme) return localTheme;
    if (!error && data?.active_theme) {
      return normalizeTheme(data.active_theme);
    }
  } catch {
    // network/DB unreachable — fall through
  }
  return localTheme || DEFAULT_THEME;
}
