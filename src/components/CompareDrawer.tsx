"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { getProduct } from "@/data/products";
import ProductImage from "./ProductImage";
import { CloseIcon, CompareIcon } from "./icons";

export default function CompareDrawer() {
  const { compareList, removeFromCompare, clearCompare } = useCart();

  if (compareList.length === 0) return null;

  const items = compareList.map((id) => getProduct(id)).filter(Boolean);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-[#1B1B1B]/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-4 animate-fade-in-up max-w-[95vw] sm:max-w-xl">
      <div className="flex items-center gap-2 pr-2 border-r border-white/20">
        <CompareIcon className="w-5 h-5 text-amber-400" />
        <div className="text-left">
          <p className="text-xs font-bold leading-tight">Compare ({items.length}/4)</p>
          <button onClick={clearCompare} className="text-[10px] text-zinc-400 hover:text-white underline">
            Clear all
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto py-1">
        {items.map((prod) => (
          <div key={prod!.id} className="relative group shrink-0">
            <div className="w-10 h-10 rounded-lg bg-white p-1 border border-white/20 overflow-hidden">
              <ProductImage categorySlug={prod!.categorySlug} className="w-full h-full object-contain" />
            </div>
            <button
              onClick={() => removeFromCompare(prod!.id)}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] shadow"
              title="Remove"
            >
              <CloseIcon className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}
      </div>

      <Link
        href="/compare"
        className="shrink-0 bg-[#D1121B] hover:bg-[#b00f17] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
      >
        Compare Now
      </Link>
    </div>
  );
}
