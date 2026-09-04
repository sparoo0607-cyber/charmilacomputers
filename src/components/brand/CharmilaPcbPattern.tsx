"use client";

interface CharmilaPcbPatternProps {
  opacity?: number;
  className?: string;
}

export default function CharmilaPcbPattern({
  opacity = 0.03,
  className = "",
}: CharmilaPcbPatternProps) {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden ${className}`}
      style={{ opacity }}
    >
      <svg className="w-full h-full text-[#1D303B]" xmlns="http://www.w3.org/2000/svg">
        <pattern id="pcb-traces" width="120" height="120" patternUnits="userSpaceOnUse">
          {/* Subtle PCB Traces Vector */}
          <path
            d="M 10 10 L 40 10 L 60 30 L 110 30"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle cx="10" cy="10" r="2.5" fill="currentColor" />
          <circle cx="110" cy="30" r="2.5" fill="currentColor" />

          <path
            d="M 20 110 L 50 110 L 70 90 L 100 90"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle cx="20" cy="110" r="2.5" fill="currentColor" />
          <circle cx="100" cy="90" r="2.5" fill="currentColor" />

          <path
            d="M 60 30 L 60 70 L 40 90"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle cx="40" cy="90" r="2" fill="currentColor" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#pcb-traces)" />
      </svg>
    </div>
  );
}
