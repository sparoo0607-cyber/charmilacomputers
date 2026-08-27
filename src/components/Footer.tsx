"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { STORE } from "@/lib/format";
import { PhoneIcon, WhatsAppIcon, FacebookIcon, TwitterIcon, InstagramIcon } from "./icons";
import { useStoreTheme } from "@/hooks/useStoreTheme";

export default function Footer() {
  const activeTheme = useStoreTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isFestive = mounted && activeTheme === "festive";

  return (
    <footer className="mt-14 bg-[#263844] text-zinc-300 font-sans border-t-2 border-[#C89B3C]/50 relative">
      {/* Back to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#D1121B] text-white shadow-xl grid place-items-center hover:bg-[#1B1B1B] transition-all hover:-translate-y-1 duration-200 border-2 border-white/20"
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5}>
          <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 pt-12 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 text-xs">
          {/* Brand & Story Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center group select-none">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white transition-colors group-hover:text-zinc-200">
                CHARMILA
                <span className={`font-black ml-1 transition-opacity group-hover:opacity-90 ${isFestive ? "text-[#C89B3C]" : "text-[#D1121B]"}`}>
                  COMPUTERS
                </span>
              </span>
            </Link>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
              India&apos;s premier computer hardware, gaming components and custom PC builder destination. Delivering genuine components with official manufacturer warranty pan-India.
            </p>
            <div className={`pt-1 text-[11px] font-semibold flex items-center gap-2 ${isFestive ? "text-amber-300" : "text-red-400"}`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isFestive ? "bg-[#C89B3C]" : "bg-[#D1121B]"}`} />
              <span>{isFestive ? "Vinayaka Chavithi Festive Deals Active" : "Official Brand Warranty & Express Shipping"}</span>
            </div>

            {/* Social Icons */}
            <div className="flex gap-2.5 pt-2">
              <a href={STORE.social.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 border border-white/15 flex items-center justify-center hover:bg-[#D1121B] transition-colors text-white" aria-label="Facebook"><FacebookIcon className="w-3.5 h-3.5" /></a>
              <a href={STORE.social.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 border border-white/15 flex items-center justify-center hover:bg-[#D1121B] transition-colors text-white" aria-label="Twitter"><TwitterIcon className="w-3.5 h-3.5" /></a>
              <a href={`https://wa.me/${STORE.whatsapp}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 border border-white/15 flex items-center justify-center hover:bg-[#25D366] transition-colors text-white" aria-label="WhatsApp"><WhatsAppIcon className="w-3.5 h-3.5" /></a>
              <a href={STORE.social.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 border border-white/15 flex items-center justify-center hover:bg-[#D1121B] transition-colors text-white" aria-label="Instagram"><InstagramIcon className="w-3.5 h-3.5" /></a>
            </div>
          </div>

          {/* Column 1: SHOP */}
          <div>
            <p className="text-white font-extrabold text-xs uppercase tracking-wider mb-4 border-b border-white/15 pb-2">SHOP</p>
            <ul className="space-y-2.5 text-[12px] text-zinc-300 font-medium">
              <li><Link href="/category/processors" className="hover:text-white flex items-center gap-1 transition-colors">Processors</Link></li>
              <li><Link href="/category/graphics-cards" className="hover:text-white flex items-center gap-1 transition-colors">Graphics Cards</Link></li>
              <li><Link href="/category/motherboards" className="hover:text-white flex items-center gap-1 transition-colors">Motherboards</Link></li>
              <li><Link href="/category/memory" className="hover:text-white flex items-center gap-1 transition-colors">RAM (Memory)</Link></li>
              <li><Link href="/category/ssd" className="hover:text-white flex items-center gap-1 transition-colors">Storage &amp; SSDs</Link></li>
              <li><Link href="/category/monitors" className="hover:text-white flex items-center gap-1 transition-colors">Monitors</Link></li>
            </ul>
          </div>

          {/* Column 2: BUILD & SPECIALS */}
          <div>
            <p className="text-white font-extrabold text-xs uppercase tracking-wider mb-4 border-b border-white/15 pb-2">SPECIALS</p>
            <ul className="space-y-2.5 text-[12px] text-zinc-300 font-medium">
              <li><Link href="/build-your-pc" className="hover:text-white flex items-center gap-1 transition-colors">Custom PC Builder</Link></li>
              <li><Link href="/deals" className={`flex items-center gap-1 transition-colors font-bold ${isFestive ? "text-amber-300 hover:text-white" : "text-red-400 hover:text-white"}`}>{isFestive ? "Festive Offers & Combos" : "Hot Offers & Deals"}</Link></li>
              <li><Link href="/compare" className="hover:text-white flex items-center gap-1 transition-colors">Compare Components</Link></li>
              <li><Link href="/wishlist" className="hover:text-white flex items-center gap-1 transition-colors">Saved Wishlist</Link></li>
              <li><Link href="/account" className="hover:text-white flex items-center gap-1 transition-colors">My Customer Account</Link></li>
            </ul>
          </div>

          {/* Column 3: SUPPORT & POLICIES */}
          <div>
            <p className="text-white font-extrabold text-xs uppercase tracking-wider mb-4 border-b border-white/15 pb-2">SUPPORT</p>
            <ul className="space-y-2.5 text-[12px] text-zinc-300 font-medium">
              <li>
                <a
                  href={`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent("Hi, I'd like an update on my order status.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1 transition-colors"
                >
                  Track Your Order
                </a>
              </li>
              <li><Link href="/warranty-rma" className="hover:text-white flex items-center gap-1 transition-colors">Warranty &amp; RMA Center</Link></li>
              <li><Link href="/about" className="hover:text-white flex items-center gap-1 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white flex items-center gap-1 transition-colors">Contact &amp; Store Locator</Link></li>
              <li><Link href="/login" className="hover:text-white flex items-center gap-1 transition-colors">Customer Login</Link></li>
            </ul>
          </div>

          {/* Column 4: CONTACT */}
          <div>
            <p className="text-white font-extrabold text-xs uppercase tracking-wider mb-4 border-b border-white/15 pb-2">CONTACT</p>
            <div className="space-y-2.5 text-[11px] text-zinc-300">
              <p className="text-zinc-400 leading-relaxed">{STORE.address}</p>
              <div className="pt-1 space-y-1">
                <a href={`tel:${STORE.phonePrimary}`} className="hover:text-white flex items-center gap-1.5 transition-colors font-bold text-white">
                  <PhoneIcon className={`w-3.5 h-3.5 ${isFestive ? "text-[#C89B3C]" : "text-[#D1121B]"}`} />
                  <span>{STORE.phonePrimary}</span>
                </a>
                <a href={`mailto:${STORE.email}`} className="hover:text-white block transition-colors text-zinc-400">
                  {STORE.email}
                </a>
              </div>
              <div className="pt-2 text-[10px] text-zinc-400">
                Mon - Sat: 10:30 AM - 7:30 PM IST
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Legal & Payment Strip */}
      <div className="border-t border-white/10 bg-[#1D2B34]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400">
          <div>
            Copyright © {new Date().getFullYear()} {STORE.name}. All Rights Reserved.
          </div>
          <div className="flex items-center gap-3 text-[10px] uppercase font-bold tracking-wider text-zinc-300">
            <span className="bg-white/10 px-2 py-1 rounded border border-white/15">UPI</span>
            <span className="bg-white/10 px-2 py-1 rounded border border-white/15">Net Banking</span>
            <span className="bg-white/10 px-2 py-1 rounded border border-white/15">Visa / MasterCard</span>
            <span className="bg-white/10 px-2 py-1 rounded border border-white/15">EMI Available</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
