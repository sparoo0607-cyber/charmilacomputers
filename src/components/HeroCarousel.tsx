"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useStoreTheme } from "@/hooks/useStoreTheme";
import { VINAYAKA_THEME_MEDIA, STANDARD_THEME_MEDIA, getThemeMedia } from "@/data/homeMedia";

export interface BannerData {
  imageSrc: string;
  badgeText: string;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  button2Text?: string;
  button2Link?: string;
}

export interface BannerRow {

  id: string;
  image_src: string;
  badge_text?: string | null;
  title_line1?: string | null;
  title_line2?: string | null;
  subtitle?: string | null;
  button_text?: string | null;
  button_link?: string | null;
  button2_text?: string | null;
  button2_link?: string | null;
}

function parseBanner(b: Partial<BannerData> | Partial<BannerRow> | undefined, fallback: BannerData): BannerData {
  if (!b) return fallback;
  const isStandardTheme = fallback.imageSrc.includes("/themes/standard/");
  const isFestiveTheme = fallback.imageSrc.includes("/themes/vinayaka/");

  const rawImage = ("imageSrc" in b && b.imageSrc) || ("image_src" in b && b.image_src) || fallback.imageSrc;
  const rawBadge = ("badgeText" in b && b.badgeText) || ("badge_text" in b && b.badge_text) || fallback.badgeText;

  // Strict theme directory check:
  // If fallback belongs to a theme directory (e.g. /themes/dussara/D1, /themes/vinayaka, /themes/standard),
  // ensure any stored database override belongs to the exact same theme directory.
  if (fallback.imageSrc.includes("/themes/")) {
    const parts = fallback.imageSrc.split("/");
    const themeDir = parts.slice(0, parts[2] === "dussara" ? 4 : 3).join("/");
    if (!rawImage.startsWith(themeDir)) {
      return fallback;
    }
  }

  const imageSrc = rawImage;
  const badgeText = rawBadge;
  const titleLine1 = ("titleLine1" in b && b.titleLine1) || ("title_line1" in b && b.title_line1) || fallback.titleLine1;
  const titleLine2 = ("titleLine2" in b && b.titleLine2) || ("title_line2" in b && b.title_line2) || fallback.titleLine2;
  const subtitle = b.subtitle || fallback.subtitle;
  const buttonText = ("buttonText" in b && b.buttonText) || ("button_text" in b && b.button_text) || fallback.buttonText;
  const buttonLink = ("buttonLink" in b && b.buttonLink) || ("button_link" in b && b.button_link) || fallback.buttonLink;
  const button2Text = ("button2Text" in b && b.button2Text) || ("button2_text" in b && b.button2_text) || fallback.button2Text;
  const button2Link = ("button2Link" in b && b.button2Link) || ("button2_link" in b && b.button2_link) || fallback.button2Link;

  return {
    imageSrc,
    badgeText,
    titleLine1,
    titleLine2,
    subtitle,
    buttonText,
    buttonLink,
    button2Text,
    button2Link,
  };
}

import { ThemeId, isFestiveTheme } from "@/lib/theme";

function fallbackForTheme(theme: ThemeId) {
  return getThemeMedia(theme).hero;
}

export default function HeroCarousel() {
  // Seeded from the server-resolved theme, so SSR and first client render agree
  // — no festive→standard banner swap on refresh.
  const activeTheme = useStoreTheme();
  const isFestive = isFestiveTheme(activeTheme);
  const themeFallback = fallbackForTheme(activeTheme);
  const [banners, setBanners] = useState<Record<string, BannerData | BannerRow>>(themeFallback);

  useEffect(() => {
    // Reset to the theme fallback whenever the active theme changes, so a stale
    // set of banners from the previous theme can't flash before Supabase answers.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBanners(fallbackForTheme(activeTheme));

    async function loadBanners() {
      try {
        const { data, error } = await supabase.from("banners").select("*");
        if (!error && data && data.length > 0) {
          const map: Record<string, BannerRow> = {};
          (data as unknown as BannerRow[]).forEach((b) => {
            map[b.id] = b;
          });
          setBanners((prev) => ({ ...prev, ...map }));
          return;
        }
      } catch {
        // fallback
      }
      try {
        const saved = localStorage.getItem("charmila_home_banners_v1");
        if (saved) {
          const parsed = JSON.parse(saved);
          setBanners((prev) => ({ ...prev, ...parsed }));
        }
      } catch {
        // ignore
      }
    }

    loadBanners();

    window.addEventListener("charmila_banners_updated", loadBanners);
    window.addEventListener("charmila_theme_changed", loadBanners);
    return () => {
      window.removeEventListener("charmila_banners_updated", loadBanners);
      window.removeEventListener("charmila_theme_changed", loadBanners);
    };
  }, [activeTheme]);

  const main = parseBanner(banners.main, themeFallback.main);
  const gaming = parseBanner(banners.gaming, themeFallback.gaming);
  const builder = parseBanner(banners.builder, themeFallback.builder);


  return (
    <div className="w-full">
      {/* Top Split Section: Large Left (70%), 2 Stacked Right (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-stretch">
        
        {/* Large Left Main Hero (8 cols / ~67%) */}
        <div className="lg:col-span-8 relative w-full aspect-[1774/887] rounded-2xl overflow-hidden shadow-lg group border border-[#E5E0D7] bg-[#2A0609]">
          <Image
            src={main.imageSrc || themeFallback.main.imageSrc}
            alt={`${main.titleLine1} ${main.titleLine2}`}
            fill
            sizes="(max-width: 1024px) 100vw, 67vw"
            className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
            priority
          />

          {/* Left Dark Gradient Overlay for Maximum Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent flex items-center">
            <div className="p-5 sm:p-8 md:p-10 lg:p-12 max-w-[70%] sm:max-w-[60%] text-white space-y-2.5 sm:space-y-4">
              
              {/* Badge */}
              <div className={`inline-flex items-center gap-1.5 text-[9px] sm:text-xs font-black uppercase px-3 py-1 rounded-full shadow-md tracking-wider backdrop-blur-xs ${
                isFestive
                  ? "bg-[#D1121B]/90 text-[#FFE58F] border border-[#C89B3C]/60"
                  : "bg-[#D1121B]/90 text-white border border-[#D1121B]/60"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isFestive ? "bg-[#FFE58F]" : "bg-white"}`} />
                <span>{main.badgeText}</span>
              </div>

              {/* High-Contrast Bold Headline */}
              <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase leading-[1.08] font-serif drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                {main.titleLine1} <br className="hidden sm:inline" />
                <span className={
                  isFestive
                    ? "bg-gradient-to-r from-[#FFE58F] via-[#FFD700] to-[#FFA726] bg-clip-text text-transparent"
                    : "bg-gradient-to-r from-[#FF4D4D] via-[#D1121B] to-[#FF8080] bg-clip-text text-transparent"
                }>
                  {main.titleLine2}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-zinc-100 text-xs sm:text-sm md:text-base font-medium line-clamp-2 max-w-md drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                {main.subtitle}
              </p>

              {/* Dual Action CTA Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href={main.buttonLink || "/offers"}
                  className="bg-gradient-to-r from-[#D1121B] to-[#7A1118] hover:from-[#B81017] hover:to-[#4E0B10] text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 sm:py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 uppercase tracking-wider flex items-center gap-1.5"
                >
                  <span>{main.buttonText}</span>
                  <span>›</span>
                </Link>
                {main.button2Text && (
                  <Link
                    href={main.button2Link || "/build-your-pc"}
                    className={
                      isFestive
                        ? "bg-black/60 hover:bg-black/80 backdrop-blur-md text-[#FFE58F] hover:text-white border border-[#C89B3C]/70 font-extrabold text-xs sm:text-sm px-5 py-2.5 sm:py-3 rounded-lg transition-all duration-200 hover:scale-105 uppercase tracking-wider hidden sm:inline-flex items-center gap-1.5 shadow-md"
                        : "bg-transparent hover:bg-white/10 text-white border border-white/70 hover:border-white font-extrabold text-xs sm:text-sm px-5 py-2.5 sm:py-3 rounded-lg transition-all duration-200 hover:scale-105 uppercase tracking-wider hidden sm:inline-flex items-center gap-1.5 shadow-md"
                    }
                  >
                    <span>{main.button2Text}</span>
                    <span>›</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Stacked Promotional Banners (4 cols / ~33%) */}
        <div className="lg:col-span-4 flex flex-row lg:flex-col gap-3.5 sm:gap-4 justify-between">
          
          {/* Top Right: Gaming Fest */}
          <Link 
            href={gaming.buttonLink || "/category/gaming"} 
            className="flex-1 relative w-full aspect-[1536/1024] lg:aspect-[1774/887] rounded-2xl overflow-hidden shadow-md group border border-[#E5E0D7] block bg-[#180406]"
          >
            <Image
              src={gaming.imageSrc || themeFallback.gaming.imageSrc}
              alt={`${gaming.titleLine1} ${gaming.titleLine2}`}
              fill
              sizes="(max-width: 1024px) 50vw, 33vw"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
              priority
            />
            {/* Gaming Fest Overlay with High Contrast (No emoji) */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-transparent flex items-center">
              <div className="p-3.5 sm:p-5 text-white max-w-[75%] space-y-1 sm:space-y-2">
                <div className={`inline-flex items-center gap-1.5 text-[8px] sm:text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full backdrop-blur-xs ${
                  isFestive
                    ? "bg-amber-500/20 text-amber-300 border border-amber-400/50"
                    : "bg-red-500/20 text-red-200 border border-red-500/40"
                }`}>
                  <span className={`w-1 h-1 rounded-full ${isFestive ? "bg-amber-300" : "bg-red-400"}`} />
                  <span>{gaming.badgeText}</span>
                </div>
                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-extrabold text-white uppercase leading-tight font-serif drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                  {gaming.titleLine1} <br />
                  <span className={
                    isFestive
                      ? "bg-gradient-to-r from-[#FFE58F] to-[#FFD700] bg-clip-text text-transparent"
                      : "bg-gradient-to-r from-[#FF4D4D] via-[#D1121B] to-[#FF8080] bg-clip-text text-transparent"
                  }>{gaming.titleLine2}</span>
                </h3>
                <p className="text-[10px] sm:text-xs text-zinc-200 line-clamp-1 font-medium drop-shadow-xs">
                  {gaming.subtitle}
                </p>
                <div className="pt-1">
                  <span className={`inline-flex items-center gap-1 text-[9px] sm:text-[11px] font-bold group-hover:text-white group-hover:translate-x-1 transition-all uppercase tracking-wider ${
                    isFestive ? "text-amber-300" : "text-red-300"
                  }`}>
                    <span>{gaming.buttonText}</span>
                    <span>→</span>
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Bottom Right: Save More Build More */}
          <Link 
            href={builder.buttonLink || "/build-your-pc"} 
            className="flex-1 relative w-full aspect-[1774/887] rounded-2xl overflow-hidden shadow-md group border border-[#E5E0D7] block bg-[#180406]"
          >
            <Image
              src={builder.imageSrc || themeFallback.builder.imageSrc}
              alt={`${builder.titleLine1} ${builder.titleLine2}`}
              fill
              sizes="(max-width: 1024px) 50vw, 33vw"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
              priority
            />
            {/* Save More Overlay (No emoji) */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-transparent flex items-center">
              <div className="p-3.5 sm:p-5 text-white max-w-[75%] space-y-1 sm:space-y-2">
                <div className={`inline-flex items-center gap-1.5 text-[8px] sm:text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full backdrop-blur-xs ${
                  isFestive
                    ? "bg-amber-500/20 text-amber-300 border border-amber-400/50"
                    : "bg-red-500/20 text-red-200 border border-red-500/40"
                }`}>
                  <span className={`w-1 h-1 rounded-full ${isFestive ? "bg-amber-300" : "bg-red-400"}`} />
                  <span>{builder.badgeText}</span>
                </div>
                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-extrabold uppercase leading-tight font-serif drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                  <span className="text-white">{builder.titleLine1} </span>
                  <br />
                  <span className={
                    isFestive
                      ? "bg-gradient-to-r from-[#FFE58F] via-[#FFD700] to-[#FFA726] bg-clip-text text-transparent"
                      : "bg-gradient-to-r from-[#FF4D4D] via-[#D1121B] to-[#FF8080] bg-clip-text text-transparent"
                  }>{builder.titleLine2}</span>
                </h3>
                <p className="text-[10px] sm:text-xs text-zinc-200 line-clamp-1 font-medium drop-shadow-xs">
                  {builder.subtitle}
                </p>
                <div className="pt-1">
                  <span className={`inline-flex items-center gap-1 text-[9px] sm:text-[11px] font-extrabold bg-[#D1121B] hover:bg-[#B81017] px-3 py-1 rounded-md transition-all shadow-md uppercase tracking-wider ${
                    isFestive ? "text-[#FFE58F]" : "text-white"
                  }`}>
                    <span>{builder.buttonText}</span>
                    <span>›</span>
                  </span>
                </div>
              </div>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
