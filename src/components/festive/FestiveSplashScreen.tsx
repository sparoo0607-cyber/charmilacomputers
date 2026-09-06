"use client";

import { useEffect, useState } from "react";
import { festivalConfig } from "@/config/festivalConfig";
import { useStoreTheme } from "@/hooks/useStoreTheme";

const DUSSARA_DAY_NAMES: Record<string, { title: string; subtitle: string }> = {
  "dussara-d1": { title: "DUSSEHRA NAVRATRI · DAY 1", subtitle: "Sri Shailaputri Devi (Swarna Kavachalankruta Durga)" },
  "dussara-d2": { title: "DUSSEHRA NAVRATRI · DAY 2", subtitle: "Sri Brahmacharini Devi (Sri Bala Tripura Sundari)" },
  "dussara-d3": { title: "DUSSEHRA NAVRATRI · DAY 3", subtitle: "Sri Chandraghanta Devi (Sri Gayatri Devi)" },
  "dussara-d4": { title: "DUSSEHRA NAVRATRI · DAY 4", subtitle: "Sri Kushmanda Devi (Sri Annapurna Devi)" },
  "dussara-d5": { title: "DUSSEHRA NAVRATRI · DAY 5", subtitle: "Sri Skandamata Devi (Sri Lakshmi Devi)" },
  "dussara-d6": { title: "DUSSEHRA NAVRATRI · DAY 6", subtitle: "Sri Katyayani Devi (Sri Saraswati Devi)" },
  "dussara-d7": { title: "DUSSEHRA NAVRATRI · DAY 7", subtitle: "Sri Kalaratri Devi (Sri Lalitha Tripura Sundari)" },
  "dussara-d8": { title: "DUSSEHRA NAVRATRI · DAY 8", subtitle: "Sri Mahagauri Devi (Sri Mahishasura Mardhini)" },
  "dussara-d9": { title: "DUSSEHRA NAVRATRI · VIJAYA DASAMI", subtitle: "Sri Siddhidatri Devi (Sri Raja Rajeshwari Devi)" },
};

export default function FestiveSplashScreen() {
  const activeTheme = useStoreTheme();
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!festivalConfig.enabled || !festivalConfig.splash) return;

    // Check prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // Show splash once per session
    try {
      const seen = sessionStorage.getItem("charmila_festive_splash_seen");
      if (seen === "true") return;
      sessionStorage.setItem("charmila_festive_splash_seen", "true");
    } catch {}

    setVisible(true);

    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 1500);

    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  const isDussara = activeTheme.startsWith("dussara-d");
  const dussaraInfo = isDussara ? (DUSSARA_DAY_NAMES[activeTheme] || { title: "CELEBRATING DUSSEHRA NAVRATRI", subtitle: "Sri Durga Devi Navratri Utsav" }) : null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#4A080B] text-[#FFF6E3] transition-opacity duration-500 pointer-events-none select-none ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Warm Ambient Golden Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C89B3C]/25 via-[#6E0F12]/40 to-transparent pointer-events-none" />

      {/* Subtle Arch Geometry Vector Background */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10 text-[#C89B3C]"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 800 800"
      >
        <pattern id="festive-arch" width="100" height="100" patternUnits="userSpaceOnUse">
          <path
            d="M50 0 C25 25 25 75 50 100 C75 75 75 25 50 0 Z M0 50 C25 25 75 25 100 50 C75 75 25 75 0 50 Z"
            stroke="currentColor"
            strokeWidth="0.8"
            fill="none"
          />
          <circle cx="50" cy="50" r="12" stroke="currentColor" strokeWidth="0.8" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#festive-arch)" />
      </svg>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        {/* Festive Vector Silhouette */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 mb-4 text-[#C89B3C] animate-pulse">
          {isDussara ? (
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full drop-shadow-[0_0_12px_rgba(200,155,60,0.6)]">
              {/* Trishul / Divine Lotus Icon for Durga Navratri */}
              <path d="M50 15 L50 85" strokeWidth="2.5" />
              <path d="M35 30 C35 50 45 60 50 65 C55 60 65 50 65 30" />
              <path d="M30 25 L35 30" />
              <path d="M70 25 L65 30" />
              <path d="M45 15 L50 10 L55 15" strokeWidth="2" fill="#D98A19" />
              <circle cx="50" cy="45" r="4" fill="#D98A19" stroke="none" />
            </svg>
          ) : (
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full drop-shadow-[0_0_12px_rgba(200,155,60,0.6)]">
              {/* Elegant Vector Ganesha Trunk & Crown Silhouette */}
              <path d="M50 12 L50 22 M44 16 L56 16" strokeWidth="1.8" />
              <path d="M50 22 C38 22 30 28 30 38 C30 52 46 54 50 62 C54 70 42 78 38 74" />
              <path d="M50 22 C62 22 70 28 70 38 C70 46 64 50 58 52" />
              {/* Tusk & Ears */}
              <path d="M30 38 C20 34 14 42 22 50 C28 56 34 54 36 50" />
              <path d="M70 38 C80 34 86 42 78 50 C72 56 66 54 64 50" />
              {/* Tilak Ornament */}
              <path d="M48 28 L52 28 M50 25 L50 33" strokeWidth="2" stroke="#FFF6E3" />
              {/* Modaka Accent */}
              <circle cx="62" cy="62" r="3" fill="#D98A19" stroke="none" />
            </svg>
          )}
        </div>

        {/* Brand Heading */}
        <div className="tracking-[0.25em] text-xs font-semibold text-[#C89B3C] uppercase mb-1">
          Charmila Computers
        </div>

        <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-wide text-[#FFF6E3] mb-2 drop-shadow-md uppercase">
          {isDussara && dussaraInfo ? dussaraInfo.title : "CELEBRATING VINAYAKA CHAVITHI"}
        </h1>

        <p className="text-xs sm:text-sm text-[#FFF6E3]/80 tracking-wider font-light uppercase">
          {isDussara && dussaraInfo ? dussaraInfo.subtitle : "A Festival of Prosperity & High Performance"}
        </p>

        {/* Decorative Gold Line */}
        <div className="mt-5 flex items-center gap-3 w-48 opacity-80">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#C89B3C]" />
          <div className="w-1.5 h-1.5 rotate-45 bg-[#C89B3C]" />
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#C89B3C]" />
        </div>
      </div>
    </div>
  );
}
