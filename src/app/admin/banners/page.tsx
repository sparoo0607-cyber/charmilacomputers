"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import { useStoreTheme } from "@/hooks/useStoreTheme";
import {
  HomePageMediaState,
  DEFAULT_HOME_MEDIA,
  STORE_IMAGE_PRESETS,
  loadHomeMedia,
  saveHomeMedia,
  getThemeMedia,
  readImageFileAsDataUrl,
  CategoryCardMedia,
} from "@/data/homeMedia";

type MainTab = "hero" | "promos" | "flagship" | "components" | "gaming" | "accessories";

export default function BannerEditorPage() {
  const { showToast } = useAdmin();
  const activeStoreTheme = useStoreTheme();
  const [selectedTheme, setSelectedTheme] = useState<"festive" | "standard">(activeStoreTheme);
  const [activeTab, setActiveTab] = useState<MainTab>("hero");
  const [media, setMedia] = useState<HomePageMediaState>(DEFAULT_HOME_MEDIA);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeHeroSubtab, setActiveHeroSubtab] = useState<"main" | "gaming" | "builder">("main");
  const [activePromoSubtab, setActivePromoSubtab] = useState<"buildDifferent" | "templeNight">("buildDifferent");

  useEffect(() => {
    Promise.resolve().then(() => setSelectedTheme(activeStoreTheme));
  }, [activeStoreTheme]);

  useEffect(() => {
    async function init() {
      const data = await loadHomeMedia(selectedTheme);
      setMedia(data);
      setHydrated(true);
    }
    init();
  }, [selectedTheme]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveHomeMedia(media, selectedTheme);
      showToast(`✓ All ${selectedTheme === "standard" ? "Standard" : "Festive"} homepage media & banners saved live!`);
    } catch (err) {
      console.error(err);
      showToast("✓ Changes saved locally");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    if (confirm(`Are you sure you want to reset all ${selectedTheme === "standard" ? "Standard Corporate" : "Vinayaka Festive"} images and banners to defaults?`)) {
      const def = getThemeMedia(selectedTheme);
      setMedia(def);
      saveHomeMedia(def, selectedTheme);
      showToast(`Restored all ${selectedTheme} homepage images & banners to defaults`);
    }
  }


  // Update Category Card in one of the lists
  function updateCategory(
    section: "components" | "gaming" | "accessories",
    index: number,
    field: keyof CategoryCardMedia,
    value: string
  ) {
    setMedia((prev) => {
      const list = [...prev[section]];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, [section]: list };
    });
  }

  if (!hydrated) {
    return (
      <div className="p-8 text-center text-zinc-500 font-mono text-xs animate-pulse">
        Loading Storefront Media Manager…
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E0D7] shadow-sm p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-[#D1121B] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded tracking-wider">
              Storefront Customizer
            </span>
            <h2 className="font-extrabold text-base sm:text-lg text-zinc-950">
              Homepage Media &amp; Banner Manager
            </h2>
          </div>
          <p className="text-xs text-zinc-500 max-w-3xl leading-relaxed">
            Update every image, promotional banner, category card, and flagship spotlight on the homepage. Changes are synchronized live across all customer devices.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5"
          >
            <span>Live Store ↗</span>
          </Link>
          <button
            type="button"
            onClick={handleReset}
            className="bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors"
          >
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#D1121B] hover:bg-[#B81017] text-white font-extrabold text-xs px-5 py-2 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save All Changes"}
          </button>
        </div>
      </div>

      {/* Theme Selector Strip */}
      <div className="flex items-center justify-between bg-zinc-100 p-2 rounded-xl border border-zinc-200 text-xs">
        <span className="font-bold text-zinc-600 pl-2">Editing Banners &amp; Images For:</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedTheme("festive")}
            className={`px-3.5 py-1.5 rounded-lg font-extrabold transition-all ${
              selectedTheme === "festive"
                ? "bg-[#D1121B] text-white shadow-sm"
                : "bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-200"
            }`}
          >
            🏮 Vinayaka Festive Theme {activeStoreTheme === "festive" && "(Active Store)"}
          </button>
          <button
            type="button"
            onClick={() => setSelectedTheme("standard")}
            className={`px-3.5 py-1.5 rounded-lg font-extrabold transition-all ${
              selectedTheme === "standard"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-200"
            }`}
          >
            💻 Standard Corporate Theme {activeStoreTheme === "standard" && "(Active Store)"}
          </button>
        </div>
      </div>


      {/* Main Category Tabs */}
      <div className="flex border-b border-[#E5E0D7] gap-2 overflow-x-auto pb-px scrollbar-none">
        <TabButton
          active={activeTab === "hero"}
          onClick={() => setActiveTab("hero")}
          label="Top Hero Banners (3)"
        />
        <TabButton
          active={activeTab === "promos"}
          onClick={() => setActiveTab("promos")}
          label="Promotional Strips (2)"
        />
        <TabButton
          active={activeTab === "flagship"}
          onClick={() => setActiveTab("flagship")}
          label="Flagship Beast Spotlight (1)"
        />
        <TabButton
          active={activeTab === "components"}
          onClick={() => setActiveTab("components")}
          label="PC Components (10)"
        />
        <TabButton
          active={activeTab === "gaming"}
          onClick={() => setActiveTab("gaming")}
          label="Gamer Zone (5)"
        />
        <TabButton
          active={activeTab === "accessories"}
          onClick={() => setActiveTab("accessories")}
          label="Accessories &amp; Peripherals (10)"
        />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HERO BANNERS (Main, Gaming, Builder)                   */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "hero" && (
        <div className="space-y-6">
          {/* Subtabs for Hero */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveHeroSubtab("main")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeHeroSubtab === "main"
                  ? "bg-[#1B1B1B] text-white shadow-sm"
                  : "bg-white border border-[#E5E0D7] text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              Main Flagship Hero (Left 67%)
            </button>
            <button
              onClick={() => setActiveHeroSubtab("gaming")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeHeroSubtab === "gaming"
                  ? "bg-[#1B1B1B] text-white shadow-sm"
                  : "bg-white border border-[#E5E0D7] text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              Gaming Fest Banner (Top Right 33%)
            </button>
            <button
              onClick={() => setActiveHeroSubtab("builder")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeHeroSubtab === "builder"
                  ? "bg-[#1B1B1B] text-white shadow-sm"
                  : "bg-white border border-[#E5E0D7] text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              PC Builder Deals (Bottom Right 33%)
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Form */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E5E0D7] p-6 space-y-4 shadow-xs">
              <h3 className="font-bold text-sm text-zinc-900 border-b border-zinc-100 pb-2 capitalize">
                Edit {activeHeroSubtab} Hero Banner
              </h3>

              <ImagePickerField
                label="Banner Image Source"
                value={media.hero[activeHeroSubtab].imageSrc}
                onChange={(newUrl) =>
                  setMedia((prev) => ({
                    ...prev,
                    hero: {
                      ...prev.hero,
                      [activeHeroSubtab]: { ...prev.hero[activeHeroSubtab], imageSrc: newUrl },
                    },
                  }))
                }
              />

              <Field label="Badge Accent Text">
                <input
                  value={media.hero[activeHeroSubtab].badgeText}
                  onChange={(e) =>
                    setMedia((prev) => ({
                      ...prev,
                      hero: {
                        ...prev.hero,
                        [activeHeroSubtab]: { ...prev.hero[activeHeroSubtab], badgeText: e.target.value },
                      },
                    }))
                  }
                  className="input-style"
                  placeholder="PROMO BADGE"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Headline Line 1">
                  <input
                    value={media.hero[activeHeroSubtab].titleLine1}
                    onChange={(e) =>
                      setMedia((prev) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          [activeHeroSubtab]: { ...prev.hero[activeHeroSubtab], titleLine1: e.target.value },
                        },
                      }))
                    }
                    className="input-style"
                  />
                </Field>
                <Field label="Headline Line 2 (Accent)">
                  <input
                    value={media.hero[activeHeroSubtab].titleLine2}
                    onChange={(e) =>
                      setMedia((prev) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          [activeHeroSubtab]: { ...prev.hero[activeHeroSubtab], titleLine2: e.target.value },
                        },
                      }))
                    }
                    className="input-style"
                  />
                </Field>
              </div>

              <Field label="Subtitle / Description">
                <textarea
                  rows={2}
                  value={media.hero[activeHeroSubtab].subtitle}
                  onChange={(e) =>
                    setMedia((prev) => ({
                      ...prev,
                      hero: {
                        ...prev.hero,
                        [activeHeroSubtab]: { ...prev.hero[activeHeroSubtab], subtitle: e.target.value },
                      },
                    }))
                  }
                  className="input-style resize-none"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Primary Button Text">
                  <input
                    value={media.hero[activeHeroSubtab].buttonText}
                    onChange={(e) =>
                      setMedia((prev) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          [activeHeroSubtab]: { ...prev.hero[activeHeroSubtab], buttonText: e.target.value },
                        },
                      }))
                    }
                    className="input-style"
                  />
                </Field>
                <Field label="Primary Button Link">
                  <input
                    value={media.hero[activeHeroSubtab].buttonLink}
                    onChange={(e) =>
                      setMedia((prev) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          [activeHeroSubtab]: { ...prev.hero[activeHeroSubtab], buttonLink: e.target.value },
                        },
                      }))
                    }
                    className="input-style font-mono text-[11px]"
                  />
                </Field>
              </div>

              {activeHeroSubtab === "main" && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100">
                  <Field label="Secondary Button Text (Optional)">
                    <input
                      value={media.hero.main.button2Text || ""}
                      onChange={(e) =>
                        setMedia((prev) => ({
                          ...prev,
                          hero: {
                            ...prev.hero,
                            main: { ...prev.hero.main, button2Text: e.target.value },
                          },
                        }))
                      }
                      className="input-style"
                    />
                  </Field>
                  <Field label="Secondary Button Link">
                    <input
                      value={media.hero.main.button2Link || ""}
                      onChange={(e) =>
                        setMedia((prev) => ({
                          ...prev,
                          hero: {
                            ...prev.hero,
                            main: { ...prev.hero.main, button2Link: e.target.value },
                          },
                        }))
                      }
                      className="input-style font-mono text-[11px]"
                    />
                  </Field>
                </div>
              )}
            </div>

            {/* Live Preview */}
            <div className="lg:col-span-6 space-y-3">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Live Banner Preview
              </span>
              <div className="relative w-full aspect-[1774/887] rounded-2xl overflow-hidden shadow-lg border border-[#E5E0D7] bg-[#2A0609]">
                <Image
                  src={media.hero[activeHeroSubtab].imageSrc}
                  alt={media.hero[activeHeroSubtab].titleLine1}
                  fill
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent flex items-center p-6 text-white space-y-2">
                  <div className="max-w-[75%] space-y-2">
                    <span className="inline-block bg-[#D1121B] text-[#FFE58F] text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-amber-400/40">
                      {media.hero[activeHeroSubtab].badgeText}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black uppercase leading-tight font-serif">
                      {media.hero[activeHeroSubtab].titleLine1} <br />
                      <span className="text-[#FFD700]">{media.hero[activeHeroSubtab].titleLine2}</span>
                    </h3>
                    <p className="text-xs text-zinc-200 line-clamp-2">
                      {media.hero[activeHeroSubtab].subtitle}
                    </p>
                    <div className="pt-2 flex items-center gap-2">
                      <span className="bg-[#D1121B] text-white text-xs font-bold px-3 py-1.5 rounded">
                        {media.hero[activeHeroSubtab].buttonText} ›
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. PROMOTIONAL STRIPS (Build Different & Temple Night)         */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "promos" && (
        <div className="space-y-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActivePromoSubtab("buildDifferent")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activePromoSubtab === "buildDifferent"
                  ? "bg-[#1B1B1B] text-white shadow-sm"
                  : "bg-white border border-[#E5E0D7] text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              01. Build Different Wide Showcase Banner
            </button>
            <button
              onClick={() => setActivePromoSubtab("templeNight")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activePromoSubtab === "templeNight"
                  ? "bg-[#1B1B1B] text-white shadow-sm"
                  : "bg-white border border-[#E5E0D7] text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              02. Temple Night Mega Fest Panorama Banner
            </button>
          </div>

          {activePromoSubtab === "buildDifferent" ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E5E0D7] p-6 space-y-4 shadow-xs">
                <h3 className="font-bold text-sm text-zinc-900 border-b border-zinc-100 pb-2">
                  Build Different Custom PC Banner
                </h3>

                <ImagePickerField
                  label="Banner Image"
                  value={media.promos.buildDifferent.image}
                  onChange={(val) =>
                    setMedia((prev) => ({
                      ...prev,
                      promos: {
                        ...prev.promos,
                        buildDifferent: { ...prev.promos.buildDifferent, image: val },
                      },
                    }))
                  }
                />

                <Field label="Destination Link URL">
                  <input
                    value={media.promos.buildDifferent.link}
                    onChange={(e) =>
                      setMedia((prev) => ({
                        ...prev,
                        promos: {
                          ...prev.promos,
                          buildDifferent: { ...prev.promos.buildDifferent, link: e.target.value },
                        },
                      }))
                    }
                    className="input-style font-mono text-[11px]"
                    placeholder="/build-your-pc"
                  />
                </Field>

                <Field label="Alt Description">
                  <input
                    value={media.promos.buildDifferent.alt || ""}
                    onChange={(e) =>
                      setMedia((prev) => ({
                        ...prev,
                        promos: {
                          ...prev.promos,
                          buildDifferent: { ...prev.promos.buildDifferent, alt: e.target.value },
                        },
                      }))
                    }
                    className="input-style"
                  />
                </Field>
              </div>

              <div className="lg:col-span-6 space-y-3">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Live Banner Preview
                </span>
                <div className="relative w-full aspect-[1756/896] rounded-2xl overflow-hidden shadow-lg border border-[#E5E0D7] bg-[#120B05]">
                  <Image
                    src={media.promos.buildDifferent.image}
                    alt={media.promos.buildDifferent.alt || "Build Different"}
                    fill
                    className="object-cover object-center"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E5E0D7] p-6 space-y-4 shadow-xs">
                <h3 className="font-bold text-sm text-zinc-900 border-b border-zinc-100 pb-2">
                  Temple Night Mega Fest Panoramic Banner
                </h3>

                <ImagePickerField
                  label="Background Panorama Image"
                  value={media.promos.templeNight.image}
                  onChange={(val) =>
                    setMedia((prev) => ({
                      ...prev,
                      promos: {
                        ...prev.promos,
                        templeNight: { ...prev.promos.templeNight, image: val },
                      },
                    }))
                  }
                />

                <Field label="Badge Text">
                  <input
                    value={media.promos.templeNight.badge || ""}
                    onChange={(e) =>
                      setMedia((prev) => ({
                        ...prev,
                        promos: {
                          ...prev.promos,
                          templeNight: { ...prev.promos.templeNight, badge: e.target.value },
                        },
                      }))
                    }
                    className="input-style"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Headline Line 1">
                    <input
                      value={media.promos.templeNight.titleLine1 || ""}
                      onChange={(e) =>
                        setMedia((prev) => ({
                          ...prev,
                          promos: {
                            ...prev.promos,
                            templeNight: { ...prev.promos.templeNight, titleLine1: e.target.value },
                          },
                        }))
                      }
                      className="input-style"
                    />
                  </Field>
                  <Field label="Headline Line 2 (Gold Gradient)">
                    <input
                      value={media.promos.templeNight.titleLine2 || ""}
                      onChange={(e) =>
                        setMedia((prev) => ({
                          ...prev,
                          promos: {
                            ...prev.promos,
                            templeNight: { ...prev.promos.templeNight, titleLine2: e.target.value },
                          },
                        }))
                      }
                      className="input-style"
                    />
                  </Field>
                </div>

                <Field label="Description Subtitle">
                  <textarea
                    rows={2}
                    value={media.promos.templeNight.subtitle || ""}
                    onChange={(e) =>
                      setMedia((prev) => ({
                        ...prev,
                        promos: {
                          ...prev.promos,
                          templeNight: { ...prev.promos.templeNight, subtitle: e.target.value },
                        },
                      }))
                    }
                    className="input-style resize-none"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Primary Button Text">
                    <input
                      value={media.promos.templeNight.buttonText || ""}
                      onChange={(e) =>
                        setMedia((prev) => ({
                          ...prev,
                          promos: {
                            ...prev.promos,
                            templeNight: { ...prev.promos.templeNight, buttonText: e.target.value },
                          },
                        }))
                      }
                      className="input-style"
                    />
                  </Field>
                  <Field label="Primary Button Link">
                    <input
                      value={media.promos.templeNight.buttonLink || ""}
                      onChange={(e) =>
                        setMedia((prev) => ({
                          ...prev,
                          promos: {
                            ...prev.promos,
                            templeNight: { ...prev.promos.templeNight, buttonLink: e.target.value },
                          },
                        }))
                      }
                      className="input-style font-mono text-[11px]"
                    />
                  </Field>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-3">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Live Banner Preview
                </span>
                <div className="relative w-full aspect-[1983/793] rounded-2xl overflow-hidden shadow-lg border border-[#E5E0D7] bg-[#080d19]">
                  <Image
                    src={media.promos.templeNight.image}
                    alt={media.promos.templeNight.titleLine1 || "Temple Night"}
                    fill
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent flex items-center p-6 text-white space-y-2">
                    <div className="max-w-[80%] space-y-1.5">
                      <span className="inline-block bg-[#D1121B] text-[#FFE58F] text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                        {media.promos.templeNight.badge}
                      </span>
                      <h4 className="text-lg sm:text-xl font-black uppercase leading-tight font-serif">
                        {media.promos.templeNight.titleLine1} <br />
                        <span className="text-[#FFD700]">{media.promos.templeNight.titleLine2}</span>
                      </h4>
                      <p className="text-[10px] text-zinc-200 line-clamp-2">
                        {media.promos.templeNight.subtitle}
                      </p>
                      <div className="pt-1 flex items-center gap-2">
                        <span className="bg-[#D1121B] text-white text-[10px] font-bold px-3 py-1 rounded">
                          {media.promos.templeNight.buttonText} ›
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. FLAGSHIP BEAST SPOTLIGHT                                  */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "flagship" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E5E0D7] p-6 space-y-4 shadow-xs">
            <h3 className="font-bold text-sm text-zinc-900 border-b border-zinc-100 pb-2">
              MSI RTX 4090 Flagship Beast Spotlight
            </h3>

            <ImagePickerField
              label="Flagship Hardware Image"
              value={media.flagship.image}
              onChange={(val) =>
                setMedia((prev) => ({
                  ...prev,
                  flagship: { ...prev.flagship, image: val },
                }))
              }
            />

            <div className="grid grid-cols-2 gap-3">
              <Field label="Badge">
                <input
                  value={media.flagship.badge}
                  onChange={(e) =>
                    setMedia((prev) => ({
                      ...prev,
                      flagship: { ...prev.flagship, badge: e.target.value },
                    }))
                  }
                  className="input-style"
                />
              </Field>
              <Field label="Brand / Series">
                <input
                  value={media.flagship.series}
                  onChange={(e) =>
                    setMedia((prev) => ({
                      ...prev,
                      flagship: { ...prev.flagship, series: e.target.value },
                    }))
                  }
                  className="input-style"
                />
              </Field>
            </div>

            <Field label="Product Name">
              <input
                value={media.flagship.name}
                onChange={(e) =>
                  setMedia((prev) => ({
                    ...prev,
                    flagship: { ...prev.flagship, name: e.target.value },
                  }))
                }
                className="input-style"
              />
            </Field>

            <Field label="Specifications / Highlights">
              <textarea
                rows={2}
                value={media.flagship.specs}
                onChange={(e) =>
                  setMedia((prev) => ({
                    ...prev,
                    flagship: { ...prev.flagship, specs: e.target.value },
                  }))
                }
                className="input-style resize-none"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Offer Price (₹)">
                <input
                  type="number"
                  value={media.flagship.price}
                  onChange={(e) =>
                    setMedia((prev) => ({
                      ...prev,
                      flagship: { ...prev.flagship, price: Number(e.target.value) || 0 },
                    }))
                  }
                  className="input-style font-mono"
                />
              </Field>
              <Field label="MRP (₹)">
                <input
                  type="number"
                  value={media.flagship.mrp}
                  onChange={(e) =>
                    setMedia((prev) => ({
                      ...prev,
                      flagship: { ...prev.flagship, mrp: Number(e.target.value) || 0 },
                    }))
                  }
                  className="input-style font-mono"
                />
              </Field>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-6 space-y-3">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Live Spotlight Preview
            </span>
            <div className="bg-gradient-to-br from-[#1B1B1B] via-[#263946] to-[#1B1B1B] text-white rounded-2xl p-6 shadow-xl border border-amber-500/40 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="bg-gradient-to-r from-[#C89B3C] to-[#E87516] text-black font-black text-[9px] uppercase px-3 py-1 rounded-full">
                  {media.flagship.badge}
                </span>
                <span className="text-[10px] text-amber-300 font-semibold bg-white/10 px-2 py-0.5 rounded">
                  Live Showcase
                </span>
              </div>

              <div className="relative w-full h-44 my-3 flex items-center justify-center">
                <Image
                  src={media.flagship.image}
                  alt={media.flagship.name}
                  fill
                  className="object-contain p-2"
                />
              </div>

              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                {media.flagship.series}
              </span>
              <h4 className="text-base font-extrabold text-white">{media.flagship.name}</h4>
              <p className="text-xs text-zinc-300 mt-1">{media.flagship.specs}</p>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-lg font-black text-[#FFE58F]">
                  ₹{media.flagship.price.toLocaleString()}
                </span>
                <span className="bg-[#D1121B] text-white text-xs font-bold px-4 py-1.5 rounded">
                  ADD TO CART
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. PC COMPONENT CATEGORY IMAGES (10 Cards)                    */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "components" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-center justify-between">
            <span>
              💡 <strong>Tip:</strong> You can upload custom transparent PNGs or choose from preset hardware icons. Changes apply directly to the 5x2 PC Components section.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            {media.components.map((item, index) => (
              <CategoryCardEditor
                key={item.id}
                item={item}
                onChange={(field, val) => updateCategory("components", index, field, val)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. GAMER ZONE IMAGES (5 Cards)                                */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "gaming" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            {media.gaming.map((item, index) => (
              <CategoryCardEditor
                key={item.id}
                item={item}
                onChange={(field, val) => updateCategory("gaming", index, field, val)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. ACCESSORIES & PERIPHERALS (10 Cards)                       */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "accessories" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            {media.accessories.map((item, index) => (
              <CategoryCardEditor
                key={item.id}
                item={item}
                onChange={(field, val) => updateCategory("accessories", index, field, val)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================================
// SUBCOMPONENTS
// =====================================================================

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
        active
          ? "border-[#D1121B] text-[#D1121B] bg-red-50/50"
          : "border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300"
      }`}
    >
      {label}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700">{label}</label>
      {children}
    </div>
  );
}

function ImagePickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      onChange(dataUrl);
    } catch (err) {
      console.error("Image upload failed:", err);
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700">{label}</label>

      {/* Preset selector */}
      <select
        onChange={(e) => {
          if (e.target.value) onChange(e.target.value);
        }}
        value=""
        className="w-full border border-[#E5E0D7] bg-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#D1121B]"
      >
        <option value="">-- Choose preset from store media library --</option>
        {STORE_IMAGE_PRESETS.map((p) => (
          <option key={p.value} value={p.value}>
            [{p.category}] {p.label}
          </option>
        ))}
      </select>

      {/* URL input and upload button */}
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/images/..."
          className="flex-1 border border-[#E5E0D7] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#D1121B]"
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors"
        >
          Upload File
        </button>
      </div>
    </div>
  );
}

function CategoryCardEditor({
  item,
  onChange,
}: {
  item: CategoryCardMedia;
  onChange: (field: keyof CategoryCardMedia, value: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      onChange("image", dataUrl);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="bg-white border border-[#E5E0D7] rounded-2xl p-4 shadow-xs space-y-3 flex flex-col justify-between group hover:border-[#D1121B]/60 transition-all">
      <div className="space-y-2.5">
        {/* Preview image */}
        <div className="relative w-full aspect-square rounded-xl bg-[#FAF7F2] overflow-hidden flex items-center justify-center border border-zinc-100">
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="150px"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Quick Upload / Select */}
        <div className="flex gap-1.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-bold py-1.5 rounded-lg transition-colors"
          >
            Change Image
          </button>
        </div>

        {/* Title */}
        <Field label="Category Title">
          <input
            value={item.name}
            onChange={(e) => onChange("name", e.target.value)}
            className="input-style text-xs font-bold"
          />
        </Field>

        {/* Subtitle / Description */}
        <Field label="Description">
          <input
            value={item.desc}
            onChange={(e) => onChange("desc", e.target.value)}
            className="input-style text-xs"
          />
        </Field>

        {/* Starting Price */}
        <Field label="Starting Price">
          <input
            value={item.startPrice}
            onChange={(e) => onChange("startPrice", e.target.value)}
            className="input-style text-xs font-mono"
          />
        </Field>
      </div>
    </div>
  );
}
