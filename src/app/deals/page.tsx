"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDealsProducts, sampleComboDeals, getProduct } from "@/data/products";
import { formatINR } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { useStoreTheme } from "@/hooks/useStoreTheme";
import ProductCard from "@/components/ProductCard";
import { BoltIcon, ClockIcon, CartIcon } from "@/components/icons";

export default function DealsPage() {
  const dealsProducts = getDealsProducts().slice(0, 8);
  const { addToCart, showToast } = useCart();
  const activeTheme = useStoreTheme();
  const isDussara = activeTheme.startsWith("dussara-d");

  // Countdown timer simulation for festive flash sale
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 48 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function handleAddCombo(combo: typeof sampleComboDeals[0]) {
    addToCart(combo.processor, 1);
    addToCart(combo.motherboard, 1);
    addToCart(combo.ram, 1);
    showToast(`✓ Added ${combo.title} bundle to cart!`);
  }

  function handleCopyCoupon(code: string) {
    navigator.clipboard.writeText(code);
    showToast(`Coupon ${code} copied to clipboard!`);
  }

  const mainCouponCode = isDussara ? "DUSSARA500" : "VINAYAKA500";

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-8 font-sans">
      {/* Breadcrumb */}
      <nav className="text-xs text-zinc-500 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-[#D1121B]">Home</Link>
        <span>/</span>
        <span className="text-[#1B1B1B] font-bold">Festive Deals &amp; Offers</span>
      </nav>

      {/* Hero Festive Banner with Countdown Timer */}
      <div className="relative bg-gradient-to-r from-[#4E0B10] via-[#7A1118] to-[#1D2B34] text-white p-8 sm:p-12 rounded-3xl border-2 border-[#C89B3C] shadow-xl overflow-hidden mb-12">
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center lg:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 bg-[#FFD700] text-[#4E0B10] font-black text-xs uppercase tracking-widest px-3.5 py-1 rounded-full shadow">
              <BoltIcon className="w-4 h-4" /> {isDussara ? "Dussara Navratri Hardware Fest" : "Vinayaka Chavithi Mega Hardware Fest"}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Unbeatable Deals on GPUs, CPUs &amp; Rigs
            </h1>
            <p className="text-xs sm:text-sm text-zinc-200">
              India&apos;s lowest prices guaranteed. Enjoy instant bank cashbacks, combo savings up to ₹7,900, and free insured pan-India express shipping.
            </p>
          </div>

          {/* Countdown Clock Box */}
          <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center space-y-2 shrink-0">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FFD700] flex items-center justify-center gap-1.5">
              <ClockIcon className="w-4 h-4" /> Flash Deals Expire In:
            </span>
            <div className="flex items-center gap-3 text-center">
              <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/15">
                <span className="text-2xl sm:text-3xl font-black font-mono block">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Hours</span>
              </div>
              <span className="text-2xl font-black text-[#FFD700]">:</span>
              <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/15">
                <span className="text-2xl sm:text-3xl font-black font-mono block">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Minutes</span>
              </div>
              <span className="text-2xl font-black text-[#FFD700]">:</span>
              <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/15">
                <span className="text-2xl sm:text-3xl font-black font-mono block text-[#FFD700]">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Seconds</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Promo Codes Bar */}
      <section className="mb-14">
        <h2 className="text-lg font-black text-[#1B1B1B] uppercase tracking-wider mb-4 flex items-center gap-2">
          Active Coupon Codes &amp; Bank Discounts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-dashed border-[#D1121B] shadow-2xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className="font-mono font-black text-base text-[#D1121B] bg-red-50 px-3 py-1 rounded-lg border border-red-200">
                  {mainCouponCode}
                </span>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Active
                </span>
              </div>
              <h3 className="font-bold text-xs text-zinc-900 mt-2">Flat ₹500 Off Storewide</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">Valid on all hardware orders above ₹5,000.</p>
            </div>
            <button
              onClick={() => handleCopyCoupon(mainCouponCode)}
              className="w-full py-2 bg-[#FAF7F2] hover:bg-red-50 text-[#7A1118] font-bold text-xs rounded-xl border border-[#E5E0D7] transition-colors uppercase tracking-wider"
            >
              Copy Code
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-dashed border-[#C89B3C] shadow-2xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className="font-mono font-black text-base text-[#7A1118] bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                  GAMER5
                </span>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  5% OFF
                </span>
              </div>
              <h3 className="font-bold text-xs text-zinc-900 mt-2">5% Off Custom Gaming Builds</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">Save up to ₹2,500 on RTX 40/50 GPUs and PC Rigs.</p>
            </div>
            <button
              onClick={() => handleCopyCoupon("GAMER5")}
              className="w-full py-2 bg-[#FAF7F2] hover:bg-amber-50 text-[#7A1118] font-bold text-xs rounded-xl border border-[#E5E0D7] transition-colors uppercase tracking-wider"
            >
              Copy Code
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-dashed border-emerald-500 shadow-2xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className="font-mono font-black text-base text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                  FREESHIP
                </span>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Free Shipping
                </span>
              </div>
              <h3 className="font-bold text-xs text-zinc-900 mt-2">Zero Shipping Charge</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">Free BlueDart Express Air delivery on orders above ₹2,000.</p>
            </div>
            <button
              onClick={() => handleCopyCoupon("FREESHIP")}
              className="w-full py-2 bg-[#FAF7F2] hover:bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl border border-[#E5E0D7] transition-colors uppercase tracking-wider"
            >
              Copy Code
            </button>
          </div>
        </div>
      </section>

      {/* Pre-Configured Hardware Bundles & Combos */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-[#1B1B1B] tracking-tight">
              Pre-Configured Upgrade Combos (Extra Savings)
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Tested &amp; guaranteed compatible CPU + Motherboard + RAM bundles at bundled discounted rates.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {sampleComboDeals.map((combo) => {
            const cpu = getProduct(combo.processor);
            const mb = getProduct(combo.motherboard);
            const ram = getProduct(combo.ram);

            return (
              <div
                key={combo.id}
                className="bg-white rounded-2xl border border-[#E5E0D7] shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all relative"
              >
                {combo.badge && (
                  <span className="absolute top-4 right-4 bg-[#D1121B] text-white text-[10px] font-black px-2.5 py-1 rounded shadow-xs uppercase tracking-wider">
                    {combo.badge}
                  </span>
                )}

                <div className="space-y-4">
                  <h3 className="font-extrabold text-base text-[#1B1B1B] pr-20">{combo.title}</h3>

                  {/* Components stack */}
                  <div className="space-y-2.5 text-xs text-zinc-700 bg-[#FAF7F2] p-3.5 rounded-xl border border-zinc-200">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] grid place-items-center">1</span>
                      <span className="font-semibold truncate">{cpu?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] grid place-items-center">2</span>
                      <span className="font-semibold truncate">{mb?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] grid place-items-center">3</span>
                      <span className="font-semibold truncate">{ram?.name}</span>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-black text-[#1B1B1B]">{formatINR(combo.comboPrice)}</span>
                    <span className="text-xs text-zinc-400 line-through font-semibold">{formatINR(combo.originalPrice)}</span>
                    <span className="text-xs font-bold text-emerald-700">Save {formatINR(combo.savings)}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleAddCombo(combo)}
                  className="mt-6 w-full py-3 bg-[#1B1B1B] hover:bg-[#D1121B] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <CartIcon className="w-4 h-4" /> Add 3-Item Bundle to Cart
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Flash Deals Catalog */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-[#1B1B1B] tracking-tight">
            Top Discounted Flash Deals
          </h2>
          <Link href="/category/graphics-cards" className="text-xs font-bold text-[#D1121B] hover:underline">
            View All Deals →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {dealsProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
