"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { STORE, formatINR, whatsappOrderLink } from "@/lib/format";
import {
  CartIcon, ChevronDownIcon, MenuIcon, PhoneIcon, SearchIcon, WhatsAppIcon, CloseIcon, HeartIcon,
  FacebookIcon, TwitterIcon, InstagramIcon, UserIcon, ComputerIcon, TrashIcon, BoltIcon, CompareIcon,
  ShieldCheckIcon, TruckIcon
} from "./icons";
import { useStoreTheme } from "@/hooks/useStoreTheme";

const trendingSearches = [
  "RTX 5060 Ti",
  "Ryzen 7 5700X",
  "Samsung 990 Pro",
  "DDR5 32GB RAM",
  "Thermaltake 240 AIO",
  "Core Ultra 7",
  "Gigabyte B650M",
];

const popularCategories = [
  { name: "Processors (Intel & AMD)", slug: "processors" },
  { name: "Graphics Cards (RTX 50 / 40)", slug: "graphics-cards" },
  { name: "DDR5 Gaming RAM", slug: "memory" },
  { name: "M.2 NVMe SSDs", slug: "ssd" },
  { name: "Custom Liquid Cooling", slug: "coolers" },
  { name: "Gaming Cabinets", slug: "cabinets" },
];

export default function Header() {
  const { lines, itemCount, subtotal, removeFromCart, wishlist, compareList, user, logout } = useCart();
  const activeTheme = useStoreTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isFestive = mounted && activeTheme === "festive";

  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setCartDropdownOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = query.trim().length > 1
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase()) ||
          p.categorySlug.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;
    setIsSearchFocused(false);
    const hit = products.find((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    if (hit) {
      router.push(`/product/${hit.id}`);
    } else {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 bg-white flex flex-col font-sans transition-all duration-200 border-b border-[#E5E0D7] ${
        scrolled ? "shadow-md" : "shadow-xs"
      }`}
    >
      {/* LEVEL 1 — MICRO UTILITY BAR */}
      <div className="bg-[#FAF7F2] border-b border-[#E5E0D7] text-[#6B6B6B] text-[11px]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 flex items-center justify-between h-7">
          {/* Left: Social Icons & Helpline */}
          <div className="flex items-center gap-3.5">
            <span className="hidden sm:inline text-[10px] text-[#929292] font-semibold uppercase tracking-wider">Follow Us:</span>
            <div className="flex items-center gap-2.5">
              <a href={STORE.social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-[#7A1118] transition-colors" aria-label="Facebook"><FacebookIcon className="w-3 h-3" /></a>
              <a href={STORE.social.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-[#7A1118] transition-colors" aria-label="Twitter"><TwitterIcon className="w-3 h-3" /></a>
              <a href={STORE.social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-[#7A1118] transition-colors" aria-label="Instagram"><InstagramIcon className="w-3 h-3" /></a>
              <a href={`https://wa.me/${STORE.whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition-colors" aria-label="WhatsApp">
                <WhatsAppIcon className="w-3 h-3" />
              </a>
            </div>
            <span className="text-[#E5E0D7]">|</span>
            <a href={`tel:${STORE.phonePrimary}`} className="hidden md:flex items-center gap-1 text-[11px] text-[#4E0B10] font-bold hover:text-[#7A1118]">
              <PhoneIcon className="w-3 h-3" />
              <span>Helpline: {STORE.phonePrimary}</span>
            </a>
          </div>

          {/* Right: Quick Links */}
          <div className="flex items-center gap-3 sm:gap-4 uppercase font-bold tracking-wider text-[10px] text-[#6B6B6B]">
            <Link href="/deals" className="text-[#D1121B] hover:text-[#7A1118] transition-colors flex items-center gap-1">
              <BoltIcon className="w-3 h-3 text-[#D1121B]" /> {isFestive ? "Festive Deals" : "Hot Deals"}
            </Link>
            <span className="text-[#E5E0D7]">|</span>
            <a
              href={`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent("Hi, I'd like an update on my order status.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#7A1118] transition-colors flex items-center gap-1"
            >
              <TruckIcon className="w-3 h-3" /> Order Status
            </a>
            <span className="text-[#E5E0D7] hidden sm:inline">|</span>
            <Link href="/warranty-rma" className="hover:text-[#7A1118] transition-colors hidden sm:flex items-center gap-1">
              <ShieldCheckIcon className="w-3 h-3" /> Warranty &amp; RMA
            </Link>
            <span className="text-[#E5E0D7]">|</span>
            <Link href="/about" className="hover:text-[#7A1118] transition-colors">About Us</Link>
            <span className="text-[#E5E0D7]">|</span>
            <Link href="/contact" className="hover:text-[#7A1118] transition-colors">Contact</Link>
          </div>
        </div>
      </div>

      {/* LEVEL 2 — MAIN HEADER */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-3 flex items-center justify-between gap-4 lg:gap-8 w-full">
        {/* Mobile menu button */}
        <button
          className="md:hidden p-1 text-[#1B1B1B] rounded transition-transform active:scale-90"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        {/* Brand Logo */}
        <Link href="/" className="flex items-center shrink-0 group select-none">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#7A1118] transition-colors group-hover:text-[#D1121B]">
            CHARMILA
            <span className="font-black text-[#D1121B] ml-1 bg-gradient-to-r from-[#D1121B] to-[#7A1118] bg-clip-text text-transparent transition-opacity group-hover:opacity-90">
              COMPUTERS
            </span>
          </span>
        </Link>

        {/* Desktop Search Bar */}
        <div ref={searchRef} className="hidden md:flex flex-1 max-w-[620px] relative mx-2">
          <form onSubmit={handleSearch} role="search" className="w-full">
            <div className={`flex w-full border-2 rounded-md overflow-hidden bg-white transition-all duration-200 ${
              isSearchFocused ? "border-[#7A1118] shadow-[0_0_0_3px_rgba(122,17,24,0.15)]" : "border-[#D1121B]/80 hover:border-[#D1121B]"
            }`}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                type="text"
                placeholder="Search products, components, brands (e.g. RTX 5060, Ryzen 7)..."
                aria-label="Search products"
                className="w-full px-4 py-2 text-xs lg:text-sm text-[#1B1B1B] placeholder:text-[#929292] focus:outline-none bg-white font-medium"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-[#7A1118] to-[#D1121B] hover:from-[#4E0B10] hover:to-[#B81D15] text-white px-5 sm:px-6 transition-colors flex items-center justify-center font-bold text-xs"
                aria-label="Search"
              >
                <SearchIcon className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Search Dropdown on Focus */}
          {isSearchFocused && (
            <div className="absolute top-11 left-0 right-0 bg-white border border-[#E5E0D7] rounded-md shadow-2xl z-50 p-4 animate-fade-in-up text-left">
              {searchResults.length > 0 ? (
                <div>
                  <div className="text-[11px] font-extrabold text-[#7A1118] uppercase tracking-wider mb-2">Matching Products</div>
                  <div className="divide-y divide-zinc-100">
                    {searchResults.map((p) => (
                      <Link
                        key={p.id}
                        href={`/product/${p.id}`}
                        onClick={() => setIsSearchFocused(false)}
                        className="py-2 flex items-center justify-between hover:bg-amber-50/50 px-2 rounded transition-colors group"
                      >
                        <span className="text-xs font-semibold text-[#1B1B1B] group-hover:text-[#D1121B] line-clamp-1">{p.name}</span>
                        <span className="text-xs font-bold text-[#D1121B] shrink-0 ml-3">₹{p.price.toLocaleString("en-IN")}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <div className="text-[10px] font-extrabold text-[#929292] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <BoltIcon className="w-3 h-3 text-[#C89B3C]" /> Trending Searches
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {trendingSearches.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setQuery(item);
                            router.push(`/search?q=${encodeURIComponent(item)}`);
                            setIsSearchFocused(false);
                          }}
                          className="text-[11px] bg-[#FAF7F2] hover:bg-amber-100/60 text-[#1B1B1B] font-medium px-2.5 py-1 rounded border border-[#E5E0D7] transition-colors"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold text-[#929292] uppercase tracking-wider mb-1.5">Popular Categories</div>
                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      {popularCategories.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/category/${c.slug}`}
                          onClick={() => setIsSearchFocused(false)}
                          className="text-[#6B6B6B] hover:text-[#7A1118] font-medium p-1 hover:bg-zinc-50 rounded flex items-center gap-1 transition-colors"
                        >
                          <span className="text-[#C89B3C] text-[10px]">›</span> {c.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions: Build PC, Compare, Wishlist, Account, Cart */}
        <div className="flex items-center gap-3 sm:gap-4 lg:gap-5 shrink-0">
          {/* Build Your PC Button */}
          <Link
            href="/build-your-pc"
            className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-[#4E0B10] to-[#7A1118] hover:from-[#7A1118] hover:to-[#D1121B] text-white px-3.5 py-2 rounded-md font-bold text-xs shadow-sm hover:shadow transition-all duration-200 uppercase tracking-wider border border-red-500/50 hover:scale-[1.02]"
          >
            <ComputerIcon className="w-4 h-4 text-white" />
            <span>BUILD YOUR PC</span>
            <span className="bg-[#D1121B] text-white text-[8px] px-1.5 py-0.5 rounded font-black border border-red-400/40">
              CUSTOM
            </span>
          </Link>

          {/* Compare */}
          <Link
            href="/compare"
            className="p-1.5 text-[#1B1B1B] hover:text-[#7A1118] transition-colors relative hidden md:block"
            aria-label="Compare"
            title="Compare Products"
          >
            <CompareIcon className="w-5 h-5" />
            {compareList.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#263844] text-white text-[9px] font-black rounded-full w-4 h-4 grid place-items-center shadow-xs">
                {compareList.length}
              </span>
            )}
          </Link>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="p-1.5 text-[#1B1B1B] hover:text-[#7A1118] transition-colors relative"
            aria-label="Wishlist"
            title="My Wishlist"
          >
            <HeartIcon className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D1121B] text-white text-[9px] font-black rounded-full w-4 h-4 grid place-items-center shadow-xs">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Account Dropdown */}
          <div ref={accountRef} className="relative hidden sm:block">
            <button
              onClick={() => setAccountDropdownOpen((v) => !v)}
              className="p-1.5 text-[#1B1B1B] hover:text-[#7A1118] transition-colors flex items-center gap-1"
              aria-label="Account"
            >
              <UserIcon className="w-5 h-5" />
              {user && (
                <span className="text-[11px] font-bold text-zinc-700 hidden lg:inline max-w-[80px] truncate">
                  {user.name.split(" ")[0]}
                </span>
              )}
            </button>

            {accountDropdownOpen && (
              <div className="absolute right-0 top-10 w-56 bg-white border border-[#E5E0D7] shadow-2xl rounded-lg p-2 z-50 animate-fade-in-up text-left">
                {user ? (
                  <div>
                    <div className="p-2.5 border-b border-zinc-100">
                      <p className="text-xs font-bold text-[#1B1B1B] truncate">{user.name}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1 text-[10px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 w-fit">
                        {user.charmilaCoins} Coins
                      </div>
                    </div>
                    <div className="py-1 text-xs">
                      {user.isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center justify-between px-3 py-1.5 mb-1 bg-[#17130F] text-[#FFE58F] font-bold rounded-md hover:bg-black transition-colors"
                        >
                          <span>Admin Console</span>
                          <span className="text-[9px] bg-[#D1121B] text-white px-1.5 py-0.2 rounded font-black">STAFF</span>
                        </Link>
                      )}
                      <Link
                        href="/account"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="block px-3 py-1.5 hover:bg-zinc-50 font-semibold text-zinc-700 hover:text-[#D1121B]"
                      >
                        Dashboard &amp; Profile
                      </Link>
                      <Link
                        href="/account?tab=orders"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="block px-3 py-1.5 hover:bg-zinc-50 font-semibold text-zinc-700 hover:text-[#D1121B]"
                      >
                        My Orders
                      </Link>
                      <Link
                        href="/wishlist"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="block px-3 py-1.5 hover:bg-zinc-50 font-semibold text-zinc-700 hover:text-[#D1121B]"
                      >
                        Saved Wishlist
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setAccountDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-red-50 font-bold text-red-600 border-t border-zinc-100 mt-1"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    <p className="text-xs font-bold text-zinc-800">Welcome to Charmila Computers</p>
                    <Link
                      href="/login"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="block w-full text-center py-2 text-xs font-bold text-white bg-[#D1121B] hover:bg-[#7A1118] rounded-md shadow-xs"
                    >
                      Login / Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="block w-full text-center py-1.5 text-xs font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md"
                    >
                      Create Account
                    </Link>
                  </div>
                )}


              </div>
            )}
          </div>

          {/* Cart with Mini-Cart Preview Panel */}
          <div ref={cartRef} className="relative">
            <button
              onClick={() => setCartDropdownOpen((v) => !v)}
              className="relative p-1.5 text-[#1B1B1B] hover:text-[#7A1118] transition-colors flex items-center gap-2 group"
              aria-label={`Cart with ${itemCount} items`}
            >
              <div className="relative">
                <CartIcon className="w-5 h-5 group-hover:scale-105 transition-transform" />
                {itemCount > 0 && (
                  <span
                    key={itemCount}
                    className="absolute -top-2 -right-2 bg-[#D1121B] text-white text-[9px] font-black rounded-full w-4 h-4 grid place-items-center shadow-sm"
                  >
                    {itemCount}
                  </span>
                )}
              </div>
              <div className="hidden xl:flex flex-col text-left text-xs leading-none">
                <span className="text-[9px] text-[#929292] font-semibold uppercase">My Cart</span>
                <span className="text-xs font-bold text-[#1B1B1B]">{formatINR(subtotal)}</span>
              </div>
            </button>

            {/* Mini Cart Panel Dropdown */}
            {cartDropdownOpen && (
              <div className="absolute right-0 top-10 w-80 sm:w-96 bg-white border border-[#E5E0D7] shadow-2xl rounded-lg p-4 z-50 animate-fade-in-up text-left">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2 mb-3">
                  <span className="font-extrabold text-xs text-[#1B1B1B] uppercase tracking-wider">
                    Shopping Cart ({itemCount})
                  </span>
                  <span className="text-xs font-black text-[#D1121B]">{formatINR(subtotal)}</span>
                </div>

                {lines.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#6B6B6B]">
                    Your shopping cart is empty.
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto divide-y divide-zinc-100 mb-3 pr-1">
                    {lines.map((item) => {
                      const prod = products.find((p) => p.id === item.productId);
                      if (!prod) return null;
                      return (
                        <div key={item.productId} className="py-2.5 flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[#1B1B1B] truncate">{prod.name}</p>
                            <p className="text-[11px] text-[#6B6B6B]">
                              {item.qty} × {formatINR(prod.price)}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="text-[#929292] hover:text-[#D1121B] p-1 transition-colors"
                            aria-label="Remove item"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100">
                  <Link
                    href="/cart"
                    onClick={() => setCartDropdownOpen(false)}
                    className="w-full text-center py-2 text-xs font-bold text-[#1B1B1B] bg-[#FAF7F2] hover:bg-zinc-200 rounded transition-colors uppercase"
                  >
                    View Cart
                  </Link>
                  <a
                    href={whatsappOrderLink(
                      [
                        `Hi ${STORE.name}, please quote this order:`,
                        ...lines.map((item) => {
                          const prod = products.find((p) => p.id === item.productId);
                          return prod ? `• ${prod.name} x${item.qty} — ${formatINR(prod.price * item.qty)}` : "";
                        }).filter(Boolean),
                        `Total: ${formatINR(subtotal)}`,
                      ].join("\n")
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setCartDropdownOpen(false)}
                    className="w-full flex items-center justify-center gap-1.5 text-center py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors uppercase shadow-sm"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" /> Get Quote
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LEVEL 3 — CATEGORY NAVIGATION */}
      <nav className="hidden md:block bg-[#7A1118] text-white border-t border-[#4E0B10] shadow-inner">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 flex items-center h-10">
          {/* Categories Button with Mega-Menu */}
          <div
            className="relative h-full"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button
              className="flex items-center gap-2 bg-[#4E0B10] h-full px-5 font-extrabold text-xs tracking-wider uppercase transition-colors hover:bg-[#39070B] border-r border-[#39070B]"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <MenuIcon className="w-4 h-4 text-white" />
              <span>ALL CATEGORIES</span>
              <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Mega Menu Dropdown */}
            <div
              className={`absolute left-0 top-10 w-[840px] bg-white text-[#1B1B1B] shadow-2xl border border-[#E5E0D7] rounded-b-md grid grid-cols-3 gap-2 p-5 z-50 text-left origin-top transition-all duration-150 ${
                menuOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-[0.98] pointer-events-none"
              }`}
            >
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className="p-2.5 rounded-md hover:bg-amber-50/60 flex flex-col group border border-transparent hover:border-amber-200 transition-all"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="font-bold text-xs group-hover:text-[#7A1118] transition-colors">{c.name}</span>
                  <span className="text-[10px] text-[#6B6B6B] mt-0.5 line-clamp-1">{c.blurb}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Primary Nav Links */}
          <div className="flex items-center gap-5 lg:gap-6 ml-5 font-bold text-xs uppercase tracking-wider text-white">
            <Link href="/category/processors" className={isFestive ? "hover:text-[#FFE58F] transition-colors" : "text-white hover:text-black transition-colors"}>Processors</Link>
            <Link href="/category/graphics-cards" className={isFestive ? "hover:text-[#FFE58F] transition-colors" : "text-white hover:text-black transition-colors"}>Graphics Cards</Link>
            <Link href="/category/motherboards" className={isFestive ? "hover:text-[#FFE58F] transition-colors" : "text-white hover:text-black transition-colors"}>Motherboards</Link>
            <Link href="/category/memory" className={isFestive ? "hover:text-[#FFE58F] transition-colors" : "text-white hover:text-black transition-colors"}>Memory</Link>
            <Link href="/category/ssd" className={isFestive ? "hover:text-[#FFE58F] transition-colors" : "text-white hover:text-black transition-colors"}>Storage</Link>
            <Link href="/category/coolers" className={isFestive ? "hover:text-[#FFE58F] transition-colors" : "text-white hover:text-black transition-colors"}>Cooling</Link>
            <Link href="/category/monitors" className={isFestive ? "hover:text-[#FFE58F] transition-colors" : "text-white hover:text-black transition-colors"}>Monitors</Link>
            <Link href="/deals" className={isFestive ? "text-[#FFD700] hover:text-white transition-colors flex items-center gap-1 font-extrabold" : "text-white hover:text-black transition-colors flex items-center gap-1 font-extrabold"}>
              <BoltIcon className={`w-3 h-3 ${isFestive ? "text-[#FFD700]" : "text-[#D1121B]"}`} />
              <span>{isFestive ? "Festive Deals" : "Hot Deals"}</span>
            </Link>
            <Link href="/compare" className={isFestive ? "hover:text-[#FFE58F] transition-colors" : "text-white hover:text-black transition-colors"}>Compare</Link>
          </div>

          <div className={`ml-auto text-[10px] font-bold uppercase tracking-widest hidden lg:flex items-center gap-1.5 ${isFestive ? "text-[#FFE58F]" : "text-white"}`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isFestive ? "bg-[#FFD700]" : "bg-white"}`} />
            <span>{isFestive ? "Vinayaka Chavithi Mega Deals Live" : "Official Brand Warranty & Express Shipping"}</span>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-[#E5E0D7] bg-white max-h-[75vh] overflow-y-auto font-semibold text-xs animate-fade-in-up"
        >
          <div className="p-3 bg-[#FAF7F2] border-b border-[#E5E0D7] flex flex-col gap-2">
            <Link
              href="/build-your-pc"
              className="flex items-center justify-center gap-2 bg-[#7A1118] text-white py-2.5 rounded-lg font-bold uppercase tracking-wider shadow-sm"
              onClick={() => setMobileOpen(false)}
            >
              <ComputerIcon className="w-4 h-4 text-[#FFD700]" />
              <span>BUILD YOUR PC</span>
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/deals"
                className="flex items-center justify-center gap-1 bg-amber-50 text-[#D1121B] border border-amber-200 py-2 rounded-lg font-bold uppercase tracking-wider text-[11px]"
                onClick={() => setMobileOpen(false)}
              >
                <BoltIcon className="w-3 h-3 text-[#D1121B]" /> Festive Deals
              </Link>
              <a
                href={`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent("Hi, I'd like an update on my order status.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 bg-zinc-100 text-zinc-800 py-2 rounded-lg font-bold uppercase tracking-wider text-[11px]"
                onClick={() => setMobileOpen(false)}
              >
                <TruckIcon className="w-3 h-3" /> Order Status
              </a>
            </div>
          </div>

          <div className="divide-y divide-zinc-100">
            <Link href="/account" className="block px-4 py-2.5 text-[#1B1B1B] font-bold hover:bg-zinc-50" onClick={() => setMobileOpen(false)}>
              My Account &amp; Orders
            </Link>
            <Link href="/wishlist" className="block px-4 py-2.5 text-[#1B1B1B] font-bold hover:bg-zinc-50" onClick={() => setMobileOpen(false)}>
              Saved Wishlist ({wishlist.length})
            </Link>
            <Link href="/compare" className="block px-4 py-2.5 text-[#1B1B1B] font-bold hover:bg-zinc-50" onClick={() => setMobileOpen(false)}>
              Compare Products ({compareList.length})
            </Link>
            <Link href="/warranty-rma" className="block px-4 py-2.5 text-zinc-700 hover:bg-zinc-50" onClick={() => setMobileOpen(false)}>
              Warranty &amp; RMA Service
            </Link>
            <Link href="/about" className="block px-4 py-2.5 text-zinc-700 hover:bg-zinc-50" onClick={() => setMobileOpen(false)}>
              About Us
            </Link>
            <Link href="/contact" className="block px-4 py-2.5 text-zinc-700 hover:bg-zinc-50" onClick={() => setMobileOpen(false)}>
              Contact &amp; Store Location
            </Link>

            <div className="p-3 bg-zinc-50 text-[11px] font-bold text-zinc-500 uppercase">
              Categories
            </div>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className="block px-4 py-2.5 text-[#1B1B1B] hover:bg-zinc-50"
                onClick={() => setMobileOpen(false)}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
