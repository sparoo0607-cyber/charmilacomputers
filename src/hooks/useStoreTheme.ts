"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth: Supabase `store_settings` row id="default".
// localStorage is used ONLY as a paint-hint for the very first render to avoid
// a flash.  After mount the hook ALWAYS reconciles with Supabase (via
// /api/theme which reads Supabase).  When admin switches theme we:
//   1. Write to Supabase (via /api/theme POST)
//   2. Write localStorage hint so other tabs / next refresh are fast
//   3. Dispatch "charmila_theme_changed" so every hook instance re-reads
// ─────────────────────────────────────────────────────────────────────────────

const THEME_KEY = "charmila_active_theme";

function readLocalHint(): "festive" | "standard" | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === "festive" || v === "standard") return v;
  } catch {}
  return null;
}

function writeLocalHint(theme: "festive" | "standard") {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}

async function fetchThemeFromServer(): Promise<"festive" | "standard" | null> {
  try {
    const res = await fetch("/api/theme", { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (json.activeTheme === "festive" || json.activeTheme === "standard") {
        return json.activeTheme;
      }
    }
  } catch {}
  return null;
}

async function fetchThemeFromSupabase(): Promise<"festive" | "standard" | null> {
  try {
    const { data, error } = await supabase
      .from("store_settings")
      .select("active_theme")
      .eq("id", "default")
      .maybeSingle();
    if (!error && (data?.active_theme === "festive" || data?.active_theme === "standard")) {
      return data.active_theme as "festive" | "standard";
    }
  } catch {}
  return null;
}

export function useStoreTheme() {
  const [theme, setTheme] = useState<"festive" | "standard">(
    () => readLocalHint() ?? "standard"
  );

  const syncTheme = useCallback(async () => {
    // 1. Try server API first (reads Supabase store_settings)
    const serverTheme = await fetchThemeFromServer();
    if (serverTheme) {
      setTheme(serverTheme);
      writeLocalHint(serverTheme);
      return;
    }
    // 2. Fallback: direct Supabase query
    const supabaseTheme = await fetchThemeFromSupabase();
    if (supabaseTheme) {
      setTheme(supabaseTheme);
      writeLocalHint(supabaseTheme);
      return;
    }
    // 3. Last resort: use local hint
    const hint = readLocalHint();
    if (hint) setTheme(hint);
  }, []);

  useEffect(() => {
    // Sync on mount
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
