"use client";

import { useCart } from "@/context/CartContext";
import { CheckIcon } from "./icons";

export default function Toast() {
  const { toast } = useCart();

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-4 left-1/2 z-[100] -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0 pointer-events-none"
    >
      {toast && (
        <div className="animate-toast-in pointer-events-auto flex items-center gap-2.5 rounded-lg bg-[#222222] text-white shadow-xl px-4 py-3 text-sm font-semibold border border-white/10 max-w-[90vw] sm:max-w-sm">
          <span className="grid place-items-center w-5 h-5 rounded-full bg-green-500 shrink-0">
            <CheckIcon className="w-3 h-3" />
          </span>
          <span className="line-clamp-2">{toast}</span>
        </div>
      )}
    </div>
  );
}
