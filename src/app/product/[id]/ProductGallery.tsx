"use client";

import { useState, useMemo } from "react";
import { Product } from "@/data/types";
import ProductImage from "@/components/ProductImage";

export default function ProductGallery({ product }: { product: Product }) {
  const galleryImages = useMemo(() => {
    if (product.images && product.images.length > 0) return product.images;
    if (product.imageUrl) return [product.imageUrl];
    return [];
  }, [product]);

  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const activeImage = selectedImg || galleryImages[0] || product.imageUrl;

  return (
    <div className="lg:col-span-5 flex flex-col gap-4">
      <div className="relative bg-[#FAF7F2] rounded-2xl p-8 border border-[#E5E0D7] flex items-center justify-center overflow-hidden group">
        {product.mrp && product.mrp > product.price && (
          <span className="absolute top-4 left-4 bg-[#D1121B] text-white text-xs font-black px-2.5 py-1 rounded shadow uppercase tracking-wider">
            SAVE {Math.round(100 - (product.price / product.mrp) * 100)}%
          </span>
        )}
        <ProductImage
          categorySlug={product.categorySlug}
          productId={product.id}
          imageUrl={activeImage}
          className="w-full max-w-[340px] aspect-square object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Thumbnail Gallery Strip */}
      {galleryImages.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {galleryImages.map((imgUrl, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedImg(imgUrl)}
              className={`p-2 bg-[#FAF7F2] rounded-xl border-2 transition-all cursor-pointer ${
                activeImage === imgUrl
                  ? "border-[#D1121B] shadow-xs ring-2 ring-red-500/20 opacity-100"
                  : "border-[#E5E0D7] hover:border-zinc-400 opacity-70 hover:opacity-100"
              }`}
            >
              <ProductImage
                categorySlug={product.categorySlug}
                productId={product.id}
                imageUrl={imgUrl}
                className="w-full aspect-square object-contain"
              />
            </div>
          ))}
        </div>
      )}

      {/* Key Product Assurance Badges */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-zinc-100 text-center text-[11px] text-zinc-600">
        <div className="p-2 rounded-lg bg-[#FAF7F2]">
          <span className="block font-bold text-[#1B1B1B]">100% Genuine</span>
          <span className="text-[10px] text-zinc-500">Official Brand Seal</span>
        </div>
        <div className="p-2 rounded-lg bg-[#FAF7F2]">
          <span className="block font-bold text-[#1B1B1B]">7 Days</span>
          <span className="text-[10px] text-zinc-500">Replacement Guarantee</span>
        </div>
        <div className="p-2 rounded-lg bg-[#FAF7F2]">
          <span className="block font-bold text-[#1B1B1B]">GST Invoice</span>
          <span className="text-[10px] text-zinc-500">Input Tax Credit</span>
        </div>
      </div>
    </div>
  );
}
