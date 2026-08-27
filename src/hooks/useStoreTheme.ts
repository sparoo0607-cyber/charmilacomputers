"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

// localStorage here is a *paint hint only* — it lets the first render guess
// the right theme instantly instead of flashing "standard" while the network
// fetch is in flight. It must never be treated as authoritative: the effect
// below always reconciles against the server (Supabase `store_settings`, via
// /api/theme) and overwrites this cache with whatever the server says, every
// time. Previously a cached value short-circuited the server check entirely,
// so once any browser had a stale value it would never update again — that
// was the theme-switch/refresh glitch.
function getCachedThemeHint(): "festive" | "standard" | null {
  if (typeof window === "undefined") return null;
  try {
    const direct = localStorage.getItem("charmila_active_theme");
    if (direct === "festive" || direct === "standard") return direct;

    const saved = localStorage.getItem("charmila_admin_settings_v1");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.activeTheme === "festive" || parsed.activeTheme === "standard") {
        return parsed.activeTheme;
      }
    }
  } catch {}
  return null;
}

function cacheThemeHint(theme: "festive" | "standard") {
  try {
    localStorage.setItem("charmila_active_theme", theme);
  } catch {}
}

export function useStoreTheme() {
  const [theme, setTheme] = useState<"festive" | "standard">(() => getCachedThemeHint() ?? "standard");

  useEffect(() => {
    let cancelled = false;

    async function loadTheme() {
      // 1. Check local user selection first — browser cache is authoritative for the active tab
      const localHint = getCachedThemeHint();
      if (localHint) {
        if (!cancelled) {
          setTheme(localHint);
        }
      }

      // 2. Fetch from server API or Supabase
      try {
        const res = await fetch("/api/theme", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (!cancelled && (json.activeTheme === "festive" || json.activeTheme === "standard")) {
            const serverTheme = json.activeTheme;
            // Only update local state if local cached hint is not present or matches server
            if (!localHint) {
              setTheme(serverTheme);
              cacheThemeHint(serverTheme);
            }
            return;
          }
        }
      } catch {}

      try {
        const { data, error } = await supabase
          .from("store_settings")
          .select("active_theme")
          .eq("id", "default")
          .maybeSingle();
        if (!cancelled && !error && data?.active_theme) {
          const resolved = data.active_theme === "festive" ? "festive" : "standard";
          if (!localHint) {
            setTheme(resolved);
            cacheThemeHint(resolved);
          }
        }
      } catch {}
    }

    loadTheme();

    // Re-reconcile with the server on these signals too, instead of trusting
    // whatever is currently cached locally.
    window.addEventListener("charmila_banners_updated", loadTheme);
    window.addEventListener("storage", loadTheme);
    return () => {
      cancelled = true;
      window.removeEventListener("charmila_banners_updated", loadTheme);
      window.removeEventListener("storage", loadTheme);
    };
  }, []);



  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  return theme;
}

