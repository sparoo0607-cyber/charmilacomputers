"use client";

import { Product } from "@/data/types";

export default function HardwareDataHover({ product }: { product: Product }) {
  if (!product.specs) return null;

  const entries = Object.entries(product.specs).slice(0, 3);
  if (entries.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="absolute bottom-2 left-2 right-2 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
    >
      <div className="bg-[#1D303B]/95 backdrop-blur-xs text-[#FFF6E3] p-2 rounded-lg text-[10px] shadow-lg border border-[#A90000]/40 flex flex-col gap-1">
        <div className="flex items-center justify-between font-mono font-bold text-[#A90000] border-b border-white/10 pb-0.5 uppercase tracking-wider">
          <span>TECH SPECS</span>
          <span className="w-1.5 h-1.5 bg-[#A90000] rounded-full animate-ping" />
        </div>
        <div className="grid grid-cols-1 gap-0.5 font-sans font-medium text-zinc-200">
          {entries.map(([key, val]) => (
            <div key={key} className="flex justify-between items-center gap-1">
              <span className="text-zinc-400 font-normal truncate max-w-[45%]">{key}:</span>
              <span className="font-semibold text-white truncate max-w-[55%] text-right">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
