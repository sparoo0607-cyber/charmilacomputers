"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatINR, STORE } from "@/lib/format";
import ProductImage from "@/components/ProductImage";
import {
  UserIcon, TruckIcon, HeartIcon, ShieldCheckIcon,
  LocationIcon, PhoneIcon
} from "@/components/icons";

type AccountTab = "overview" | "orders" | "addresses" | "service" | "settings";
const ACCOUNT_TABS: AccountTab[] = ["overview", "orders", "addresses", "service", "settings"];
function isAccountTab(value: string): value is AccountTab {
  return (ACCOUNT_TABS as string[]).includes(value);
}

function AccountContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";
  const { user, authLoading, logout, orders, addToCart, showToast } = useCart();

  const [activeTab, setActiveTab] = useState<AccountTab>(
    isAccountTab(initialTab) ? initialTab : "overview"
  );
  // Re-sync the active tab when the ?tab= query param changes (e.g. navigating
  // here again from the header dropdown while already on /account). Adjusting
  // state during render — rather than in an effect — avoids an extra render pass.
  const [syncedTab, setSyncedTab] = useState(initialTab);
  if (initialTab !== syncedTab) {
    setSyncedTab(initialTab);
    if (isAccountTab(initialTab)) setActiveTab(initialTab);
  }

  // Saved addresses local state
  const [addresses] = useState([
    {
      id: "addr-1",
      name: "Srikanth Reddy (Home)",
      phone: "+91 98480 22334",
      street: "Flat 402, Sai Balaji Residency, Tilak Road",
      landmark: "Opposite Town Club",
      city: "Tirupati",
      state: "Andhra Pradesh",
      pincode: "517501",
      isDefault: true,
    },
    {
      id: "addr-2",
      name: "Srikanth Reddy (Office)",
      phone: "+91 98480 22334",
      street: "Suite 3B, Tech Park 2, High Road",
      landmark: "Near Bus Station",
      city: "Tirupati",
      state: "Andhra Pradesh",
      pincode: "517502",
      isDefault: false,
    },
  ]);

  // Wait for the initial session check before deciding whether to show the
  // sign-in prompt — otherwise an already-logged-in user briefly sees it
  // flash on every page load.
  if (authLoading) {
    return <div className="mx-auto max-w-lg px-4 py-20 text-center text-sm text-zinc-400 font-sans">Loading your account…</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center font-sans">
        <div className="w-16 h-16 bg-red-50 text-[#7A1118] rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
          <UserIcon className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-[#1B1B1B] mb-2">Sign in to your Account</h1>
        <p className="text-xs text-zinc-500 mb-6">
          Access your order history, manage addresses, track RMA repairs, and redeem Charmila Coins.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full py-3 bg-[#D1121B] hover:bg-[#7A1118] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
          >
            Login with Phone / Email
          </Link>
        </div>
      </div>
    );
  }

  function handleReorder(order: typeof orders[0]) {
    order.items.forEach((item) => {
      addToCart(item.productId, item.qty);
    });
    showToast("✓ Items from order added to cart!");
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-8 font-sans">
      {/* Breadcrumb */}
      <nav className="text-xs text-zinc-500 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-[#D1121B]">Home</Link>
        <span>/</span>
        <span className="text-[#1B1B1B] font-bold">My Account</span>
      </nav>

      {/* User Header Profile Banner */}
      <div className="bg-gradient-to-r from-[#263844] to-[#1D2B34] text-white p-6 sm:p-8 rounded-3xl border border-[#C89B3C]/40 shadow-sm mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#D1121B] text-white font-black text-xl flex items-center justify-center shadow-md border-2 border-white/20">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">{user.name}</h1>
            <p className="text-xs text-zinc-300 mt-0.5">{user.email} • {user.phone}</p>
            <p className="text-[11px] text-amber-300 font-semibold mt-1">Member since {user.joinedDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/10 px-4 py-2.5 rounded-2xl border border-white/15 backdrop-blur-xs">
          <div className="w-9 h-9 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
            <span className="text-xs font-black text-amber-300">CC</span>
          </div>
          <div>
            <span className="text-xs text-amber-300 font-extrabold uppercase tracking-wider block">Charmila Coins</span>
            <span className="text-lg font-black text-white">{user.charmilaCoins} Points</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Navigation (3 cols) */}
        <aside className="lg:col-span-3 space-y-2">
          <div className="bg-white p-3 rounded-2xl border border-[#E5E0D7] shadow-2xs space-y-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-2.5 ${
                activeTab === "overview" ? "bg-[#7A1118] text-white shadow-xs" : "text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Overview &amp; Profile</span>
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between ${
                activeTab === "orders" ? "bg-[#7A1118] text-white shadow-xs" : "text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <TruckIcon className="w-4 h-4" />
                <span>My Orders</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === "orders" ? "bg-white/20 text-white" : "bg-zinc-200 text-zinc-800"}`}>
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("addresses")}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-2.5 ${
                activeTab === "addresses" ? "bg-[#7A1118] text-white shadow-xs" : "text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              <LocationIcon className="w-4 h-4" />
              <span>Saved Addresses</span>
            </button>

            <button
              onClick={() => setActiveTab("service")}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-2.5 ${
                activeTab === "service" ? "bg-[#7A1118] text-white shadow-xs" : "text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              <ShieldCheckIcon className="w-4 h-4" />
              <span>Hardware Repairs &amp; AMC</span>
            </button>

            <Link
              href="/wishlist"
              className="w-full text-left px-4 py-3 rounded-xl text-zinc-700 hover:bg-zinc-100 transition-all flex items-center gap-2.5 block"
            >
              <HeartIcon className="w-4 h-4" />
              <span>Saved Wishlist</span>
            </Link>

            <div className="pt-2 border-t border-zinc-100">
              <button
                onClick={logout}
                className="w-full text-left px-4 py-3 rounded-xl text-red-600 font-extrabold hover:bg-red-50 transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Tab Content (9 cols) */}
        <main className="lg:col-span-9 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Quick stats banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#E5E0D7] shadow-2xs">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Total Orders</span>
                  <span className="text-2xl font-black text-[#1B1B1B] mt-1 block">{orders.length}</span>
                  <Link href="/account?tab=orders" className="text-[11px] font-bold text-[#7A1118] hover:underline mt-1 inline-block">
                    View order history →
                  </Link>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#E5E0D7] shadow-2xs">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Order Status</span>
                  <span className="text-sm font-bold text-zinc-700 mt-1 block">Ask us anytime</span>
                  <a
                    href={`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent("Hi, I'd like an update on my order status.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-[#7A1118] hover:underline mt-1 inline-block"
                  >
                    Check on WhatsApp →
                  </a>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#E5E0D7] shadow-2xs">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Charmila Coins</span>
                  <span className="text-2xl font-black text-amber-600 mt-1 block">{user.charmilaCoins}</span>
                  <span className="text-[11px] text-zinc-400">Worth ₹{user.charmilaCoins} on next order</span>
                </div>
              </div>

              {/* Recent Order Preview */}
              {orders.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-[#E5E0D7] shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <h3 className="font-extrabold text-sm text-[#1B1B1B] uppercase tracking-wider">
                      Most Recent Order
                    </h3>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                      {orders[0].status}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center text-xs gap-3">
                    <div>
                      <p className="font-bold text-zinc-900">Order #{orders[0].id}</p>
                      <p className="text-zinc-500">Placed on {new Date(orders[0].createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(`Hi, checking the status of order #${orders[0].id}.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#7A1118] hover:bg-[#D1121B] text-white px-4 py-2 rounded-xl font-bold uppercase tracking-wider text-[11px]"
                      >
                        Ask on WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <h2 className="text-lg font-black text-[#1B1B1B] uppercase tracking-wider">Order History</h2>
              <div className="space-y-4">
                {orders.map((o) => (
                  <div key={o.id} className="bg-white p-6 rounded-2xl border border-[#E5E0D7] shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-zinc-100 pb-3 gap-2">
                      <div>
                        <span className="font-extrabold text-sm text-zinc-900">Order #{o.id}</span>
                        <p className="text-xs text-zinc-500">Placed: {new Date(o.createdAt).toLocaleDateString("en-IN")}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                          {o.status}
                        </span>
                        <span className="text-sm font-black text-[#1B1B1B]">{formatINR(o.total)}</span>
                      </div>
                    </div>

                    {/* Items stack */}
                    <div className="divide-y divide-zinc-100">
                      {o.items.map((item, idx) => (
                        <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#FAF7F2] p-1 rounded-lg border border-zinc-200 shrink-0">
                              <ProductImage categorySlug={item.categorySlug} className="w-full h-full object-contain" />
                            </div>
                            <div>
                              <p className="font-bold text-zinc-900 line-clamp-1">{item.name}</p>
                              <p className="text-zinc-500">Qty: {item.qty} • {item.brand}</p>
                            </div>
                          </div>
                          <span className="font-bold text-zinc-900 shrink-0">{formatINR(item.price * item.qty)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-zinc-100 flex flex-wrap justify-between items-center gap-3">
                      <p className="text-xs text-zinc-500">
                        Delivery to: <strong>{o.shippingAddress.city}, {o.shippingAddress.pincode}</strong>
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReorder(o)}
                          className="px-4 py-2 border border-zinc-300 hover:bg-zinc-50 font-bold text-xs uppercase tracking-wider rounded-xl"
                        >
                          Reorder Items
                        </button>
                        <a
                          href={`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(`Hi, checking the status of order #${o.id}.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-[#7A1118] hover:bg-[#D1121B] text-white font-bold text-xs uppercase tracking-wider rounded-xl"
                        >
                          Ask on WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SAVED ADDRESSES */}
          {activeTab === "addresses" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-[#1B1B1B] uppercase tracking-wider">Saved Shipping Addresses</h2>
                <button className="bg-[#7A1118] text-white text-xs font-bold px-4 py-2 rounded-xl uppercase tracking-wider">
                  + Add New Address
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="bg-white p-5 rounded-2xl border border-[#E5E0D7] shadow-2xs space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-zinc-900">{addr.name}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-600">{addr.street}</p>
                    <p className="text-zinc-600">{addr.landmark}</p>
                    <p className="text-zinc-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                    <p className="text-zinc-600 font-semibold">Phone: {addr.phone}</p>
                    <div className="pt-3 border-t border-zinc-100 flex gap-3 text-xs font-bold text-[#7A1118]">
                      <button className="hover:underline">Edit</button>
                      <span>•</span>
                      <button className="hover:underline text-zinc-500">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SERVICE & REPAIR */}
          {activeTab === "service" && (
            <div className="space-y-6">
              <h2 className="text-lg font-black text-[#1B1B1B] uppercase tracking-wider">
                Hardware Service, Thermal Tuning &amp; Repair Booking
              </h2>
              <div className="bg-white p-6 rounded-2xl border border-[#E5E0D7] shadow-sm space-y-4 text-xs">
                <p className="text-zinc-600">
                  Book an in-store bench diagnostic slot or request doorstep pickup for laptop/desktop repair, custom liquid loop servicing, or deep cleaning.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 bg-[#FAF7F2] rounded-xl border border-zinc-200">
                    <h3 className="font-bold text-zinc-900">Custom Rig Assembly</h3>
                    <p className="text-zinc-500 mt-1">₹499 flat with 24h stress test</p>
                  </div>
                  <div className="p-4 bg-[#FAF7F2] rounded-xl border border-zinc-200">
                    <h3 className="font-bold text-zinc-900">Thermal Repaste &amp; Clean</h3>
                    <p className="text-zinc-500 mt-1">Arctic MX-6 applied</p>
                  </div>
                  <div className="p-4 bg-[#FAF7F2] rounded-xl border border-zinc-200">
                    <h3 className="font-bold text-zinc-900">Motherboard Chip-Level</h3>
                    <p className="text-zinc-500 mt-1">Free quotation first</p>
                  </div>
                </div>

                <a
                  href={`https://wa.me/${STORE.whatsapp}?text=Hi%20Charmila%20Computers,%20I%20want%20to%20book%20a%20PC%20service/repair%20slot`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl uppercase tracking-wider shadow-sm"
                >
                  <PhoneIcon className="w-4 h-4" /> Book Service Bench Slot on WhatsApp
                </a>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs">Loading account dashboard...</div>}>
      <AccountContent />
    </Suspense>
  );
}
