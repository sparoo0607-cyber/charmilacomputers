"use client";

import { useMemo, useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { categories } from "@/data/categories";
import { Product } from "@/data/types";
import { formatINR } from "@/lib/format";
import ProductImage from "@/components/ProductImage";
import {
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  CloseIcon,
  WarningIcon,
} from "@/components/icons";

type SortKey = "name" | "price" | "stockQty";

const emptyForm = {
  name: "",
  brand: "",
  model: "",
  categorySlug: categories[0].slug,
  price: "",
  mrp: "",
  wattage: "",
  stockQty: "",
  inStock: true,
  imageUrl: "",
};

export default function AdminProductsPage() {
  const { adminProducts, addProduct, updateProduct, deleteProduct } = useAdmin();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [modal, setModal] = useState<{ mode: "add" | "edit"; product?: Product } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    let list = adminProducts;
    if (categoryFilter !== "all") list = list.filter((p) => p.categorySlug === categoryFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.model.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      if (sortKey === "price") return a.price - b.price;
      return a.stockQty - b.stockQty;
    });
  }, [adminProducts, categoryFilter, query, sortKey]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <SearchIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="w-full bg-white border border-[#E5E0D7] rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#D1121B]"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-[#E5E0D7] rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-[#D1121B]"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="bg-white border border-[#E5E0D7] rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-[#D1121B]"
          >
            <option value="name">Sort: Name</option>
            <option value="price">Sort: Price</option>
            <option value="stockQty">Sort: Stock</option>
          </select>
        </div>
        <button
          onClick={() => setModal({ mode: "add" })}
          className="flex items-center gap-1.5 bg-[#D1121B] hover:bg-[#7A1118] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm shrink-0"
        >
          <PlusIcon className="w-4 h-4" /> Add Product
        </button>
      </div>

      <p className="text-xs text-zinc-500">
        {filtered.length} of {adminProducts.length} products
      </p>

      <div className="bg-white rounded-2xl border border-[#E5E0D7] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-zinc-500 border-b border-zinc-100">
                <th className="font-semibold px-5 py-3">Product</th>
                <th className="font-semibold px-3 py-3">Category</th>
                <th className="font-semibold px-3 py-3 text-right">Price</th>
                <th className="font-semibold px-3 py-3 text-right">Stock</th>
                <th className="font-semibold px-3 py-3">Status</th>
                <th className="font-semibold px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-zinc-50 last:border-0 hover:bg-[#FAF7F2]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <ProductImage categorySlug={p.categorySlug} className="w-11 h-11 rounded-lg bg-[#FAF7F2] border border-zinc-100 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-800 line-clamp-1 max-w-xs">{p.name}</p>
                        <p className="text-[11px] text-zinc-400">{p.brand} · {p.model}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-zinc-600 capitalize whitespace-nowrap">
                    {categories.find((c) => c.slug === p.categorySlug)?.name || p.categorySlug}
                  </td>
                  <td className="px-3 py-3 text-right font-bold tabular-nums whitespace-nowrap">{formatINR(p.price)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    <span className={p.stockQty <= 5 ? "text-amber-600 font-bold" : "text-zinc-700"}>{p.stockQty}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${
                        p.inStock ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {p.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => setModal({ mode: "edit", product: p })}
                      className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-600 mr-1"
                      aria-label={`Edit ${p.name}`}
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(p)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                      aria-label={`Delete ${p.name}`}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-sm text-zinc-400">
                    No products match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <ProductModal
          mode={modal.mode}
          product={modal.product}
          onClose={() => setModal(null)}
          onSubmit={(data) => {
            if (modal.mode === "add") {
              addProduct(data);
            } else if (modal.product) {
              updateProduct(modal.product.id, data);
            }
            setModal(null);
          }}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center px-4" onClick={() => setConfirmDelete(null)}>
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-11 rounded-full bg-red-50 text-red-600 grid place-items-center mb-4">
              <WarningIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base mb-1.5">Remove this product?</h3>
            <p className="text-sm text-zinc-500 mb-6">
              <strong>{confirmDelete.name}</strong> will be removed from the catalog. This can be undone from Settings.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-sm py-2.5 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProduct(confirmDelete.id);
                  setConfirmDelete(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-2.5 rounded-xl transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductModal({
  mode,
  product,
  onClose,
  onSubmit,
}: {
  mode: "add" | "edit";
  product?: Product;
  onClose: () => void;
  onSubmit: (data: Omit<Product, "id">) => void;
}) {
  const initialImages = product?.images && product.images.length > 0 
    ? product.images 
    : (product?.imageUrl ? [product.imageUrl] : []);

  const [form, setForm] = useState(
    product
      ? {
          name: product.name,
          brand: product.brand,
          model: product.model,
          categorySlug: product.categorySlug,
          price: String(product.price),
          mrp: product.mrp ? String(product.mrp) : "",
          wattage: product.wattage ? String(product.wattage) : "",
          stockQty: String(product.stockQty),
          inStock: product.inStock,
        }
      : emptyForm
  );

  const [images, setImages] = useState<string[]>(initialImages);
  const [urlInput, setUrlInput] = useState("");

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setImages((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  }

  function handleAddUrl() {
    if (!urlInput.trim()) return;
    setImages((prev) => [...prev, urlInput.trim()]);
    setUrlInput("");
  }

  function handleRemoveImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function handleMakePrimary(index: number) {
    if (index === 0) return;
    setImages((prev) => {
      const item = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [item, ...rest];
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      name: form.name.trim(),
      brand: form.brand.trim(),
      model: form.model.trim() || "N/A",
      categorySlug: form.categorySlug,
      price: Number(form.price) || 0,
      mrp: form.mrp ? Number(form.mrp) : undefined,
      wattage: form.wattage ? Number(form.wattage) : undefined,
      stockQty: Number(form.stockQty) || 0,
      inStock: form.inStock,
      imageUrl: images[0] || undefined,
      images: images.length > 0 ? images : undefined,
      rating: product?.rating,
      reviewsCount: product?.reviewsCount,
      specs: product?.specs,
      features: product?.features,
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center px-4 py-6 overflow-y-auto" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-xl my-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg">{mode === "add" ? "Add Product" : "Edit Product"}</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500">
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <Field label="Product Name" required>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-[#E5E0D7] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#D1121B]"
              placeholder="e.g. Intel Core i5-12400F Desktop Processor"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Brand" required>
              <input
                required
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full border border-[#E5E0D7] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#D1121B]"
                placeholder="Intel"
              />
            </Field>
            <Field label="Model">
              <input
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                className="w-full border border-[#E5E0D7] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#D1121B]"
                placeholder="BX8071112400F"
              />
            </Field>
          </div>

          <Field label="Category" required>
            <select
              value={form.categorySlug}
              onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
              className="w-full border border-[#E5E0D7] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#D1121B]"
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Price (₹)" required>
              <input
                required
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border border-[#E5E0D7] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#D1121B]"
              />
            </Field>
            <Field label="MRP (₹)">
              <input
                type="number"
                min="0"
                value={form.mrp}
                onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                className="w-full border border-[#E5E0D7] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#D1121B]"
              />
            </Field>
            <Field label="Wattage (W)">
              <input
                type="number"
                min="0"
                value={form.wattage}
                onChange={(e) => setForm({ ...form, wattage: e.target.value })}
                className="w-full border border-[#E5E0D7] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#D1121B]"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <Field label="Stock Quantity" required>
              <input
                required
                type="number"
                min="0"
                value={form.stockQty}
                onChange={(e) => setForm({ ...form, stockQty: e.target.value })}
                className="w-full border border-[#E5E0D7] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#D1121B]"
              />
            </Field>
            <label className="flex items-center gap-2 pb-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.inStock}
                onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                className="w-4 h-4 accent-[#D1121B]"
              />
              <span className="text-sm font-semibold text-zinc-700">Available for sale</span>
            </label>
          </div>

          {/* Product Media & Multiple Images Manager */}
          <div className="pt-2 border-t border-zinc-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                Product Media &amp; Photos ({images.length})
              </span>
              <label
                htmlFor="product-images-upload"
                className="cursor-pointer bg-[#1B1B1B] hover:bg-[#D1121B] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>📁 Upload Photos</span>
                <input
                  id="product-images-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Optional URL Adder Input */}
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Or paste image URL here…"
                className="flex-1 border border-[#E5E0D7] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#D1121B]"
              />
              <button
                type="button"
                onClick={handleAddUrl}
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs px-3 py-1.5 rounded-xl transition-colors"
              >
                + Add URL
              </button>
            </div>

            {/* Thumbnail Preview Grid */}
            {images.length > 0 ? (
              <div className="grid grid-cols-4 gap-2.5 pt-1">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`relative group aspect-square rounded-xl overflow-hidden border-2 bg-zinc-50 flex items-center justify-center ${
                      idx === 0 ? "border-[#D1121B] ring-2 ring-red-500/20" : "border-zinc-200"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-contain p-1" />

                    {/* Primary Badge */}
                    {idx === 0 ? (
                      <span className="absolute top-1 left-1 bg-[#D1121B] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs uppercase">
                        ★ Main
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleMakePrimary(idx)}
                        className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 bg-black/70 hover:bg-[#D1121B] text-white text-[9px] font-bold px-1.5 py-0.5 rounded transition-all"
                      >
                        Set Main
                      </button>
                    )}

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white w-5 h-5 rounded-full grid place-items-center opacity-80 group-hover:opacity-100 transition-opacity shadow-sm"
                      title="Remove image"
                    >
                      <CloseIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 italic bg-zinc-50 p-3 rounded-xl border border-dashed border-zinc-200 text-center">
                No custom photos uploaded yet. Category placeholder will be used by default.
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-3 border-t border-zinc-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-sm py-2.5 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 bg-[#D1121B] hover:bg-[#7A1118] text-white font-bold text-sm py-2.5 rounded-xl transition-colors shadow-sm"
          >
            {mode === "add" ? "Add Product" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-zinc-600 uppercase tracking-wide mb-1.5">
        {label} {required && <span className="text-[#D1121B]">*</span>}
      </span>
      {children}
    </label>
  );
}
