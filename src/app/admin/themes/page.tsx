"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import { CheckIcon } from "@/components/icons";
import { applyThemeMedia, getThemeMedia } from "@/data/homeMedia";
import { useStoreTheme } from "@/hooks/useStoreTheme";

import { ThemeId } from "@/lib/theme";

interface ThemeDefinition {
  id: ThemeId;
  name: string;
  badge: string;
  folder: string;
  tagline: string;
  headerBg: string;
  accentColor: string;
  badgeBg: string;
  bannerImage: string;
  description: string;
  highlights: string[];
}

const DUSSARA_DAYS = [
  { num: 1, name: "Day 1 - Sri Shailaputri Devi", goddess: "Swarna Kavachalankruta Durga", color: "from-[#800000] via-[#A52A2A] to-[#4A0000]" },
  { num: 2, name: "Day 2 - Sri Brahmacharini Devi", goddess: "Sri Bala Tripura Sundari", color: "from-[#8B0000] via-[#B22222] to-[#5C0000]" },
  { num: 3, name: "Day 3 - Sri Chandraghanta Devi", goddess: "Sri Gayatri Devi", color: "from-[#7A1118] via-[#800020] to-[#3D0000]" },
  { num: 4, name: "Day 4 - Sri Kushmanda Devi", goddess: "Sri Annapurna Devi", color: "from-[#A0522D] via-[#B8860B] to-[#5C4033]" },
  { num: 5, name: "Day 5 - Sri Skandamata Devi", goddess: "Sri Lakshmi Devi", color: "from-[#D4AF37] via-[#FFD700] to-[#8B6508]" },
  { num: 6, name: "Day 6 - Sri Katyayani Devi", goddess: "Sri Saraswati Devi", color: "from-[#C04000] via-[#CD5C5C] to-[#602000]" },
  { num: 7, name: "Day 7 - Sri Kalaratri Devi", goddess: "Sri Lalitha Tripura Sundari", color: "from-[#4B0082] via-[#8A2BE2] to-[#2E004B]" },
  { num: 8, name: "Day 8 - Sri Mahagauri Devi", goddess: "Sri Mahishasura Mardhini", color: "from-[#800080] via-[#9932CC] to-[#400040]" },
  { num: 9, name: "Day 9 - Sri Siddhidatri Devi (Vijaya Dasami)", goddess: "Sri Raja Rajeshwari Devi", color: "from-[#D1121B] via-[#7A1118] to-[#3D0000]" },
];

const THEMES: ThemeDefinition[] = [
  {
    id: "festive",
    name: "Vinayaka Festive Special Theme",
    badge: "Red & Gold Festival Special",
    folder: "public/themes/vinayaka (33 High-Res Assets)",
    tagline: "Red & Gold festive styling, Vinayaka Chavithi banners, glowing badges, 33 festival category assets",
    headerBg: "from-[#2A0609] via-[#4A0A10] to-[#1F0407]",
    accentColor: "#D1121B",
    badgeBg: "bg-[#D1121B] text-[#FFE58F]",
    bannerImage: "/themes/vinayaka/banner-33.png",
    description:
      "Full festive transformation across all 33 homepage banners, promotional showcases, component category icons, and gamer zone graphics with celebratory red & gold styling.",
    highlights: [
      "Hero Flagship Banner (banner-33.png)",
      "Gaming Fest Banner (banner-32.png)",
      "PC Builder Deals Banner (banner-31.png)",
      "Build Different Wide Panorama (banner-30.png)",
      "Temple Night Celebration Panorama (banner-16.png)",
      "All 10 PC Component Category Images (banner-17 to banner-26)",
      "All 5 Gamer Zone Category Images (banner-11 to banner-15)",
      "All 10 Peripherals & Accessory Images (banner-1 to banner-10)",
    ],
  },
  {
    id: "standard",
    name: "Standard Corporate Tech Theme",
    badge: "Clean Tech & Minimal Workstation",
    folder: "public/themes/standard (33 High-Res Assets)",
    tagline: "Sleek dark tech styling, official brand warranty badges, minimal workstation layout, 33 corporate assets",
    headerBg: "from-[#141B22] via-[#1F2937] to-[#0D1117]",
    accentColor: "#2563EB",
    badgeBg: "bg-blue-600 text-white",
    bannerImage: "/themes/standard/hero-banner-1.png",
    description:
      "Clean, modern corporate tech store design with focus on official brand warranties, technical specifications, minimal workstation hardware highlights, and clean modern tech category assets.",
    highlights: [
      "Standard Workstation Hero Banner (hero-banner-1.png)",
      "240Hz High-Refresh Displays Banner (hero-banner-2.png)",
      "Next-Gen Hardware Deals Banner (hero-banner-3.png)",
      "Custom Rig Configurator Wide Banner (promo-build-different.png)",
      "Enterprise Workstations Panorama (promo-workstations.png)",
      "All 10 PC Component Category Images (PROCESSORS.png, MOTHERBOARDS.png, etc.)",
      "All 5 Standard Gamer Zone Category Images (Gaming Keyboards.png, Gaming mice.png, etc.)",
      "All 10 Peripherals & Accessory Images (printers.png, pen tablets.png, etc.)",
    ],
  },
  ...DUSSARA_DAYS.map((d) => ({
    id: `dussara-d${d.num}` as ThemeId,
    name: `Dussara Navratri ${d.name}`,
    badge: `Dussehra Day ${d.num} Special · ${d.goddess}`,
    folder: `public/themes/dussara/D${d.num} (5 High-Res Assets)`,
    tagline: `Navratri Day ${d.num} festive banners & Durga Navaratri celebration graphics (${d.goddess})`,
    headerBg: d.color,
    accentColor: "#D1121B",
    badgeBg: "bg-amber-500 text-zinc-950 font-black",
    bannerImage: `/themes/dussara/D${d.num}/1.png`,
    description: `Dussehra Day ${d.num} Navratri theme honoring ${d.goddess}. Automatically swaps homepage main hero, gaming fest banner, PC builder showcase, and celebration panoramas with Day ${d.num} assets.`,
    highlights: [
      `Main Hero Banner (D${d.num}/1.png)`,
      `Gaming Fest Banner (D${d.num}/2.png)`,
      `PC Builder Deals Banner (D${d.num}/3.png)`,
      `Build Different Wide Panorama (D${d.num}/4.png)`,
      `Navratri Celebration Panorama (D${d.num}/5.png)`,
    ],
  })),
];

export default function ThemesPage() {
  const { settings, updateSettings, showToast } = useAdmin();
  const storeTheme = useStoreTheme();
  const currentTheme = (storeTheme || settings.activeTheme || "festive") as ThemeId;
  const [busy, setBusy] = useState(false);

  async function handleSelectTheme(themeId: ThemeId) {
    const selected = THEMES.find((t) => t.id === themeId);
    if (!selected) return;

    setBusy(true);

    // Immediately write to localStorage & dispatch so the page and all other
    // hooks update before the async Supabase write completes.
    if (typeof window !== "undefined") {
      localStorage.setItem("charmila_active_theme", themeId);
      try {
        const saved = localStorage.getItem("charmila_admin_settings_v1");
        const parsed = saved ? JSON.parse(saved) : {};
        localStorage.setItem("charmila_admin_settings_v1", JSON.stringify({ ...parsed, activeTheme: themeId }));
      } catch {}
      window.dispatchEvent(new CustomEvent("charmila_theme_changed", { detail: themeId }));
      window.dispatchEvent(new Event("charmila_banners_updated"));
    }

    updateSettings({ activeTheme: themeId });

    try {
      await applyThemeMedia(themeId);
      showToast(`✓ Activated "${selected.name}" — all 33+ homepage images and banners updated!`);
    } catch (e) {
      console.error(e);
      showToast(`✓ Activated "${selected.name}" locally`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E5E0D7] shadow-2xs">
        <div>
          <span className="text-[10px] font-black text-[#D1121B] uppercase tracking-widest block mb-1">
            Storefront Customization
          </span>
          <h1 className="text-xl font-black text-[#1B1B1B]">Themes &amp; Visual Style</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Switching themes automatically replaces <strong>all 33+ homepage images, promotional banners, and category cards</strong> from <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-800">public/themes</code>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5"
          >
            <span>Live Store ↗</span>
          </Link>
          <div className="flex items-center gap-2 bg-zinc-100 p-1.5 rounded-xl text-xs font-bold shrink-0">
            <span className="text-zinc-500 pl-2">Active:</span>
            <span className="bg-[#1B1B1B] text-white px-3 py-1 rounded-lg uppercase tracking-wider text-[11px]">
              {currentTheme === "festive" ? "Festive Theme" : "Standard Theme"}
            </span>
          </div>
        </div>
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {THEMES.map((theme) => {
          const isActive = currentTheme === theme.id;
          const themeMedia = getThemeMedia(theme.id);

          return (
            <div
              key={theme.id}
              className={`rounded-3xl border-2 transition-all duration-300 flex flex-col justify-between overflow-hidden bg-white shadow-md ${
                isActive
                  ? "border-[#D1121B] ring-4 ring-red-500/10"
                  : "border-[#E5E0D7] hover:border-zinc-400"
              }`}
            >
              <div>
                {/* Hero Header Banner Preview */}
                <div className={`relative h-48 bg-gradient-to-r ${theme.headerBg} p-5 flex flex-col justify-between text-white overflow-hidden`}>
                  <Image
                    src={theme.bannerImage}
                    alt={theme.name}
                    fill
                    className="object-cover object-center opacity-60 mix-blend-overlay"
                  />
                  <div className="relative z-10 flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs ${theme.badgeBg}`}>
                      {theme.badge}
                    </span>
                    {isActive && (
                      <span className="bg-white text-zinc-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <CheckIcon className="w-3.5 h-3.5 text-green-600" /> Active Theme
                      </span>
                    )}
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-lg font-black">{theme.name}</h3>
                    <p className="text-xs text-white/80 line-clamp-1">{theme.tagline}</p>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Asset Source Folder
                    </span>
                    <p className="text-xs font-mono font-semibold text-zinc-700 bg-zinc-50 p-2 rounded-lg border border-zinc-200">
                      📂 {theme.folder}
                    </p>
                  </div>

                  <p className="text-xs text-zinc-600 leading-relaxed">{theme.description}</p>

                  {/* Included Assets Preview List */}
                  <div className="space-y-2 pt-2 border-t border-zinc-100">
                    <span className="text-[11px] font-bold text-zinc-800 uppercase tracking-wider block">
                      What Changes on Home Page:
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-zinc-600">
                      {theme.highlights.map((h, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                          <span className="truncate">{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Category Images Thumbnail Strip */}
                  <div className="pt-3 border-t border-zinc-100">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                      Sample Component &amp; Banner Assets:
                    </span>
                    <div className="grid grid-cols-5 gap-2">
                      {themeMedia.components.slice(0, 5).map((comp, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg bg-zinc-50 border border-zinc-200 overflow-hidden" title={comp.name}>
                          <Image src={comp.image} alt={comp.name} fill className="object-contain p-1" sizes="60px" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => handleSelectTheme(theme.id)}
                  disabled={busy || isActive}
                  className={`w-full py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
                    isActive
                      ? "bg-zinc-100 text-zinc-400 cursor-default"
                      : "bg-[#1B1B1B] hover:bg-[#D1121B] text-white hover:shadow-md active:scale-[0.99]"
                  }`}
                >
                  {isActive ? (
                    <>
                      <CheckIcon className="w-4 h-4 text-green-600" />
                      Theme Currently Active
                    </>
                  ) : busy ? (
                    "Activating 33+ Assets…"
                  ) : (
                    `Apply ${theme.name} (Replace All Images)`
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
