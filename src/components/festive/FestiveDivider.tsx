"use client";

import { festivalConfig } from "@/config/festivalConfig";

interface FestiveDividerProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function FestiveDivider({ title, subtitle, className = "" }: FestiveDividerProps) {
  if (!festivalConfig.enabled || !festivalConfig.sectionAccents) return null;

  return (
    <div
      aria-hidden="true"
      className={`w-full flex flex-col items-center justify-center my-6 py-2 select-none ${className}`}
    >
      <div className="flex items-center justify-center gap-3 w-full max-w-xl px-4">
        {/* Left Thin Gold Line */}
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#C89B3C]/60 to-[#A77A24]" />

        {/* Central Indian Arch & Lotus Diamond Motif */}
        <div className="flex items-center gap-1.5 text-[#C89B3C]">
          <span className="w-1.5 h-1.5 rotate-45 border border-[#C89B3C]" />
          <svg className="w-5 h-5 text-[#D98A19]" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C10 7 6 10 2 12C6 14 10 17 12 22C14 17 18 14 22 12C18 10 14 7 12 2Z"
              fill="currentColor"
              opacity="0.8"
            />
            <circle cx="12" cy="12" r="3" fill="#FFF6E3" />
          </svg>
          <span className="w-1.5 h-1.5 rotate-45 border border-[#C89B3C]" />
        </div>

        {/* Right Thin Gold Line */}
        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#C89B3C]/60 to-[#A77A24]" />
      </div>

      {title && (
        <span className="mt-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#A77A24] festive-shimmer-text">
          {title}
        </span>
      )}
      {subtitle && (
        <span className="text-[11px] text-[#4A080B]/70 font-medium">
          {subtitle}
        </span>
      )}
    </div>
  );
}
