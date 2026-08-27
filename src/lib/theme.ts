// Single definition of the storefront's theme ids + a tolerant parser.
//
// The DB (store_settings.active_theme) and older localStorage hints have, at
// various points, held values like "festival" or "" that are neither of the two
// ids the app understands. Every place that reads a theme value from an external
// source (Supabase, the /api/theme route, localStorage) must funnel it through
// normalizeTheme() so one bad row can never wedge the whole storefront onto the
// fallback theme again.

export type ThemeId = "festive" | "standard";

export const THEME_IDS: readonly ThemeId[] = ["festive", "standard"];

export const DEFAULT_THEME: ThemeId = "standard";

export function isThemeId(v: unknown): v is ThemeId {
  return v === "festive" || v === "standard";
}

export function normalizeTheme(v: unknown, fallback: ThemeId = DEFAULT_THEME): ThemeId {
  if (isThemeId(v)) return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "standard") return "standard";
    // "festival", "festive-vinayaka", "vinayaka", etc. → festive
    if (s.startsWith("fest") || s.includes("vinayaka")) return "festive";
  }
  return fallback;
}
