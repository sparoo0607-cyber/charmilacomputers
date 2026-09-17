"use client";

import { useMemo, useState } from "react";
import { Product } from "@/data/types";
import ProductCard from "@/components/ProductCard";
import { FilterIcon, CloseIcon } from "@/components/icons";
import { formatINR } from "@/lib/format";

type SortKey = "featured" | "price-asc" | "price-desc" | "rating-desc" | "discount-desc" | "name-asc";

export default function CategoryBrowser({ products }: { products: Product[] }) {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<number>(200000);
  const [sort, setSort] = useState<SortKey>("featured");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const brands = useMemo(() => Array.from(new Set(products.map((p) => p.brand))).sort(), [products]);

  const maxProductPrice = useMemo(() => {
    return products.length > 0 ? Math.max(...products.map((p) => p.price)) : 200000;
  }, [products]);

  function toggleBrand(brand: string) {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  }

  function clearAllFilters() {
    setSelectedBrands([]);
    setInStockOnly(false);
    setPriceRange(maxProductPrice);
  }

  const hasActiveFilters = selectedBrands.length > 0 || inStockOnly || priceRange < maxProductPrice;

  const visible = useMemo(() => {
    let list = [...products];

    if (selectedBrands.length > 0) {
      list = list.filter((p) => selectedBrands.includes(p.brand));
    }
    if (inStockOnly) {
      list = list.filter((p) => p.inStock);
    }
    if (priceRange < maxProductPrice) {
      list = list.filter((p) => p.price <= priceRange);
    }

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating-desc":
        list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "discount-desc":
        list.sort((a, b) => {
          const discA = a.mrp ? (a.mrp - a.price) / a.mrp : 0;
          const discB = b.mrp ? (b.mrp - b.price) / b.mrp : 0;
          return discB - discA;
        });
        break;
      case "name-asc":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }
    return list;
  }, [products, selectedBrands, inStockOnly, priceRange, maxProductPrice, sort]);

  return (
    <div>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden flex items-center justify-between gap-4 mb-4">
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="flex items-center gap-2 bg-white border border-[#E5E0D7] px-4 py-2 rounded-xl text-xs font-bold text-zinc-800 shadow-2xs"
        >
          <FilterIcon className="w-4 h-4 text-[#7A1118]" />
          <span>Filter Products ({selectedBrands.length + (inStockOnly ? 1 : 0)})</span>
        </button>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="text-xs font-bold border border-[#E5E0D7] bg-white rounded-xl px-3 py-2 text-zinc-800 shadow-2xs focus:outline-none"
        >
          <option value="featured">Sort: Most Popular</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating-desc">Highest Rated</option>
          <option value="discount-desc">Biggest Discount</option>
          <option value="name-asc">Name: A to Z</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Filter Sidebar (Desktop) */}
        <aside className="hidden lg:block lg:col-span-3 bg-white p-5 rounded-2xl border border-[#E5E0D7] shadow-2xs space-y-5 h-fit sticky top-24">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h3 className="font-extrabold text-sm text-[#1B1B1B] uppercase tracking-wider flex items-center gap-2">
              <FilterIcon className="w-4 h-4 text-[#7A1118]" /> Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-[#D1121B] font-bold hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* In-Stock Filter */}
          <label className="flex items-center gap-2.5 text-xs font-bold text-zinc-800 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded accent-[#7A1118] w-4 h-4"
            />
            <span>In Stock Items Only</span>
          </label>

          {/* Brand Multi-Select */}
          <div className="border-t border-zinc-100 pt-4 space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-600">Brand</h4>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {brands.map((b) => (
                <label key={b} className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer select-none hover:text-black">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(b)}
                    onChange={() => toggleBrand(b)}
                    className="rounded accent-[#7A1118] w-3.5 h-3.5"
                  />
                  <span>{b}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="border-t border-zinc-100 pt-4 space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-600">Max Price</h4>
              <span className="text-xs font-extrabold text-[#7A1118]">{formatINR(priceRange)}</span>
            </div>
            <input
              type="range"
              min={1000}
              max={maxProductPrice}
              step={1000}
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-[#7A1118]"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 font-semibold">
              <span>₹1,000</span>
              <span>{formatINR(maxProductPrice)}</span>
            </div>
          </div>
        </aside>

        {/* Product Grid & Top Sort Bar */}
        <div className="lg:col-span-9">
          {/* Top Sort & Count Bar (Desktop) */}
          <div className="hidden lg:flex items-center justify-between bg-white p-3.5 rounded-2xl border border-[#E5E0D7] shadow-2xs mb-6">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-zinc-800">{visible.length} Products Found</span>
              {hasActiveFilters && (
                <span className="text-zinc-400">| Filters applied</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-500">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="text-xs font-bold border border-zinc-300 rounded-lg px-3 py-1.5 bg-white text-zinc-800 focus:outline-none focus:border-[#7A1118]"
              >
                <option value="featured">Most Popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Highest Customer Rating</option>
                <option value="discount-desc">Biggest Discount %</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Active Filter Pills */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="text-xs font-bold text-zinc-500">Active:</span>
              {selectedBrands.map((b) => (
                <span
                  key={b}
                  className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs"
                >
                  {b}
                  <button onClick={() => toggleBrand(b)} className="hover:text-black">
                    <CloseIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {inStockOnly && (
                <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                  In Stock Only
                  <button onClick={() => setInStockOnly(false)}>
                    <CloseIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-xs font-bold text-[#D1121B] hover:underline ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Products Grid */}
          {visible.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-[#E5E0D7] text-center space-y-3 shadow-2xs">
              <p className="text-base font-bold text-zinc-800">No products match your current filters.</p>
              <p className="text-xs text-zinc-500">Try adjusting your brand selections or price range.</p>
              <button
                onClick={clearAllFilters}
                className="inline-block mt-2 px-4 py-2 bg-[#7A1118] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#4E0B10]"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {visible.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-[85vw] max-w-sm h-full p-6 overflow-y-auto space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <h3 className="font-extrabold text-base text-[#1B1B1B]">Filter Products</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="text-zinc-500 hover:text-black">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <label className="flex items-center gap-2.5 text-xs font-bold text-zinc-800">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded accent-[#7A1118] w-4 h-4"
              />
              <span>In Stock Items Only</span>
            </label>

            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase text-zinc-600">Brand</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {brands.map((b) => (
                  <label key={b} className="flex items-center gap-2 text-xs text-zinc-700">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(b)}
                      onChange={() => toggleBrand(b)}
                      className="rounded accent-[#7A1118] w-3.5 h-3.5"
                    />
                    <span>{b}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase text-zinc-600">Max Price: {formatINR(priceRange)}</h4>
              <input
                type="range"
                min={1000}
                max={maxProductPrice}
                step={1000}
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-[#7A1118]"
              />
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-3 bg-[#D1121B] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md"
            >
              Apply Filters ({visible.length} Results)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
