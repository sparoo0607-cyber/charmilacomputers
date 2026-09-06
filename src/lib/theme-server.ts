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
    if (!error && data?.active_theme) {
      const sbTheme = normalizeTheme(data.active_theme);
      if (localTheme && localTheme.startsWith("dussara-d") && !sbTheme.startsWith("dussara-d")) {
        return localTheme;
      }
      return sbTheme;
    }
  } catch {
    // network/DB unreachable — fall through
  }
  return localTheme || DEFAULT_THEME;
}
