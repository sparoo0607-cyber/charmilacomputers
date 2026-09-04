"use client";

import { festivalConfig } from "@/config/festivalConfig";

interface FestiveBadgeProps {
  label?: string;
  className?: string;
}

export default function FestiveBadge({
  label = "VINAYAKA FESTIVE OFFER",
  className = "",
}: FestiveBadgeProps) {
  if (!festivalConfig.enabled || !festivalConfig.badges) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#6E0F12] text-[#FFF6E3] border border-[#A77A24]/70 shadow-sm festive-shimmer-badge select-none ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#D98A19] animate-pulse shrink-0" />
      <span>{label}</span>
    </span>
  );
}
