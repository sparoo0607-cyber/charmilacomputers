"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import HeroCarousel from "@/components/HeroCarousel";
import PageViewTracker from "@/components/PageViewTracker";
import { useCart } from "@/context/CartContext";
import { CheckIcon, HeartIcon, StarIcon, BoltIcon, ChevronRightIcon, TruckIcon, ShieldIcon, HeadsetSupportIcon, CloseIcon } from "@/components/icons";
import { useStoreTheme } from "@/hooks/useStoreTheme";
import {
  loadHomeMedia,
  getThemeMedia,
  VINAYAKA_THEME_MEDIA,
  STANDARD_THEME_MEDIA,
  HomePageMediaState,
} from "@/data/homeMedia";

// Vinayaka Festive Picks (6 Featured Products)
const festivePicks = [
  {
    id: "ssd-1",
    brand: "Western Digital",
    name: "WD Green 250GB M.2 NVMe PCIe SSD",
    specs: "250GB • 2,400 MB/s Read • 3-Yr Warranty",
    rating: 4.8,
    reviews: 142,
    price: 1650,
    mrp: 2100,
    discount: 21,
    image: "/images/products/ssd.png",
  },
  {
    id: "cpu-5",
    brand: "AMD",
    name: "AMD Ryzen 5 5600G Desktop Processor",
    specs: "6 Cores / 12 Threads • Vega 7 Graphics • AM4",
    rating: 4.9,
    reviews: 320,
    price: 13800,
    mrp: 14500,
    discount: 5,
    image: "/images/products/ryzen-5-5600g.png",
  },
  {
    id: "ram-2",
    brand: "Corsair",
    name: "Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz",
    specs: "16GB Dual Kit • 3200MHz CL16 • Anodized Black",
    rating: 4.8,
    reviews: 210,
    price: 3600,
    mrp: 4200,
    discount: 14,
    image: "/images/products/corsair-lpx-16gb.png",
  },
  {
    id: "ram-5",
    brand: "Kingston",
    name: "Kingston Fury Beast 32GB (2x16GB) DDR5 5200MHz RGB",
    specs: "32GB Dual Kit • DDR5 5200MHz • Vibrant RGB",
    rating: 4.9,
    reviews: 98,
    price: 9800,
    mrp: 11500,
    discount: 15,
    image: "/images/products/kingston-fury-32gb.png",
  },
  {
    id: "ssd-2",
    brand: "Samsung",
    name: "Samsung 980 500GB PCIe 3.0 M.2 NVMe SSD",
    specs: "500GB • 3,100 MB/s Read • V-NAND Technology",
    rating: 4.9,
    reviews: 412,
    price: 3350,
    mrp: 4100,
    discount: 18,
    image: "/images/products/samsung-980-500gb.png",
  },
  {
    id: "gpu-3",
    brand: "Galax",
    name: "Galax GeForce RTX 5060 Ti 1-Click OC 8GB",
    specs: "8GB GDDR7 • 1-Click OC • Dual Fan Extreme Cooling",
    rating: 4.8,
    reviews: 74,
    price: 43500,
    mrp: 48000,
    discount: 9,
    image: "/images/products/galax-rtx-5060ti.png",
  },
];

// Future Ready Beast GPU Showcase
const beastGPUs = [
  {
    id: "gpu-4",
    brand: "INNO3D",
    name: "INNO3D RTX 5060 Twin X2 8GB Graphics Card",
    specs: "8GB GDDR7 • Dual Fan • DLSS 3.5",
    rating: 4.7,
    price: 39600,
    mrp: 45000,
    discount: 12,
    image: "/images/products/gpu-4-rtx-4070-super.png",
  },
  {
    id: "gpu-3",
    brand: "Galax",
    name: "Galax RTX 5060 Ti 1-Click OC 8GB Graphics Card",
    specs: "8GB GDDR7 • 1-Click OC • Ray Tracing",
    rating: 4.8,
    price: 43500,
    mrp: 48000,
    discount: 9,
    image: "/images/products/galax-rtx-5060ti.png",
  },
  {
    id: "gpu-5",
    brand: "MSI",
    name: "MSI RTX 5060 Ti Shadow 2X OC 8GB Graphics Card",
    specs: "8GB GDDR7 • TORX Fan 4.0 • Overclocked",
    rating: 4.8,
    price: 48249,
    mrp: 54000,
    discount: 11,
    image: "/images/products/gpu-5-rx-7800-xt.png",
  },
  {
    id: "gpu-6",
    brand: "PNY",
    name: "PNY GeForce RTX 5060 Ti 8GB Graphics Card",
    specs: "8GB GDDR7 • Dual Fan • High Airflow",
    rating: 4.7,
    price: 45900,
    mrp: 51000,
    discount: 10,
    image: "/images/products/gpu-6-rtx-4080-super.png",
  },
  {
    id: "gpu-2",
    brand: "MSI",
    name: "MSI Ventus RTX 3060 2X 12GB Graphics Card",
    specs: "12GB GDDR6 • Dual Fan • 192-bit VRAM",
    rating: 4.9,
    price: 26999,
    mrp: 32000,
    discount: 16,
    image: "/images/products/graphic card.png",
  },
  {
    id: "gpu-1",
    brand: "Zotac",
    name: "Zotac Gaming GTX 1650 4GB Graphics Card",
    specs: "4GB GDDR6 • Low Power 75W • Budget King",
    rating: 4.6,
    price: 14500,
    mrp: 17500,
    discount: 17,
    image: "/images/products/graphic card.png",
  },
];

interface QuickViewProduct {
  id: string;
  brand: string;
  name: string;
  specs?: string;
  rating: number;
  reviews?: number;
  price: number;
  mrp?: number;
  discount?: number;
  image: string;
}

export default function Home() {
  const { addToCart, toast } = useCart();
  // Seeded from the server-resolved theme, so SSR and first client render agree.
  const activeTheme = useStoreTheme();
  const [homeMedia, setHomeMedia] = useState<HomePageMediaState>(() => getThemeMedia(activeTheme));
  const [addedItems, setAddedItems] = useState<{ [key: string]: boolean }>({});
  const [wishlist, setWishlist] = useState<{ [key: string]: boolean }>({});
  const [gpuFilter, setGpuFilter] = useState<"all" | "50series" | "30series" | "budget">("all");
  const [quickViewProduct, setQuickViewProduct] = useState<QuickViewProduct | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    hours: 18,
    minutes: 42,
    seconds: 30,
  });

  useEffect(() => {
    async function fetchMedia() {
      const data = await loadHomeMedia(activeTheme);
      setHomeMedia(data);
    }
    fetchMedia();

    window.addEventListener("charmila_banners_updated", fetchMedia);
    window.addEventListener("charmila_theme_changed", fetchMedia);
    return () => {
      window.removeEventListener("charmila_banners_updated", fetchMedia);
      window.removeEventListener("charmila_theme_changed", fetchMedia);
    };
  }, [activeTheme]);

  const themeFallbackMedia = getThemeMedia(activeTheme);
  const activeComponents = homeMedia.components || themeFallbackMedia.components;
  const activeGaming = homeMedia.gaming || themeFallbackMedia.gaming;
  const activeAccessories = homeMedia.accessories || themeFallbackMedia.accessories;



  useEffect(() => {
    if (!quickViewProduct) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setQuickViewProduct(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [quickViewProduct]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAdd = (id: string) => {
    addToCart(id, 1);
    setAddedItems((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [id]: false }));
    }, 1500);
  };

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredGPUs = beastGPUs.filter((g) => {
    if (gpuFilter === "50series") return g.name.includes("5060");
    if (gpuFilter === "30series") return g.name.includes("3060");
    if (gpuFilter === "budget") return g.name.includes("1650");
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#1B1B1B] font-sans selection:bg-[#D1121B] selection:text-white">
      <PageViewTracker kind="home" />
      {/* Centered Content Container with 1440px max width and 16-24px gutters */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-4 sm:py-6 space-y-10 sm:space-y-14">
        
        {/* 01. HERO SECTION (70% Left + 30% Stacked Right) */}
        <section aria-label="Festive Hero Showcase">
          <HeroCarousel />
        </section>

        {/* 02. BUILD DIFFERENT PC & CABINET BANNER (Dynamic Home Media) */}
        <section aria-label="Build Different Custom PC Banner" className="w-full">
          <Link
            href={homeMedia.promos.buildDifferent?.link || "/build-your-pc"}
            className="relative w-full aspect-[1756/896] rounded-2xl overflow-hidden shadow-sm group border border-[#E5E0D7] block bg-[#120B05]"
          >
            <Image
              src={homeMedia.promos.buildDifferent?.image || (activeTheme === "festive" ? "/themes/vinayaka/banner-30.png" : "/themes/standard/promo-build-different.png")}
              alt={homeMedia.promos.buildDifferent?.alt || (activeTheme === "festive" ? "Build Different - Festive, Powerful, Yours" : "Precision Engineering - Custom Rig Configurator")}
              fill
              sizes="(max-width: 1440px) 100vw, 1440px"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.01]"
              priority
            />

            {/* Standard-theme typographic overlay — the standard banner art is a
                clean render with open space on the left, so the headline lives
                there. Festive art already carries baked-in lettering. */}
            {activeTheme === "standard" && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-[62%] sm:max-w-[52%] lg:max-w-[46%] pl-5 sm:pl-10 lg:pl-14 pr-4">
                    <p className="text-[9px] sm:text-[11px] lg:text-xs font-bold uppercase tracking-[0.25em] text-[#FF8080]">
                      Custom PC Configurator
                    </p>
                    <h2 className="mt-1.5 sm:mt-3 font-serif font-black text-white leading-[1.03] tracking-tight text-xl sm:text-4xl lg:text-5xl">
                      Build Different.
                      <span className="block text-[#FF4D4D]">Engineered Exact.</span>
                    </h2>
                    <p className="hidden sm:block mt-3 lg:mt-4 text-[11px] lg:text-sm text-zinc-200/90 font-medium max-w-md leading-relaxed">
                      Hand-picked components, bench-tested assembly and full manufacturer
                      warranty — configured to your workload, not a spec sheet.
                    </p>
                    <span className="mt-3 sm:mt-5 inline-flex items-center gap-2 rounded-full bg-white px-3.5 sm:px-5 py-1.5 sm:py-2.5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#1B1B1B] shadow-lg transition-transform group-hover:translate-x-1">
                      Start Your Build
                      <span aria-hidden className="text-[#D1121B]">&rarr;</span>
                    </span>
                  </div>
                </div>
              </>
            )}
          </Link>
        </section>


        {/* 04. VINAYAKA FESTIVE PICKS (Section 13, 14, 15: Clean White Container, 6 Premium Cards) */}
        <section className="bg-white border border-[#E5E0D7] rounded-2xl shadow-sm overflow-hidden" aria-label="Vinayaka Festive Picks">
          {/* Section Header with Deep Maroon accent and Golden Badge */}
          <div className="bg-gradient-to-r from-[#4E0B10] via-[#7A1118] to-[#4E0B10] text-white px-5 sm:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4 border-b-2 border-[#C89B3C]/50 shadow-inner">
            <div className="flex items-center gap-3.5 sm:gap-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-[#C89B3C] flex items-center justify-center shrink-0 shadow-md">
                <StarIcon className="w-6 h-6 text-[#FFD700]" filled />
              </div>
              <div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <h2 className={`text-lg sm:text-2xl font-extrabold tracking-wider uppercase font-serif ${
                    activeTheme === "festive"
                      ? "bg-gradient-to-r from-[#FFF4CC] via-[#FFD700] to-[#FFA726] bg-clip-text text-transparent"
                      : "text-white"
                  }`}>
                    {activeTheme === "festive" ? "VINAYAKA FESTIVE PICKS" : "FEATURED HARDWARE DEALS"}
                  </h2>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider ${
                    activeTheme === "festive"
                      ? "bg-[#D1121B] text-[#FFE58F] border border-[#C89B3C]/50"
                      : "bg-[#D1121B] text-white border border-red-500/50"
                  }`}>
                    {activeTheme === "festive" ? "FESTIVE SPECIAL" : "BEST SELLER"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-amber-100/90 font-medium">
                  {activeTheme === "festive" ? "Power up your build with limited-time festive offers on top-rated hardware." : "Enterprise-grade PC hardware handpicked with official manufacturer warranty."}
                </p>
              </div>
            </div>

            {/* Countdown & View All CTA */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-md border border-[#C89B3C]/40 flex items-center gap-2 font-mono text-xs">
                <span className="text-[10px] text-amber-300 font-bold uppercase">Ends:</span>
                <span className="bg-[#D1121B] px-1.5 py-0.5 rounded font-bold text-white">{String(timeLeft.hours).padStart(2, "0")}h</span>
                <span className="text-amber-400">:</span>
                <span className="bg-[#D1121B] px-1.5 py-0.5 rounded font-bold text-white">{String(timeLeft.minutes).padStart(2, "0")}m</span>
                <span className="text-amber-400">:</span>
                <span className="bg-[#D1121B] px-1.5 py-0.5 rounded font-bold text-white animate-pulse">{String(timeLeft.seconds).padStart(2, "0")}s</span>
              </div>

              <Link
                href="/offers"
                className="bg-gradient-to-r from-[#C89B3C] to-[#E87516] hover:from-[#d8a846] hover:to-[#f08426] text-black font-extrabold text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-md shadow-md transition-transform duration-200 hover:scale-105 uppercase tracking-wider flex items-center gap-1 whitespace-nowrap"
              >
                <span>VIEW ALL →</span>
              </Link>
            </div>
          </div>

          {/* 6 Premium Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y sm:divide-y-0 divide-[#E5E0D7] bg-white">
            {festivePicks.map((p) => {
              const isAdded = addedItems[p.id];
              const isWishlisted = wishlist[p.id];
              return (
                <div
                  key={p.id}
                  className="relative flex flex-col items-center text-center p-4 sm:p-5 group bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5"
                >
                  {/* Top: Discount Tag & Wishlist Button */}
                  <div className="w-full flex items-center justify-between mb-2 z-10">
                    <span className="bg-[#D1121B] text-white text-[10px] font-black px-2 py-0.5 rounded-sm shadow-xs tracking-wider">
                      SALE -{p.discount}%
                    </span>
                    <button
                      onClick={(e) => toggleWishlist(p.id, e)}
                      aria-label="Add to wishlist"
                      className={`p-1 rounded-full transition-colors ${
                        isWishlisted ? "text-[#D1121B]" : "text-[#929292] hover:text-[#D1121B]"
                      }`}
                    >
                      <HeartIcon className="w-4 h-4" filled={isWishlisted} />
                    </button>
                  </div>

                  {/* Product Image Area (180–220px height) with Quick View overlay */}
                  <div className="w-full h-44 sm:h-48 relative my-2 flex items-center justify-center overflow-hidden group/img">
                    <Link
                      href={`/product/${p.id}`}
                      className="w-full h-full relative flex items-center justify-center"
                    >
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                    {/* Quick View Button on Hover */}
                    <button
                      onClick={() => setQuickViewProduct(p)}
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/80 hover:bg-[#7A1118] text-white text-[10px] font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-xs shadow-md uppercase tracking-wider whitespace-nowrap"
                    >
                      Quick View
                    </button>
                  </div>

                  {/* Brand & Category */}
                  <span className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider mt-1">
                    {p.brand}
                  </span>

                  {/* Product Name */}
                  <Link
                    href={`/product/${p.id}`}
                    className="text-xs sm:text-[13px] text-[#1B1B1B] font-bold line-clamp-2 min-h-[36px] mt-1 hover:text-[#7A1118] transition-colors leading-snug"
                  >
                    {p.name}
                  </Link>

                  {/* Star Rating */}
                  <div className="flex items-center gap-1 my-1.5 text-[11px] text-[#C89B3C]">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className="w-3 h-3 text-[#C89B3C]" filled={i < Math.floor(p.rating)} />
                      ))}
                    </div>
                    <span className="font-bold text-[#1B1B1B] text-[10px] ml-0.5">{p.rating}</span>
                    <span className="text-[9px] text-[#929292]">({p.reviews})</span>
                  </div>

                  {/* Price Block */}
                  <div className="flex items-baseline gap-2 mb-3 mt-auto">
                    <span className="text-base sm:text-lg font-extrabold text-[#7A1118]">
                      ₹{p.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#929292] line-through font-medium">
                      ₹{p.mrp.toLocaleString()}
                    </span>
                  </div>

                  {/* Add To Cart CTA */}
                  <button
                    onClick={() => handleAdd(p.id)}
                    className={`w-full py-2 px-3 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm ${
                      isAdded
                        ? "bg-green-700 text-white"
                        : "bg-[#7A1118] hover:bg-[#4E0B10] text-white hover:shadow-md"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <CheckIcon className="w-3.5 h-3.5" /> Added
                      </>
                    ) : (
                      "ADD TO CART"
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* 05. CATEGORY COLLECTION (10 Categories, 5x2 Desktop, Section 16, 17, 18) */}
        <section aria-label="Component Category Showcase" className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E0D7] pb-2.5">
            <div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-[#1B1B1B] uppercase tracking-wider font-serif">
                PC COMPONENTS
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6B6B]">
                Engineered for extreme performance, reliable builds and seamless upgrades.
              </p>
            </div>
            <Link href="/category/processors" className="text-xs sm:text-sm font-bold text-[#7A1118] hover:underline flex items-center gap-1">
              <span>View All Components</span>
              <ChevronRightIcon className="w-4 h-4" />
            </Link>
          </div>

          {/* 5x2 Category Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {activeComponents.map((c, idx) => (

              <Link
                key={`${c.slug}-${idx}`}
                href={`/category/${c.slug}`}
                className="group relative flex flex-col bg-white border border-[#E5E0D7] rounded-xl p-3 sm:p-3.5 shadow-xs hover:shadow-lg hover:border-[#7A1118]/60 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Product Image (~65% scale) */}
                <div className="w-full aspect-square relative rounded-lg bg-[#FAF7F2] overflow-hidden">
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Text Content (~35%) */}
                <div className="w-full mt-2.5 pt-2 border-t border-zinc-100 flex flex-col">
                  <h3 className="text-xs sm:text-[13px] font-extrabold text-[#1B1B1B] group-hover:text-[#7A1118] transition-colors uppercase tracking-wider line-clamp-1">
                    {c.name}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-[#6B6B6B] line-clamp-1 mt-0.5">
                    {c.desc}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-[#C89B3C] group-hover:text-[#7A1118] transition-colors uppercase tracking-wider">
                    <span>EXPLORE</span>
                    <span className="text-xs font-bold group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 06. FUTURE READY BEAST (Section 19, 20: Left Large Flagship + Right 6 Cards) */}
        <section aria-label="Future Ready Beast GPU Section" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E0D7] pb-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#1B1B1B] text-[#FFD700] text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-widest">
                  GEFORCE RTX™
                </span>
                <h2 className="text-lg sm:text-2xl font-extrabold text-[#1B1B1B] uppercase tracking-wider font-serif">
                  FUTURE READY BEAST
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#6B6B6B]">
                Extreme performance for next-generation gaming, real-time ray tracing and AI creation.
              </p>
            </div>

            {/* GPU Brand / Tier Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
              <button
                onClick={() => setGpuFilter("all")}
                className={`px-3 py-1 rounded-full font-bold transition-all text-xs whitespace-nowrap ${
                  gpuFilter === "all"
                    ? "bg-[#7A1118] text-white shadow-xs"
                    : "bg-white text-[#6B6B6B] hover:bg-zinc-100 border border-[#E5E0D7]"
                }`}
              >
                All GPUs ({beastGPUs.length + 1})
              </button>
              <button
                onClick={() => setGpuFilter("50series")}
                className={`px-3 py-1 rounded-full font-bold transition-all text-xs whitespace-nowrap ${
                  gpuFilter === "50series"
                    ? "bg-[#7A1118] text-white shadow-xs"
                    : "bg-white text-[#6B6B6B] hover:bg-zinc-100 border border-[#E5E0D7]"
                }`}
              >
                RTX 50-Series (4)
              </button>
              <button
                onClick={() => setGpuFilter("30series")}
                className={`px-3 py-1 rounded-full font-bold transition-all text-xs whitespace-nowrap ${
                  gpuFilter === "30series"
                    ? "bg-[#7A1118] text-white shadow-xs"
                    : "bg-white text-[#6B6B6B] hover:bg-zinc-100 border border-[#E5E0D7]"
                }`}
              >
                RTX 30-Series (1)
              </button>
              <button
                onClick={() => setGpuFilter("budget")}
                className={`px-3 py-1 rounded-full font-bold transition-all text-xs whitespace-nowrap ${
                  gpuFilter === "budget"
                    ? "bg-[#7A1118] text-white shadow-xs"
                    : "bg-white text-[#6B6B6B] hover:bg-zinc-100 border border-[#E5E0D7]"
                }`}
              >
                Budget Series (1)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* LEFT: Large Flagship Featured Product Card (5 cols) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#1B1B1B] via-[#263946] to-[#1B1B1B] text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-lg border border-[#C89B3C]/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-gradient-to-r from-[#C89B3C] to-[#E87516] text-black font-black text-[10px] uppercase px-3 py-1 rounded-full shadow-md tracking-wider">
                    {homeMedia.flagship?.badge || "FLAGSHIP BEAST"}
                  </span>
                  <span className="text-[11px] text-amber-300 font-semibold bg-white/10 px-2.5 py-0.5 rounded border border-white/15">
                    Limited Stock
                  </span>
                </div>

                {/* Large Product Image with Quick View trigger */}
                <div className="relative w-full h-56 sm:h-64 my-4 flex items-center justify-center group/flag block">
                  <Link href={homeMedia.flagship?.link || "/product/gpu-suprim"} className="w-full h-full relative flex items-center justify-center">
                    <Image
                      src={homeMedia.flagship?.image || "/images/graphics-cards.png"}
                      alt={homeMedia.flagship?.name || "MSI GeForce RTX 4090 SUPRIM X 24G"}
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <button
                    onClick={() =>
                      setQuickViewProduct({
                        id: "gpu-suprim",
                        brand: homeMedia.flagship?.brand || "MSI",
                        name: homeMedia.flagship?.name || "MSI GeForce RTX 4090 SUPRIM X 24G",
                        specs: homeMedia.flagship?.specs || "24GB GDDR6X • TRI FROZR 3S • Ray Tracing • DLSS 3.5",
                        rating: 5.0,
                        reviews: 68,
                        price: homeMedia.flagship?.price || 199999,
                        mrp: homeMedia.flagship?.mrp || 220000,
                        discount: homeMedia.flagship?.discount || 9,
                        image: homeMedia.flagship?.image || "/images/graphics-cards.png",
                      })
                    }
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-amber-500/90 hover:bg-amber-400 text-black text-[10px] font-extrabold px-3.5 py-1.5 rounded-full opacity-0 group-hover/flag:opacity-100 transition-all duration-200 shadow-md uppercase tracking-wider"
                  >
                    Quick View
                  </button>
                </div>

                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
                  {homeMedia.flagship?.series || "MSI SUPRIM X SERIES"}
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                  {homeMedia.flagship?.name || "MSI GeForce RTX 4090 SUPRIM X 24G"}
                </h3>
                <p className="text-xs text-zinc-300 mt-1">
                  {homeMedia.flagship?.specs || "24GB GDDR6X • TRI FROZR 3S Cooling • DLSS 3.5 • Dual BIOS"}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1.5 my-3 text-xs text-[#FFD700]">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="w-3.5 h-3.5 text-[#FFD700]" filled />
                    ))}
                  </div>
                  <span className="font-bold text-white">5.0</span>
                  <span className="text-zinc-400">(68 verified reviews)</span>
                </div>
              </div>

              {/* Price & CTA */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase block">Sale Price</span>
                  <span className="text-xl sm:text-2xl font-black text-[#FFE58F]">₹{(homeMedia.flagship?.price || 199999).toLocaleString()}</span>
                </div>
                <button
                  onClick={() => handleAdd("gpu-suprim")}
                  className={`py-2.5 px-6 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-md ${
                    addedItems["gpu-suprim"]
                      ? "bg-green-600 text-white"
                      : "bg-gradient-to-r from-[#D1121B] to-[#7A1118] hover:from-[#B81D15] hover:to-[#4E0B10] text-white hover:scale-105"
                  }`}
                >
                  {addedItems["gpu-suprim"] ? "✓ Added" : "ADD TO CART"}
                </button>
              </div>
            </div>


            {/* RIGHT: Supporting Graphics Card Cards (7 cols, 3x2 Grid) */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {filteredGPUs.map((g) => {
                const isAdded = addedItems[g.id];
                return (
                  <div
                    key={g.id}
                    className="relative flex flex-col justify-between bg-white border border-[#E5E0D7] rounded-xl p-3.5 shadow-xs hover:shadow-md hover:border-[#7A1118]/50 transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <div>
                      {/* Top Discount Tag */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="bg-[#D1121B] text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm">
                          -{g.discount}%
                        </span>
                        <span className="text-[8px] text-zinc-500 font-bold uppercase">{g.brand}</span>
                      </div>

                      {/* Image with quick view */}
                      <div className="w-full h-28 relative my-1 flex items-center justify-center group/gpuimg block">
                        <Link href={`/product/${g.id}`} className="w-full h-full relative flex items-center justify-center">
                          <Image
                            src={g.image}
                            alt={g.name}
                            fill
                            sizes="(max-width: 1024px) 33vw, 15vw"
                            className="object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        </Link>
                        <button
                          onClick={() => setQuickViewProduct(g)}
                          className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/75 hover:bg-[#7A1118] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full opacity-0 group-hover/gpuimg:opacity-100 transition-opacity whitespace-nowrap shadow-xs uppercase tracking-wider"
                        >
                          Quick View
                        </button>
                      </div>

                      {/* Specs */}
                      <span className="text-[8px] text-zinc-600 font-semibold line-clamp-1 block bg-zinc-100 px-1 py-0.5 rounded mt-1">
                        {g.specs}
                      </span>

                      {/* Title */}
                      <Link
                        href={`/product/${g.id}`}
                        className="text-[11px] sm:text-xs text-[#1B1B1B] font-bold line-clamp-2 mt-1.5 hover:text-[#7A1118] transition-colors leading-tight"
                      >
                        {g.name}
                      </Link>
                    </div>

                    {/* Price & Add */}
                    <div className="mt-3 pt-2 border-t border-zinc-100">
                      <div className="flex items-baseline gap-1.5 mb-2">
                        <span className="text-xs sm:text-sm font-extrabold text-[#7A1118]">
                          ₹{g.price.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-[#929292] line-through">
                          ₹{g.mrp.toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleAdd(g.id)}
                        className={`w-full py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 ${
                          isAdded
                            ? "bg-green-700 text-white"
                            : "bg-[#7A1118] hover:bg-[#4E0B10] text-white"
                        }`}
                      >
                        {isAdded ? "✓ Added" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 07. FESTIVE TEMPLE NIGHT CELEBRATION PANORAMIC BANNER (Dynamic Home Media) */}
        <section aria-label="Festive Tech Mega Deals Banner" className="w-full">
          <div className="relative w-full aspect-[1983/793] rounded-2xl overflow-hidden shadow-md group border border-[#E5E0D7] bg-[#080d19]">
            <Image
              src={homeMedia.promos.templeNight?.image || (activeTheme === "standard" ? "/themes/standard/promo-workstations.png" : "/themes/vinayaka/banner-16.png")}
              alt={homeMedia.promos.templeNight?.alt || (activeTheme === "standard" ? "Ultra Performance Workstations - Enterprise Hardware Special" : "Vinayaka Chavithi Mega Fest - Ignite Your Gaming Dreams")}
              fill
              sizes="(max-width: 1440px) 100vw, 1440px"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.01]"
            />

            {/* Cinematic Gradient & Rich Promotional Text Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent flex items-center">
              <div className="p-4 sm:p-8 md:p-12 lg:p-14 max-w-xl text-white space-y-2.5 sm:space-y-4">
                {/* Top Badge */}
                <div className={`inline-flex items-center gap-1.5 text-[9px] sm:text-xs font-extrabold uppercase px-3 py-1 rounded-full shadow-md tracking-wider ${
                  activeTheme === "festive"
                    ? "bg-gradient-to-r from-[#D1121B] to-[#7A1118] text-[#FFE58F] border border-[#C89B3C]/50"
                    : "bg-gradient-to-r from-[#D1121B] to-[#7A1118] text-white border border-red-500/50"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${activeTheme === "festive" ? "bg-[#FFE58F]" : "bg-white"}`} />
                  <span>{homeMedia.promos.templeNight?.badge || (activeTheme === "standard" ? "ENTERPRISE HARDWARE SPECIAL" : "VINAYAKA CHAVITHI MEGA FEST")}</span>
                </div>

                {/* Main Headline */}
                <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight uppercase font-serif">
                  <span className="block text-white">{homeMedia.promos.templeNight?.titleLine1 || (activeTheme === "standard" ? "ULTRA PERFORMANCE" : "IGNITE YOUR")}</span>
                  <span className={
                    activeTheme === "festive"
                      ? "bg-gradient-to-r from-[#FFE58F] via-[#FFD700] to-[#FFA726] bg-clip-text text-transparent drop-shadow-md"
                      : "bg-gradient-to-r from-[#FF4D4D] via-[#D1121B] to-[#FF8080] bg-clip-text text-transparent drop-shadow-md"
                  }>
                    {homeMedia.promos.templeNight?.titleLine2 || (activeTheme === "standard" ? "WORKSTATIONS" : "GAMING DREAMS")}
                  </span>
                </h2>

                {/* Subtitle Description */}
                <p className="text-zinc-200 text-[10px] sm:text-xs md:text-sm line-clamp-2 sm:line-clamp-none font-medium">
                  {homeMedia.promos.templeNight?.subtitle || (activeTheme === "standard" ? "Tested and validated under extreme workloads with official manufacturer direct warranty support." : "Unleash unmatched performance with Custom High-End Gaming Rigs, RTX 50-Series Graphics Cards & Liquid Cooled Beast Setups.")}
                </p>

                {/* Offer Feature Badges */}
                <div className={`flex flex-wrap gap-2 pt-0.5 sm:pt-1 text-[9px] sm:text-[11px] font-semibold ${
                  activeTheme === "festive" ? "text-amber-200" : "text-red-200"
                }`}>
                  <span className={`bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded border ${activeTheme === "festive" ? "border-amber-500/30" : "border-red-500/30"}`}>
                    ✓ 0% Easy EMI
                  </span>
                  <span className={`bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded border ${activeTheme === "festive" ? "border-amber-500/30" : "border-red-500/30"}`}>
                    ✓ 3-Yr Warranty
                  </span>
                  <span className={`bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded border ${activeTheme === "festive" ? "border-amber-500/30" : "border-red-500/30"}`}>
                    ✓ Free Pan-India Delivery
                  </span>
                </div>

                {/* Call To Action Buttons */}
                <div className="flex items-center gap-2.5 sm:gap-4 pt-1 sm:pt-2">
                  <Link
                    href={homeMedia.promos.templeNight?.buttonLink || "/category/gaming"}
                    className="bg-gradient-to-r from-[#D1121B] to-[#990D14] hover:from-[#B81017] hover:to-[#7A0A10] text-white font-bold text-[10px] sm:text-xs md:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <span>{homeMedia.promos.templeNight?.buttonText || (activeTheme === "standard" ? "Browse Hardware" : "Shop Gaming Deals")}</span>
                    <span className="text-xs">›</span>
                  </Link>
                  {homeMedia.promos.templeNight?.button2Text && (
                    <Link
                      href={homeMedia.promos.templeNight?.button2Link || "/build-your-pc"}
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-amber-200 hover:text-white border border-amber-400/50 font-bold text-[10px] sm:text-xs md:text-sm px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-lg transition-all duration-200 hover:scale-105 uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <span>{homeMedia.promos.templeNight.button2Text}</span>
                      <span className="text-xs">›</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 08. GAMER ZONE (5 Category Cards - Dynamic Home Media) */}
        <section aria-label="Gamer Zone Showcase" className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E0D7] pb-2.5">
            <div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-[#1B1B1B] uppercase tracking-wider font-serif">
                GAMER ZONE
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6B6B]">
                Everything you need to complete your battle station setup.
              </p>
            </div>
            <Link href="/category/gaming" className="text-xs sm:text-sm font-bold text-[#7A1118] hover:underline flex items-center gap-1">
              <span>View All Gaming Gear</span>
              <ChevronRightIcon className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {activeGaming.map((c, idx) => (
              <Link
                key={`${c.slug}-${idx}`}
                href={`/category/${c.slug}`}
                className="group relative flex flex-col bg-white border border-[#E5E0D7] rounded-xl p-3 sm:p-3.5 shadow-xs hover:shadow-lg hover:border-[#7A1118]/60 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <div className="w-full aspect-square relative rounded-lg bg-[#FAF7F2] overflow-hidden">
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="w-full mt-2.5 pt-2 border-t border-zinc-100 flex flex-col">
                  <h3 className="text-xs sm:text-[13px] font-extrabold text-[#1B1B1B] group-hover:text-[#7A1118] transition-colors uppercase tracking-wider line-clamp-1">
                    {c.name}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-[#6B6B6B] line-clamp-1 mt-0.5">
                    {c.desc}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-[#C89B3C] group-hover:text-[#7A1118] transition-colors uppercase tracking-wider">
                    <span>EXPLORE</span>
                    <span className="text-xs font-bold group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 09. PRINTERS & ACCESSORIES (Section 24: 10 Cards, 5x2 Grid - Dynamic Home Media) */}
        <section aria-label="Printers & Accessories Showcase" className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E0D7] pb-2.5">
            <div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-[#1B1B1B] uppercase tracking-wider font-serif">
                PRINTERS &amp; ACCESSORIES
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6B6B]">
                Essential peripherals, networking and power solutions for home and office.
              </p>
            </div>
            <Link href="/category/accessories" className="text-xs sm:text-sm font-bold text-[#7A1118] hover:underline flex items-center gap-1">
              <span>View All Accessories</span>
              <ChevronRightIcon className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {activeAccessories.map((c, idx) => (

              <Link
                key={`${c.slug}-${idx}`}
                href={`/category/${c.slug}`}
                className="group relative flex flex-col bg-white border border-[#E5E0D7] rounded-xl p-3 sm:p-3.5 shadow-xs hover:shadow-lg hover:border-[#7A1118]/60 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <div className="w-full aspect-square relative rounded-lg bg-[#FAF7F2] overflow-hidden">
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="w-full mt-2.5 pt-2 border-t border-zinc-100 flex flex-col">
                  <h3 className="text-xs sm:text-[13px] font-extrabold text-[#1B1B1B] group-hover:text-[#7A1118] transition-colors uppercase tracking-wider line-clamp-1">
                    {c.name}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-[#6B6B6B] line-clamp-1 mt-0.5">
                    {c.desc}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-[#C89B3C] group-hover:text-[#7A1118] transition-colors uppercase tracking-wider">
                    <span>EXPLORE</span>
                    <span className="text-xs font-bold group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 10. TRUST STRIP (Section 25: Dark Slate #263844, Gold Icons, 4 Core Guarantees) */}
        <section aria-label="Customer Guarantees and Trust Strip" className="bg-[#263844] text-white rounded-2xl p-6 sm:p-8 shadow-md border border-white/10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:px-4">
              <div className="w-12 h-12 rounded-full bg-white/10 border border-[#C89B3C] flex items-center justify-center shrink-0">
                <TruckIcon className="w-6 h-6 text-[#C89B3C]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white">
                  FREE SHIPPING
                </h4>
                <p className="text-[11px] text-zinc-300">Across all Indian pin codes</p>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:px-4">
              <div className="w-12 h-12 rounded-full bg-white/10 border border-[#C89B3C] flex items-center justify-center shrink-0">
                <HeadsetSupportIcon className="w-6 h-6 text-[#C89B3C]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white">
                  PREMIUM SUPPORT
                </h4>
                <p className="text-[11px] text-zinc-300">Expert PC hardware advisors</p>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:px-4">
              <div className="w-12 h-12 rounded-full bg-white/10 border border-[#C89B3C] flex items-center justify-center shrink-0">
                <ShieldIcon className="w-6 h-6 text-[#C89B3C]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white">
                  100% SECURE PAYMENT
                </h4>
                <p className="text-[11px] text-zinc-300">Safe, encrypted checkout</p>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:px-4">
              <div className="w-12 h-12 rounded-full bg-white/10 border border-[#C89B3C] flex items-center justify-center shrink-0">
                <BoltIcon className="w-6 h-6 text-[#C89B3C]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white">
                  FAST DELIVERY
                </h4>
                <p className="text-[11px] text-zinc-300">Insured express transit</p>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* QUICK VIEW MODAL DIALOG */}
      {quickViewProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in-up"
          onClick={() => setQuickViewProduct(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative border border-[#E5E0D7] text-left"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-view-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors"
              aria-label="Close modal"
              autoFocus
            >
              <CloseIcon className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              {/* Product Image */}
              <div className="relative w-full h-56 bg-[#FAF7F2] rounded-xl p-4 flex items-center justify-center border border-zinc-100">
                <Image
                  src={quickViewProduct.image}
                  alt={quickViewProduct.name}
                  fill
                  sizes="300px"
                  className="object-contain p-2"
                />
              </div>

              {/* Product Info */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-[#7A1118] uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {quickViewProduct.brand || "GENUINE COMPONENT"}
                </span>
                <h3 id="quick-view-title" className="text-sm sm:text-base font-extrabold text-[#1B1B1B] leading-snug">
                  {quickViewProduct.name}
                </h3>
                <p className="text-xs text-zinc-600 bg-zinc-50 p-2 rounded border border-zinc-100 font-medium">
                  {quickViewProduct.specs || "Official Manufacturer Warranty • Fast Dispatch"}
                </p>

                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-xl font-extrabold text-[#7A1118]">
                    ₹{quickViewProduct.price.toLocaleString()}
                  </span>
                  {quickViewProduct.mrp && (
                    <span className="text-xs text-zinc-400 line-through">
                      ₹{quickViewProduct.mrp.toLocaleString()}
                    </span>
                  )}
                  {quickViewProduct.discount && (
                    <span className="text-[10px] font-black text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                      -{quickViewProduct.discount}% OFF
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      handleAdd(quickViewProduct.id);
                    }}
                    className="w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#7A1118] hover:bg-[#4E0B10] text-white transition-colors shadow-md flex items-center justify-center gap-1.5"
                  >
                    {addedItems[quickViewProduct.id] ? "✓ Added to Cart" : "Add to Cart"}
                  </button>
                  <Link
                    href={`/product/${quickViewProduct.id}`}
                    onClick={() => setQuickViewProduct(null)}
                    className="w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-center bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors"
                  >
                    View Full Product Details →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING CART TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1B1B1B] text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-amber-400/40 animate-toast-in">
          <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white shrink-0">
            <CheckIcon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">{toast}</p>
            <p className="text-[10px] text-amber-300 font-medium">Cart updated successfully</p>
          </div>
          <Link
            href="/cart"
            className="ml-3 bg-[#D1121B] hover:bg-[#B81D15] text-white text-[11px] font-bold px-3 py-1.5 rounded-md transition-colors uppercase tracking-wider whitespace-nowrap"
          >
            View Cart ›
          </Link>
        </div>
      )}
    </div>
  );
}
