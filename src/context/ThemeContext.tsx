"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { normalizeTheme, isThemeId, type ThemeId } from "@/lib/theme";

// The active theme resolved on the SERVER (from Supabase store_settings) and
// handed to the client so the very first client render matches the server HTML.
// This is what kills the theme-flash on refresh: no component has to wait for a
// mount effect or a localStorage read to know which theme to paint.
export const ServerThemeContext = createContext<ThemeId>("standard");

// ─────────────────────────────────────────────────────────────────────────────
// The live theme, synced ONCE for the whole page.
//
// useStoreTheme used to do the backend sync itself, so every component that
// called it fired its own no-store GET /api/theme on mount. ProductCard is one
// of those callers, so a category page with 40 cards made 40+ identical
// uncached requests on every single navigation (plus Header, Footer,
// HeroCarousel, FestivalEffects…). The fetch now lives here, once, and
// useStoreTheme is a plain context read.
// ─────────────────────────────────────────────────────────────────────────────
const THEME_KEY = "charmila_active_theme";

export const LiveThemeContext = createContext<ThemeId | null>(null);

function readLocalHint(): ThemeId | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v == null) return null;
    return normalizeTheme(v);
  } catch {}
  return null;
}

function writeLocalHint(theme: ThemeId) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}

async function fetchThemeFromServer(): Promise<ThemeId | null> {
  try {
    const res = await fetch("/api/theme", { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (isThemeId(json.activeTheme)) return json.activeTheme;
    }
  } catch {}
  return null;
}

async function fetchThemeFromSupabase(): Promise<ThemeId | null> {
  try {
    const { data, error } = await supabase
      .from("store_settings")
      .select("active_theme")
      .eq("id", "default")
      .maybeSingle();
    if (!error && data?.active_theme) return normalizeTheme(data.active_theme);
  } catch {}
  return null;
}

export function ThemeProvider({
  initialTheme,
  children,
}: {
  initialTheme: ThemeId;
  children: React.ReactNode;
}) {
  // Seeded from the server-resolved theme so SSR and the first client render
  // agree; the localStorage hint is only applied after mount, for the same
  // reason (reading it during render would desync from the server HTML).
  const [theme, setTheme] = useState<ThemeId>(initialTheme);

  const syncTheme = useCallback(async () => {
    const fromServer = await fetchThemeFromServer();
    if (fromServer) {
      setTheme(fromServer);
      writeLocalHint(fromServer);
      return;
    }
    const fromSupabase = await fetchThemeFromSupabase();
    if (fromSupabase) {
      setTheme(fromSupabase);
      writeLocalHint(fromSupabase);
    }
  }, []);

  useEffect(() => {
    // Reconcile with the backend on mount. setState happens asynchronously
    // inside syncTheme() as we pull the authoritative value from Supabase —
    // this is the "subscribe to an external system" effect pattern, not a
    // render-derived state update.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    syncTheme();

    // Re-sync when the admin changes the theme or the banners.
    const onThemeChanged = () => {
      const hint = readLocalHint();
      if (hint) setTheme(hint); // instant update from localStorage
      syncTheme(); // then confirm with the server
    };

    window.addEventListener("charmila_theme_changed", onThemeChanged);
    window.addEventListener("charmila_banners_updated", onThemeChanged);
    return () => {
      window.removeEventListener("charmila_theme_changed", onThemeChanged);
      window.removeEventListener("charmila_banners_updated", onThemeChanged);
    };
  }, [syncTheme]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  return (
    <ServerThemeContext.Provider value={initialTheme}>
      <LiveThemeContext.Provider value={theme}>{children}</LiveThemeContext.Provider>
    </ServerThemeContext.Provider>
  );
}

export function useLiveTheme(): ThemeId {
  const live = useContext(LiveThemeContext);
  const server = useContext(ServerThemeContext);
  return live ?? server;
}
