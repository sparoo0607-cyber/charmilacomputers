// Single definition of the storefront's theme ids + a tolerant parser.
//
// The DB (store_settings.active_theme) and older localStorage hints have, at
// various points, held values like "festival" or "" that are neither of the two
// ids the app understands. Every place that reads a theme value from an external
// source (Supabase, the /api/theme route, localStorage) must funnel it through
// normalizeTheme() so one bad row can never wedge the whole storefront onto the
// fallback theme again.

export type ThemeId =
  | "festive"
  | "standard"
  | "dussara-d1"
  | "dussara-d2"
  | "dussara-d3"
  | "dussara-d4"
  | "dussara-d5"
  | "dussara-d6"
  | "dussara-d7"
  | "dussara-d8"
  | "dussara-d9";

export const THEME_IDS: readonly ThemeId[] = [
  "festive",
  "standard",
  "dussara-d1",
  "dussara-d2",
  "dussara-d3",
  "dussara-d4",
  "dussara-d5",
  "dussara-d6",
  "dussara-d7",
  "dussara-d8",
  "dussara-d9",
];

export const DEFAULT_THEME: ThemeId = "standard";

export function isThemeId(v: unknown): v is ThemeId {
  return typeof v === "string" && (v === "festive" || v === "standard" || v.startsWith("dussara-d"));
}

export function normalizeTheme(v: unknown, fallback: ThemeId = DEFAULT_THEME): ThemeId {
  if (isThemeId(v)) return v as ThemeId;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "standard") return "standard";
    if (s.startsWith("dussara") || s.startsWith("dasara") || s.startsWith("navratri")) {
      const match = s.match(/d([1-9])/);
      if (match) return `dussara-d${match[1]}` as ThemeId;
      return "dussara-d1";
    }
    if (s.startsWith("fest") || s.includes("vinayaka")) return "festive";
  }
  return fallback;
}
