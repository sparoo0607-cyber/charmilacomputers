"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

function getStoredTheme(): "festive" | "standard" {
  if (typeof window === "undefined") return "standard";
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
  return "standard";
}

export function useStoreTheme() {
  const [theme, setTheme] = useState<"festive" | "standard">(() => getStoredTheme());

  useEffect(() => {
    // Initial value already comes from getStoredTheme() via the lazy useState
    // initializer above — this effect only needs to reconcile against the
    // server/Supabase source of truth and listen for later changes.
    async function loadTheme() {
      // If user has direct localStorage set, that takes precedence locally
      const directLocal = typeof window !== "undefined" ? localStorage.getItem("charmila_active_theme") : null;
      if (directLocal === "festive" || directLocal === "standard") {
        setTheme(directLocal);
        return;
      }

      // Try server /api/theme
      try {
        const res = await fetch("/api/theme", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.activeTheme === "festive" || json.activeTheme === "standard") {
            setTheme(json.activeTheme);
            return;
          }
        }
      } catch {}

      // Try Supabase store_settings
      try {
        const { data, error } = await supabase
          .from("store_settings")
          .select("active_theme")
          .eq("id", "default")
          .maybeSingle();
        if (!error && data?.active_theme) {
          setTheme(data.active_theme as "festive" | "standard");
          return;
        }
      } catch {}
    }

    loadTheme();

    const handleUpdate = () => {
      setTheme(getStoredTheme());
    };

    window.addEventListener("charmila_banners_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("charmila_banners_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);



  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  return theme;
}

