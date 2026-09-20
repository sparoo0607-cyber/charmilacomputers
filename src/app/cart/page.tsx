"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useStoreTheme } from "@/hooks/useStoreTheme";
import { useCatalog } from "@/context/CatalogContext";
import { formatINR, STORE, whatsappOrderLink } from "@/lib/format";
import ProductImage from "@/components/ProductImage";
import {
  CartIcon, MinusIcon, PlusIcon, TrashIcon, WhatsAppIcon
} from "@/components/icons";

export default function CartPage() {
  const router = useRouter();
  const activeTheme = useStoreTheme();
  const {
    lines, updateQty, removeFromCart, subtotal, total,
    clearCart, user
  } = useCart();
  const { getProduct } = useCatalog();

  const items = lines
    .map((line) => ({ line, product: getProduct(line.productId) }))
    .filter((x) => x.product);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center font-sans">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <CartIcon className="w-10 h-10 text-[#7A1118]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B1B1B] mb-2">Your Cart is Empty</h1>
        <p className="text-zinc-500 text-sm mb-6 max-w-md mx-auto">
          Explore our extensive catalog of genuine computer hardware, custom rigs, and accessories.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#D1121B] hover:bg-[#7A1118] text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md active:scale-95"
        >
          <span>Continue Shopping</span>
          <span>→</span>
        </Link>
      </div>
    );
  }

  // Build WhatsApp order message — includes user identity if logged in
  const orderMessage = [
    user
      ? `Hi ${STORE.name}, I'd like to place an order.\nName: ${user.name}\nPhone: ${user.phone || "(not saved)"}\nEmail: ${user.email}`
      : `Hi ${STORE.name}, I'd like to place an order:`,
    "",
    "*Order Details:*",
    ...items.map(({ line, product }) => `- ${product!.name} x${line.qty} = ${formatINR(product!.price * line.qty)}`),
    "",
    `Subtotal: ${formatINR(subtotal)}`,
    `*Total: ${formatINR(total)}*`,
    "",
    "Please confirm my order. Thank you!",
  ]
    .filter((l) => l !== null && l !== undefined)
    .join("\n");

  // WhatsApp order handler — require login first
  function handleWhatsAppOrder() {
    if (!user) {
      router.push(`/login?redirect=/cart`);
      return;
    }
    window.open(whatsappOrderLink(orderMessage), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-8 font-sans">
      {/* Breadcrumbs */}
      <nav className="text-xs text-zinc-500 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-[#D1121B]">Home</Link>
        <span>/</span>
        <span className="text-[#1B1B1B] font-bold">Shopping Cart</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-black text-[#1B1B1B] mb-6">
        Shopping Cart ({items.length} {items.length === 1 ? "Item" : "Items"})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {items.map(({ line, product }) => (
            <div
              key={line.productId}
              className="flex flex-col sm:flex-row gap-4 p-4 sm:p-5 bg-white rounded-2xl border border-[#E5E0D7] shadow-2xs hover:shadow-sm transition-all"
            >
              {/* Product Image */}
              <div className="w-full sm:w-28 h-28 bg-[#FAF7F2] rounded-xl flex items-center justify-center p-2 border border-zinc-100 shrink-0">
                <ProductImage
                  categorySlug={product!.categorySlug}
                  imageUrl={product!.imageUrl}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Product Details */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#7A1118] bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        {product!.brand}
                      </span>
                      <h3 className="font-bold text-sm text-zinc-900 mt-1 line-clamp-2">
                        <Link href={`/product/${product!.id}`} className="hover:text-[#D1121B]">
                          {product!.name}
                        </Link>
                      </h3>
                    </div>
                    <button
                      onClick={() => removeFromCart(line.productId)}
                      className="text-zinc-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-1 text-xs text-zinc-500">
                    Model: <span className="font-medium text-zinc-700">{product!.model}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-100 mt-3">
                  {/* Quantity Control */}
                  <div className="flex items-center border border-zinc-300 rounded-lg bg-white overflow-hidden">
                    <button
                      onClick={() => updateQty(line.productId, line.qty - 1)}
                      className="p-1.5 hover:bg-zinc-100 transition-colors text-zinc-600"
                      aria-label="Decrease quantity"
                    >
                      <MinusIcon className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-bold text-xs tabular-nums">{line.qty}</span>
                    <button
                      onClick={() => updateQty(line.productId, line.qty + 1)}
                      className="p-1.5 hover:bg-zinc-100 transition-colors text-zinc-600"
                      aria-label="Increase quantity"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Price Item Subtotal */}
                  <div className="text-right">
                    <p className="font-black text-base text-[#1B1B1B]">{formatINR(product!.price * line.qty)}</p>
                    <p className="text-[10px] text-zinc-400">({formatINR(product!.price)} each)</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Cart Bottom Actions */}
          <div className="flex items-center justify-between pt-2">
            <Link
              href="/"
              className="text-xs font-bold text-[#7A1118] hover:underline flex items-center gap-1 uppercase tracking-wider"
            >
              <span>←</span> Continue Shopping
            </Link>
            <button
              onClick={clearCart}
              className="text-xs text-zinc-400 hover:text-red-600 font-semibold"
            >
              Clear Entire Cart
            </button>
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-2xl border border-[#E5E0D7] shadow-sm space-y-4 sticky top-24">
            <h2 className="text-base font-extrabold text-[#1B1B1B] uppercase tracking-wider pb-3 border-b border-zinc-200">
              Order Summary
            </h2>

            {/* Price Breakdown */}
            <div className="space-y-2.5 text-xs text-zinc-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-zinc-900">{formatINR(subtotal)}</span>
              </div>
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
              <span className="flex items-center gap-1">Official Warranty</span>
              <span>•</span>
              <span className="flex items-center gap-1">Pan-India Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
