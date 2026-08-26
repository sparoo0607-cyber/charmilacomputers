"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { getProduct } from "@/data/products";
import { formatINR } from "@/lib/format";
import ProductImage from "@/components/ProductImage";
import { CompareIcon, CartIcon, CloseIcon, StarIcon } from "@/components/icons";

export default function ComparePage() {
  const { compareList, removeFromCompare, clearCompare, addToCart, addToCompare } = useCart();
  const [highlightDiff, setHighlightDiff] = useState(false);

  // If empty, let's load sample comparison or show presets
  const sampleComparison = ["gpu-2", "gpu-3", "gpu-5"];
  const activeIds = compareList.length > 0 ? compareList : sampleComparison;
  const comparedProducts = activeIds.map((id) => getProduct(id)).filter(Boolean);

  // Collect all unique spec keys across all compared products
  const allSpecKeys = Array.from(
    new Set(
      comparedProducts.flatMap((p) => (p?.specs ? Object.keys(p.specs) : []))
    )
  );

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-8 font-sans">
      {/* Breadcrumb */}
      <nav className="text-xs text-zinc-500 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-[#D1121B]">Home</Link>
        <span>/</span>
        <span className="text-[#1B1B1B] font-bold">Compare Products</span>
      </nav>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[#E5E0D7] gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <CompareIcon className="w-6 h-6 text-[#7A1118]" />
            <h1 className="text-2xl sm:text-3xl font-black text-[#1B1B1B]">Hardware Comparison</h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Compare technical specs, benchmarks, power wattage, and real-time pricing side-by-side.
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 text-xs font-bold text-zinc-800 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={highlightDiff}
              onChange={(e) => setHighlightDiff(e.target.checked)}
              className="rounded accent-[#7A1118] w-4 h-4"
            />
            <span>Highlight Differences</span>
          </label>

          {compareList.length > 0 && (
            <button
              onClick={clearCompare}
              className="text-xs font-bold text-red-600 hover:underline"
            >
              Clear Comparison
            </button>
          )}
        </div>
      </div>

      {comparedProducts.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E5E0D7] text-center space-y-4">
          <CompareIcon className="w-12 h-12 text-zinc-300 mx-auto" />
          <h2 className="text-lg font-bold text-zinc-800">No Products in Comparison</h2>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Click the compare button on any product card across the catalog to view specs side-by-side.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => {
                addToCompare("cpu-3");
                addToCompare("cpu-5");
              }}
              className="bg-[#7A1118] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase"
            >
              Compare Core i3 vs Ryzen 5
            </button>
            <button
              onClick={() => {
                addToCompare("gpu-2");
                addToCompare("gpu-3");
              }}
              className="bg-[#1B1B1B] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase"
            >
              Compare RTX 3060 vs RTX 5060 Ti
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E0D7] shadow-sm overflow-x-auto">
          <table className="w-full min-w-[700px] text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-[#FAF7F2]">
                <th className="p-4 text-left font-extrabold text-zinc-600 uppercase w-48 sticky left-0 bg-[#FAF7F2] z-10">
                  Product Overview
                </th>
                {comparedProducts.map((p) => (
                  <th key={p!.id} className="p-4 text-left font-normal align-top min-w-[220px]">
                    <div className="relative space-y-2">
                      <button
                        onClick={() => removeFromCompare(p!.id)}
                        className="absolute -top-2 -right-2 text-zinc-400 hover:text-red-600 p-1"
                        title="Remove"
                      >
                        <CloseIcon className="w-4 h-4" />
                      </button>
                      <div className="w-24 h-24 mx-auto bg-white p-2 rounded-xl border border-zinc-200">
                        <ProductImage categorySlug={p!.categorySlug} className="w-full h-full object-contain" />
                      </div>
                      <span className="text-[10px] font-bold text-[#7A1118] uppercase bg-red-50 px-2 py-0.5 rounded border border-red-200 inline-block">
                        {p!.brand}
                      </span>
                      <Link href={`/product/${p!.id}`} className="block font-bold text-xs text-zinc-900 hover:text-[#D1121B] line-clamp-2">
                        {p!.name}
                      </Link>
                      <p className="font-extrabold text-sm text-[#D1121B]">{formatINR(p!.price)}</p>
                      <button
                        onClick={() => addToCart(p!.id, 1)}
                        className="w-full py-2 bg-[#1B1B1B] hover:bg-[#D1121B] text-white font-bold text-[11px] uppercase tracking-wider rounded-lg shadow-2xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <CartIcon className="w-3.5 h-3.5" /> Add to Cart
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {/* Rating */}
              <tr className="hover:bg-zinc-50">
                <td className="p-3.5 font-bold text-zinc-600 sticky left-0 bg-white z-10">Customer Rating</td>
                {comparedProducts.map((p) => (
                  <td key={p!.id} className="p-3.5">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <StarIcon className="w-3.5 h-3.5" />
                      <span>{p!.rating || 4.5} / 5</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Model Number */}
              <tr className="hover:bg-zinc-50">
                <td className="p-3.5 font-bold text-zinc-600 sticky left-0 bg-white z-10">Model Number</td>
                {comparedProducts.map((p) => (
                  <td key={p!.id} className="p-3.5 font-mono text-zinc-800">{p!.model}</td>
                ))}
              </tr>

              {/* Rated Wattage */}
              <tr className="hover:bg-zinc-50">
                <td className="p-3.5 font-bold text-zinc-600 sticky left-0 bg-white z-10">Power Draw (TDP)</td>
                {comparedProducts.map((p) => (
                  <td key={p!.id} className="p-3.5 font-bold text-zinc-800">
                    {p!.wattage ? `${p!.wattage} Watts` : "Standard (<25W)"}
                  </td>
                ))}
              </tr>

              {/* Stock Status */}
              <tr className="hover:bg-zinc-50">
                <td className="p-3.5 font-bold text-zinc-600 sticky left-0 bg-white z-10">Availability</td>
                {comparedProducts.map((p) => (
                  <td key={p!.id} className="p-3.5 font-bold text-emerald-700">
                    {p!.inStock ? `In Stock (${p!.stockQty} units)` : "Out of Stock"}
                  </td>
                ))}
              </tr>

              {/* Detailed Specs Rows */}
              {allSpecKeys.map((key) => {
                const values = comparedProducts.map((p) => p?.specs?.[key] || "—");
                const isDifferent = new Set(values).size > 1;

                return (
                  <tr
                    key={key}
                    className={`hover:bg-zinc-50 transition-colors ${
                      highlightDiff && isDifferent ? "bg-amber-50/70" : ""
                    }`}
                  >
                    <td className="p-3.5 font-bold text-zinc-600 sticky left-0 bg-white z-10">
                      {key}
                    </td>
                    {comparedProducts.map((p) => (
                      <td key={p!.id} className="p-3.5 text-zinc-800 font-medium">
                        {p?.specs?.[key] || "—"}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
