"use client";

import Link from "next/link";
import { useState } from "react";
import { Product } from "@/data/types";
import { formatINR } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import ProductImage from "./ProductImage";
import { CartIcon, CheckIcon, StarIcon, HeartIcon, CompareIcon } from "./icons";

import FestiveBadge from "./festive/FestiveBadge";
import { useStoreTheme } from "@/hooks/useStoreTheme";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, isInWishlist, toggleWishlist, addToCompare, isInCompare } = useCart();
  const activeTheme = useStoreTheme();
  const isVinayaka = activeTheme === "festive";
  const [added, setAdded] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  }

  function handleCompare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addToCompare(product.id);
  }

  const discount = product.mrp && product.mrp > product.price ? Math.round(100 - (product.price / product.mrp) * 100) : null;
  const isFestiveDeal = isVinayaka && ((discount && discount >= 10) || product.inStock);

  return (
    <div className={`group border border-[#E5E0D7] rounded-xl overflow-hidden bg-white hover:shadow-xl hover:-translate-y-1 ${isVinayaka ? "hover:border-[#A77A24]/50 festive-card-glow" : "hover:border-[#D1121B]/40"} transition-all duration-200 flex flex-col relative`}>
      {/* Top action buttons */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleWishlist}
          title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
            inWishlist
              ? "bg-red-50 text-[#D1121B] border border-red-200 scale-105"
              : "bg-white/90 backdrop-blur-xs text-zinc-500 hover:text-[#D1121B] hover:bg-white border border-zinc-200"
          }`}
          aria-label="Wishlist"
        >
          <HeartIcon className="w-4 h-4" filled={inWishlist} />
        </button>

        <button
          onClick={handleCompare}
          title={inCompare ? "In comparison" : "Compare specs"}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
            inCompare
              ? "bg-[#263844] text-white border border-[#263844]"
              : "bg-white/90 backdrop-blur-xs text-zinc-500 hover:text-[#263844] hover:bg-white border border-zinc-200"
          }`}
          aria-label="Compare"
        >
          <CompareIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      <Link href={`/product/${product.id}`} className="block relative overflow-hidden bg-[#FAF7F2] p-4">
        <div className="absolute top-2 left-2 z-10 flex flex-col items-start gap-1">
          {discount && (
            <span className={`${isVinayaka ? "bg-[#6E0F12] text-[#FFF6E3] border border-[#A77A24]" : "bg-[#D1121B] text-white"} text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow-xs tracking-wider`}>
              -{discount}% OFF
            </span>
          )}
          {isVinayaka && isFestiveDeal && discount && discount > 12 && (
            <FestiveBadge label="VINAYAKA SPECIAL" />
          )}
        </div>
        <ProductImage categorySlug={product.categorySlug} productId={product.id} imageUrl={product.imageUrl} className="w-full aspect-square transition-transform duration-300 group-hover:scale-108" />
      </Link>

      <div className="p-3.5 flex flex-col gap-1 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{product.brand}</span>
          <span className={`text-[10px] font-bold flex items-center gap-1 ${product.inStock ? "text-emerald-700" : "text-red-500"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${product.inStock ? "bg-emerald-500" : "bg-red-500"}`} />
            {product.inStock ? `In Stock (${product.stockQty})` : "Out of Stock"}
          </span>
        </div>

        <Link href={`/product/${product.id}`} className="text-[13px] font-semibold text-[#1B1B1B] line-clamp-2 hover:text-[#D1121B] transition-colors min-h-[2.4rem] leading-snug">
          {product.name}
        </Link>

        {product.rating && (
          <div className="flex items-center gap-1 text-amber-500 my-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} className="w-3 h-3" filled={i < Math.round(product.rating!)} />
            ))}
            <span className="text-[11px] font-bold text-zinc-700 ml-1">{product.rating}</span>
            {product.reviewsCount && <span className="text-[10px] text-zinc-500">({product.reviewsCount})</span>}
          </div>
        )}

        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-extrabold text-[#1B1B1B] text-base">{formatINR(product.price)}</span>
          {product.mrp && <span className="text-xs text-zinc-500 line-through">{formatINR(product.mrp)}</span>}
        </div>

        <button
          onClick={handleAdd}
          disabled={!product.inStock}
          aria-live="polite"
          className={`mt-2.5 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider rounded-lg py-2.5 transition-all duration-200 active:scale-[0.97] ${
            added
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-[#1B1B1B] text-white hover:bg-[#D1121B] shadow-sm hover:shadow"
          } disabled:bg-zinc-200 disabled:text-zinc-500 disabled:cursor-not-allowed`}
        >
          {added ? (
            <>
              <CheckIcon className="w-4 h-4" /> Added to Cart
            </>
          ) : (
            <>
              <CartIcon className="w-3.5 h-3.5" /> Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
