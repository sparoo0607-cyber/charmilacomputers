"use client";

interface CharmilaTechLineProps {
  className?: string;
}

export default function CharmilaTechLine({ className = "" }: CharmilaTechLineProps) {
  return (
    <div
      aria-hidden="true"
      className={`w-full flex items-center gap-2 select-none pointer-events-none my-3 ${className}`}
    >
      <span className="w-1.5 h-1.5 bg-[#A90000] rotate-45 shrink-0" />
      <div className="h-[1px] flex-1 bg-gradient-to-r from-[#A90000] via-[#C51A1A]/40 to-transparent" />
    </div>
  );
}
