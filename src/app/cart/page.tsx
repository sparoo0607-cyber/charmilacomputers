"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, AVAILABLE_COUPONS } from "@/context/CartContext";
import { getProduct } from "@/data/products";
import { formatINR, STORE, whatsappOrderLink } from "@/lib/format";
import ProductImage from "@/components/ProductImage";
import {
  CartIcon, MinusIcon, PlusIcon, TrashIcon, WhatsAppIcon,
  TruckIcon, CloseIcon
} from "@/components/icons";

export default function CartPage() {
  const router = useRouter();
  const {
    lines, updateQty, removeFromCart, subtotal, shippingFee, discount, total,
    appliedCoupon, applyCoupon, removeCoupon, clearCart, user
  } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  const items = lines
    .map((line) => ({ line, product: getProduct(line.productId) }))
    .filter((x) => x.product);

  const freeShippingThreshold = 3000;
  const amountNeededForFreeShip = Math.max(0, freeShippingThreshold - subtotal);
  const freeShipProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  function handleApplyCoupon(codeToApply?: string) {
    setCouponError(null);
    const code = codeToApply || couponInput;
    if (!code) return;
    const res = applyCoupon(code);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput("");
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center font-sans">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <CartIcon className="w-10 h-10 text-[#7A1118]" />
        </div>
        <h1 className="text-2xl font-black text-[#1B1B1B] mb-2">Your Shopping Cart is Empty</h1>
        <p className="text-sm text-zinc-500 mb-8 max-w-md mx-auto">
          Explore India&apos;s lowest prices on processors, graphics cards, custom gaming rigs, and genuine PC hardware.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="bg-[#D1121B] hover:bg-[#7A1118] text-white font-bold text-xs uppercase tracking-wider px-8 py-3 rounded-xl transition-all shadow-md active:scale-95"
          >
            Start Shopping
          </Link>
          <Link
            href="/build-your-pc"
            className="border-2 border-[#1B1B1B] text-[#1B1B1B] hover:bg-[#1B1B1B] hover:text-white font-bold text-xs uppercase tracking-wider px-8 py-3 rounded-xl transition-all active:scale-95"
          >
            Custom PC Builder
          </Link>
        </div>
      </div>
    );
  }

  // Build WhatsApp order message — includes user identity if logged in
  const orderMessage = [
    user
      ? `Hi ${STORE.name}, I\'d like to place an order.\nName: ${user.name}\nPhone: ${user.phone || "(not saved)"}\nEmail: ${user.email}`
      : `Hi ${STORE.name}, I\'d like to place an order:`,
    "",
    "*Order Details:*",
    ...items.map(({ line, product }) => `- ${product!.name} x${line.qty} = ${formatINR(product!.price * line.qty)}`),
    "",
    `Subtotal: ${formatINR(subtotal)}`,
    appliedCoupon ? `Coupon (${appliedCoupon.code}): -${formatINR(discount)}` : "",
    `Shipping: ${shippingFee === 0 ? "FREE" : formatINR(shippingFee)}`,
    `*Total: ${formatINR(total)}*`,
    "",
    "Please confirm my order. Thank you!",
  ]
    .filter((l) => l !== null && l !== undefined)
    .join("\n");

  // WhatsApp order handler — require login first
  function handleWhatsAppOrder() {
    if (!user) {
      router.push("/login?redirect=/cart");
      return;
    }
    window.open(whatsappOrderLink(orderMessage), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-8 font-sans">
      {/* Breadcrumb */}
      <nav className="text-xs text-zinc-500 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-[#D1121B]">Home</Link>
        <span>/</span>
        <span className="text-[#1B1B1B] font-bold">Shopping Cart</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-black text-[#1B1B1B] mb-6">
        Shopping Cart ({items.length} {items.length === 1 ? "Item" : "Items"})
      </h1>

      {/* Free Shipping Tier Banner */}
      <div className="mb-8 p-4 bg-white rounded-2xl border border-[#E5E0D7] shadow-2xs">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className="flex items-center gap-1.5 text-zinc-800">
            <TruckIcon className="w-4 h-4 text-[#7A1118]" />
            {amountNeededForFreeShip === 0 ? (
              <span className="text-emerald-700 font-extrabold">Free Pan-India Express Shipping unlocked!</span>
            ) : (
              <span>Add <strong>{formatINR(amountNeededForFreeShip)}</strong> more for FREE Express Shipping!</span>
            )}
          </span>
          <span className="text-zinc-500 font-bold">{freeShipProgress}%</span>
        </div>
        <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              amountNeededForFreeShip === 0 ? "bg-emerald-500" : "bg-gradient-to-r from-amber-500 to-[#D1121B]"
            }`}
            style={{ width: `${freeShipProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {items.map(({ line, product }) => (
            <div
              key={line.productId}
              className="flex flex-col sm:flex-row gap-4 p-4 sm:p-5 bg-white rounded-2xl border border-[#E5E0D7] shadow-2xs hover:shadow-sm transition-all"
            >
              <Link
                href={`/product/${product!.id}`}
                className="shrink-0 bg-[#FAF7F2] p-2 rounded-xl border border-zinc-200 self-center sm:self-start"
              >
                <ProductImage categorySlug={product!.categorySlug} className="w-20 h-20 sm:w-24 sm:h-24 object-contain" />
              </Link>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-[#7A1118] uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    {product!.brand}
                  </span>
                  <Link
                    href={`/product/${product!.id}`}
                    className="mt-1 block font-bold text-sm text-[#1B1B1B] hover:text-[#D1121B] transition-colors line-clamp-2"
                  >
                    {product!.name}
                  </Link>
                  <p className="text-xs text-zinc-400 mt-0.5">Model: {product!.model}</p>
                </div>

                <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
                  {/* Price info */}
                  <div>
                    <span className="text-base font-extrabold text-[#1B1B1B]">
                      {formatINR(product!.price * line.qty)}
                    </span>
                    {line.qty > 1 && (
                      <span className="text-xs text-zinc-500 ml-1.5">
                        ({formatINR(product!.price)} each)
                      </span>
                    )}
                  </div>

                  {/* Quantity and Delete Controls */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-zinc-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                      <button
                        onClick={() => updateQty(line.productId, line.qty - 1)}
                        className="p-1.5 hover:bg-zinc-100 transition-colors text-zinc-600"
                        aria-label="Decrease quantity"
                      >
                        <MinusIcon className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold tabular-nums">{line.qty}</span>
                      <button
                        onClick={() => updateQty(line.productId, line.qty + 1)}
                        className="p-1.5 hover:bg-zinc-100 transition-colors text-zinc-600"
                        aria-label="Increase quantity"
                      >
                        <PlusIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(line.productId)}
                      className="p-2 text-zinc-400 hover:text-[#D1121B] hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove from Cart"
                      aria-label={`Remove ${product!.name} from cart`}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={clearCart}
              className="text-xs font-bold text-zinc-500 hover:text-[#D1121B] transition-colors"
            >
              Clear Entire Cart
            </button>
            <Link
              href="/"
              className="text-xs font-bold text-[#7A1118] hover:underline"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary (4 cols) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Summary Box */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E0D7] shadow-sm space-y-5 sticky top-28">
            <h2 className="font-extrabold text-base text-[#1B1B1B] uppercase tracking-wider pb-3 border-b border-zinc-200">
              Order Summary
            </h2>

            {/* Subtotal Breakup */}
            <div className="space-y-2.5 text-xs text-zinc-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-zinc-900">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-bold text-zinc-900">
                  {shippingFee === 0 ? <span className="text-emerald-700">FREE</span> : formatINR(shippingFee)}
                </span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span>-{formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[11px] text-zinc-500 pt-1">
                <span>Included GST (18%)</span>
                <span>{formatINR(Math.round((total * 18) / 118))}</span>
              </div>
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-zinc-200 flex items-baseline justify-between">
              <div>
                <span className="text-sm font-extrabold text-[#1B1B1B] uppercase tracking-wider block">Total Amount</span>
                <span className="text-[10px] text-zinc-500 font-medium">All taxes inclusive</span>
              </div>
              <span className="text-2xl font-black text-[#D1121B]">{formatINR(total)}</span>
            </div>

            {/* Coupon Code Section */}
            <div className="pt-3 border-t border-zinc-100 space-y-2">
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                Apply Promo Code
              </label>
              {appliedCoupon ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-emerald-900">{appliedCoupon.code}</p>
                    <p className="text-[10px] text-emerald-700">{appliedCoupon.description}</p>
                  </div>
                  <button onClick={removeCoupon} className="text-zinc-400 hover:text-red-600">
                    <CloseIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="e.g. VINAYAKA500"
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs uppercase font-bold focus:outline-none focus:border-[#7A1118]"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    className="px-4 py-2 bg-zinc-900 hover:bg-black text-white font-bold text-xs rounded-xl uppercase tracking-wider"
                  >
                    Apply
                  </button>
                </div>
              )}
              {couponError && <p className="text-[11px] text-red-600 font-bold">{couponError}</p>}

              {/* Quick Coupon Suggestions */}
              {!appliedCoupon && (
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {AVAILABLE_COUPONS.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleApplyCoupon(c.code)}
                      className="text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold px-2 py-1 rounded-md border border-amber-200 transition-colors"
                    >
                      {c.code}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Primary Action: WhatsApp Order */}
            <button
              type="button"
              onClick={handleWhatsAppOrder}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-98"
            >
              <WhatsAppIcon className="w-5 h-5" />
              {user ? "Get Quotation on WhatsApp" : "Login to Get Quotation"}
            </button>
            <p className="text-center text-[11px] text-zinc-500">
              We&apos;ll confirm final pricing, stock &amp; delivery over WhatsApp — no online payment needed.
            </p>

            {/* Trust assurances */}
            <div className="pt-2 border-t border-zinc-100 flex items-center justify-center gap-4 text-[10px] text-zinc-500 font-semibold">
              <span className="flex items-center gap-1">Genuine Hardware</span>
              <span>•</span>
              <span className="flex items-center gap-1">GST Tax Invoices</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
