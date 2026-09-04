"use client";

import { useState, useEffect, useCallback, useContext } from "react";
import { supabase } from "@/lib/supabase/client";
import { ServerThemeContext } from "@/context/ThemeContext";
import { normalizeTheme, isThemeId, type ThemeId } from "@/lib/theme";

// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth: Supabase `store_settings` row id="default".
// localStorage is used ONLY as a paint-hint for the very first render to avoid
// a flash.  After mount the hook ALWAYS reconciles with Supabase (via
// /api/theme which reads Supabase).  When admin switches theme we:
//   1. Write to Supabase (via /api/theme POST)
//   2. Write localStorage hint so other tabs / next refresh are fast
//   3. Dispatch "charmila_theme_changed" so every hook instance re-reads
//
// Every value coming back from an external source is run through
// normalizeTheme() so a stray value like "festival" can't wedge the store.
// ─────────────────────────────────────────────────────────────────────────────

const THEME_KEY = "charmila_active_theme";

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

export function useStoreTheme() {
  const serverTheme = useContext(ServerThemeContext);
  const [theme, setTheme] = useState<ThemeId>(() => {
    const hint = readLocalHint();
    return hint || serverTheme;
  });

  const syncTheme = useCallback(async () => {
    const serverTheme = await fetchThemeFromServer();
    if (serverTheme) {
      setTheme(serverTheme);
      writeLocalHint(serverTheme);
      return;
    }
    const supabaseTheme = await fetchThemeFromSupabase();
    if (supabaseTheme) {
      setTheme(supabaseTheme);
      writeLocalHint(supabaseTheme);
      return;
    }
  }, []);

  useEffect(() => {
    // Reconcile with the backend on mount. setState happens asynchronously
    // inside syncTheme() as we pull the authoritative value from Supabase —
    // this is the "subscribe to an external system" effect pattern, not a
    // render-derived state update.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    syncTheme();

    // Re-sync when admin changes theme
    const onThemeChanged = () => {
      const hint = readLocalHint();
      if (hint) setTheme(hint); // instant update from localStorage
      syncTheme(); // then confirm with server
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

  return theme;
}
