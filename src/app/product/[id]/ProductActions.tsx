"use client";

import { useState } from "react";
import { Product } from "@/data/types";
import { formatINR, STORE, whatsappOrderLink } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import {
  CartIcon, CheckIcon, MinusIcon, PlusIcon, StarIcon, HeartIcon, CompareIcon,
  ShieldCheckIcon, TruckIcon, BoltIcon, CreditCardIcon, WhatsAppIcon
} from "@/components/icons";

export default function ProductActions({ product }: { product: Product }) {
  const { addToCart, isInWishlist, toggleWishlist, addToCompare, isInCompare, showToast } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [pincode, setPincode] = useState("517501");
  const [pinChecked, setPinChecked] = useState(true);
  const [showEmiModal, setShowEmiModal] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);

  function handleAdd() {
    addToCart(product.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleBuyNow() {
    addToCart(product.id, qty);
    const message = [
      `Hi ${STORE.name}, please quote this order:`,
      `• ${product.name} x${qty} — ${formatINR(product.price * qty)}`,
      `Total: ${formatINR(product.price * qty)}`,
    ].join("\n");
    window.open(whatsappOrderLink(message), "_blank", "noopener,noreferrer");
  }

  function handleCheckPin(e: React.FormEvent) {
    e.preventDefault();
    if (pincode.trim().length === 6) {
      setPinChecked(true);
      showToast(`Delivery available to pincode ${pincode}!`);
    }
  }

  const discount = product.mrp && product.mrp > product.price ? Math.round(100 - (product.price / product.mrp) * 100) : null;
  const emiPerMonth = Math.round(product.price / 6);

  return (
    <div className="space-y-5">
      {/* Rating & Reviews Header */}
      <div className="flex items-center gap-3">
        {product.rating && (
          <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} className="w-3.5 h-3.5" filled={i < Math.round(product.rating!)} />
            ))}
            <span className="text-xs font-black text-zinc-800 ml-1">{product.rating}</span>
            <span className="text-[11px] text-zinc-500">({product.reviewsCount || 42} reviews)</span>
          </div>
        )}
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
          ✓ 100% Genuine &amp; Sealed
        </span>
      </div>

      {/* Pricing block */}
      <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E5E0D7]">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl lg:text-4xl font-black text-[#1B1B1B]">{formatINR(product.price)}</span>
          {product.mrp && <span className="text-base text-zinc-400 line-through font-semibold">{formatINR(product.mrp)}</span>}
          {discount && (
            <span className="text-xs font-black text-white bg-[#D1121B] px-2 py-0.5 rounded uppercase tracking-wider">
              SAVE {discount}%
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-500 mt-1 font-medium">Inclusive of all taxes (GST 18% Input Tax Credit Available)</p>

        {/* EMI Notice */}
        <div className="mt-3 pt-3 border-t border-zinc-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-zinc-700">
            <CreditCardIcon className="w-4 h-4 text-[#C89B3C]" />
            <span>
              No Cost EMI from <strong className="text-[#1B1B1B]">{formatINR(emiPerMonth)}/month</strong>
            </span>
          </div>
          <button
            onClick={() => setShowEmiModal(true)}
            className="text-xs font-bold text-[#7A1118] hover:underline"
          >
            View Plans
          </button>
        </div>
      </div>

      {/* Bank & Festive Offers */}
      <div className="border border-amber-300 bg-amber-50/70 rounded-xl p-3.5 space-y-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-[#7A1118] uppercase tracking-wider text-[11px]">
          <BoltIcon className="w-4 h-4 text-amber-500" /> Festive Offers &amp; Discounts
        </div>
        <ul className="space-y-1.5 text-zinc-700">
          <li className="flex items-start gap-1.5">
            <span className="text-emerald-600 font-bold">●</span>
            <span>Mention coupon code <strong>VINAYAKA500</strong> in your WhatsApp order for flat ₹500 off.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-emerald-600 font-bold">●</span>
            <span>5% Instant Discount on HDFC &amp; ICICI Bank Credit/Debit Cards.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-emerald-600 font-bold">●</span>
            <span>Earn <strong>{Math.round(product.price / 100)} Charmila Coins</strong> on this purchase.</span>
          </li>
        </ul>
      </div>

      {/* Quantity & Action Buttons */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {/* Quantity Selector */}
          <div className="flex items-center border border-zinc-300 rounded-xl bg-white overflow-hidden shadow-xs">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="p-3 hover:bg-zinc-100 transition-colors text-zinc-600"
              aria-label="Decrease quantity"
            >
              <MinusIcon className="w-4 h-4" />
            </button>
            <span className="w-12 text-center font-bold text-sm tabular-nums">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(product.stockQty || 10, q + 1))}
              className="p-3 hover:bg-zinc-100 transition-colors text-zinc-600"
              aria-label="Increase quantity"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className={`flex-1 flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-xs py-3.5 rounded-xl transition-all duration-200 shadow-md active:scale-98 ${
              added
                ? "bg-emerald-600 text-white"
                : "bg-[#1B1B1B] text-white hover:bg-[#2c2c2c]"
            } disabled:bg-zinc-200 disabled:text-zinc-500`}
          >
            {added ? (
              <>
                <CheckIcon className="w-4 h-4" /> Added to Cart!
              </>
            ) : (
              <>
                <CartIcon className="w-4 h-4" /> Add to Cart
              </>
            )}
          </button>

          {/* Buy Now Button */}
          <button
            onClick={handleBuyNow}
            disabled={!product.inStock}
            className="flex-1 flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider text-xs py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md active:scale-98 disabled:bg-zinc-200 disabled:text-zinc-500"
          >
            <WhatsAppIcon className="w-4 h-4" /> Get Quote
          </button>
        </div>

        {/* Wishlist & Compare Row */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => toggleWishlist(product.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
              inWishlist
                ? "border-red-300 bg-red-50 text-[#D1121B]"
                : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
            }`}
          >
            <HeartIcon className="w-4 h-4" filled={inWishlist} />
            <span>{inWishlist ? "Saved in Wishlist" : "Add to Wishlist"}</span>
          </button>

          <button
            onClick={() => addToCompare(product.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
              inCompare
                ? "border-[#263844] bg-[#263844] text-white"
                : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
            }`}
          >
            <CompareIcon className="w-4 h-4" />
            <span>{inCompare ? "In Comparison" : "Compare Specs"}</span>
          </button>
        </div>
      </div>

      {/* Pincode Delivery Checker */}
      <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-2 text-xs">
        <div className="flex items-center gap-2 font-bold text-zinc-800">
          <TruckIcon className="w-4 h-4 text-[#7A1118]" />
          <span>Check Delivery Speed &amp; Cash on Delivery</span>
        </div>
        <form onSubmit={handleCheckPin} className="flex gap-2">
          <input
            type="text"
            maxLength={6}
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            placeholder="Enter 6-digit Pincode"
            className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-medium focus:outline-none focus:border-[#7A1118]"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-zinc-800 text-white font-bold text-xs rounded-lg hover:bg-black uppercase tracking-wider shrink-0"
          >
            Check
          </button>
        </form>

        {pinChecked && (
          <div className="pt-2 text-[11px] text-zinc-600 space-y-1">
            <p className="flex items-center gap-1 text-emerald-700 font-bold">
              ✓ Express Delivery in 2-3 Business Days to {pincode}
            </p>
            <p>✓ Cash on Delivery &amp; UPI on Delivery available</p>
            <p>✓ Free shipping on orders above ₹3,000</p>
          </div>
        )}
      </div>

      {/* Trust & Guarantee Badges */}
      <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-zinc-600">
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-50 border border-zinc-100">
          <ShieldCheckIcon className="w-5 h-5 text-[#C89B3C] shrink-0" />
          <div>
            <p className="font-bold text-zinc-800 text-[11px]">Official Warranty</p>
            <p className="text-[10px] text-zinc-500">100% Brand Warranty</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-50 border border-zinc-100">
          <TruckIcon className="w-5 h-5 text-[#C89B3C] shrink-0" />
          <div>
            <p className="font-bold text-zinc-800 text-[11px]">Pan-India Express</p>
            <p className="text-[10px] text-zinc-500">BlueDart / Delhivery</p>
          </div>
        </div>
      </div>

      {/* EMI Modal */}
      {showEmiModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fade-in-up space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h3 className="font-bold text-base text-zinc-900">EMI Options &amp; Plans</h3>
              <button onClick={() => setShowEmiModal(false)} className="text-zinc-400 hover:text-black">
                ✕
              </button>
            </div>
            <p className="text-xs text-zinc-500">
              Ask about No-Cost and Standard EMI tenures with an eligible credit card when you WhatsApp us your order.
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-3 border border-emerald-200 bg-emerald-50 rounded-lg flex justify-between font-bold text-zinc-800">
                <span>3 Months No-Cost EMI</span>
                <span className="text-emerald-700">{formatINR(Math.round(product.price / 3))}/mo</span>
              </div>
              <div className="p-3 border border-emerald-200 bg-emerald-50 rounded-lg flex justify-between font-bold text-zinc-800">
                <span>6 Months No-Cost EMI</span>
                <span className="text-emerald-700">{formatINR(Math.round(product.price / 6))}/mo</span>
              </div>
              <div className="p-3 border border-zinc-200 rounded-lg flex justify-between text-zinc-700">
                <span>9 Months (14% p.a.)</span>
                <span>{formatINR(Math.round((product.price * 1.07) / 9))}/mo</span>
              </div>
              <div className="p-3 border border-zinc-200 rounded-lg flex justify-between text-zinc-700">
                <span>12 Months (15% p.a.)</span>
                <span>{formatINR(Math.round((product.price * 1.1) / 12))}/mo</span>
              </div>
            </div>
            <button
              onClick={() => setShowEmiModal(false)}
              className="w-full py-2.5 bg-[#1B1B1B] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-black"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
