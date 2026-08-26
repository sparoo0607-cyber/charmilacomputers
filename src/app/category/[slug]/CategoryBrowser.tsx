"use client";

import { useMemo, useState } from "react";
import { Product } from "@/data/types";
import ProductCard from "@/components/ProductCard";
import { FilterIcon, CloseIcon, StarIcon } from "@/components/icons";
import { formatINR } from "@/lib/format";

type SortKey = "featured" | "price-asc" | "price-desc" | "rating-desc" | "discount-desc" | "name-asc";

export default function CategoryBrowser({ products }: { products: Product[] }) {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState<number | null>(null);
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
    setMinRating(null);
    setPriceRange(maxProductPrice);
  }

  const hasActiveFilters = selectedBrands.length > 0 || inStockOnly || minRating !== null || priceRange < maxProductPrice;

  const visible = useMemo(() => {
    let list = [...products];

    if (selectedBrands.length > 0) {
      list = list.filter((p) => selectedBrands.includes(p.brand));
    }
    if (inStockOnly) {
      list = list.filter((p) => p.inStock);
    }
    if (minRating) {
      list = list.filter((p) => (p.rating ?? 0) >= minRating);
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
  }, [products, selectedBrands, inStockOnly, minRating, priceRange, maxProductPrice, sort]);

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

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 bg-white p-5 rounded-2xl border border-[#E5E0D7] shadow-sm h-fit sticky top-28">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
            <h3 className="font-extrabold text-sm text-[#1B1B1B] uppercase tracking-wider flex items-center gap-2">
              <FilterIcon className="w-4 h-4 text-[#7A1118]" /> Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-bold text-[#D1121B] hover:underline"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Availability Toggle */}
          <div className="space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-zinc-800 select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-[#7A1118] focus:ring-[#7A1118] w-4 h-4 accent-[#7A1118]"
              />
              <span>In Stock Items Only</span>
            </label>
          </div>

          {/* Brand Filter */}
          <div className="border-t border-zinc-100 pt-4 space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-600">Brand</h4>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {brands.map((b) => {
                const count = products.filter((p) => p.brand === b).length;
                const checked = selectedBrands.includes(b);
                return (
                  <label
                    key={b}
                    className="flex items-center justify-between text-xs text-zinc-700 hover:text-[#7A1118] cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleBrand(b)}
                        className="rounded accent-[#7A1118] w-3.5 h-3.5"
                      />
                      <span className={checked ? "font-bold text-[#1B1B1B]" : ""}>{b}</span>
                    </div>
                    <span className="text-[11px] text-zinc-400">({count})</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="border-t border-zinc-100 pt-4 space-y-2.5">
            <div className="flex items-center justify-between">
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

          {/* Customer Rating Filter */}
          <div className="border-t border-zinc-100 pt-4 space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-600">Minimum Rating</h4>
            <div className="space-y-1.5 text-xs">
              {[4.5, 4.0, 3.5].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(minRating === r ? null : r)}
                  className={`w-full flex items-center justify-between p-1.5 rounded-lg transition-colors ${
                    minRating === r ? "bg-amber-100 font-bold text-amber-900" : "hover:bg-zinc-50 text-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-1 text-amber-500">
                    <StarIcon className="w-3.5 h-3.5" />
                    <span>{r} & Above</span>
                  </div>
                  {minRating === r && <CloseIcon className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid & Top Sort Bar */}
        <div>
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
              {minRating && (
                <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                  {minRating}+ Stars
                  <button onClick={() => setMinRating(null)}>
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
            <div className="bg-white p-12 rounded-2xl border border-[#E5E0D7] text-center space-y-3">
              <p className="text-lg font-bold text-zinc-800">No products matched your active filters</p>
              <p className="text-xs text-zinc-500">Try loosening your price filter or selecting different brands.</p>
              <button
                onClick={clearAllFilters}
                className="mt-2 bg-[#7A1118] text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#D1121B] transition-colors shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
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
