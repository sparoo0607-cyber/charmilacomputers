"use client";

import { festivalConfig } from "@/config/festivalConfig";

interface IndianPatternProps {
  opacity?: number;
  className?: string;
}

export default function IndianPattern({ opacity = 0.04, className = "" }: IndianPatternProps) {
  if (!festivalConfig.enabled || !festivalConfig.sectionAccents) return null;

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden ${className}`}
      style={{ opacity }}
    >
      <svg className="w-full h-full text-[#C89B3C]" xmlns="http://www.w3.org/2000/svg">
        <pattern id="rangoli-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
          {/* Temple Arch & Mandana Geometry */}
          <path
            d="M40 0 L80 40 L40 80 L0 40 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.75"
          />
          <circle cx="40" cy="40" r="16" fill="none" stroke="currentColor" strokeWidth="0.75" />
          <path
            d="M40 24 C32 32 32 48 40 56 C48 48 48 32 40 24 Z M24 40 C32 32 48 32 56 40 C48 48 32 48 24 40 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
          />
          <circle cx="40" cy="40" r="3" fill="currentColor" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#rangoli-pattern)" />
      </svg>
    </div>
  );
}
