import { supabase } from "@/lib/supabase/client";
import { normalizeTheme, DEFAULT_THEME, type ThemeId } from "@/lib/theme";

// Read the active storefront theme on the server so the root layout can stamp
// data-theme onto <html> before the first byte reaches the browser. Supabase
// store_settings id="default" is the single source of truth (same row the
// client hook and /api/theme read). Any failure falls back to DEFAULT_THEME.
export async function getServerTheme(): Promise<ThemeId> {
  try {
    const { data, error } = await supabase
      .from("store_settings")
      .select("active_theme")
      .eq("id", "default")
      .maybeSingle();
    if (!error && data?.active_theme) return normalizeTheme(data.active_theme);
  } catch {
    // network/DB unreachable — fall through
  }
  return DEFAULT_THEME;
}
