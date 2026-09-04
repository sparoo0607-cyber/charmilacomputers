"use client";

import { festivalConfig } from "@/config/festivalConfig";

interface MarigoldGarlandProps {
  variant?: "top" | "divider" | "banner";
  className?: string;
}

export default function MarigoldGarland({ variant = "top", className = "" }: MarigoldGarlandProps) {
  if (!festivalConfig.enabled || !festivalConfig.garlands) return null;

  return (
    <div
      aria-hidden="true"
      className={`w-full overflow-hidden pointer-events-none select-none ${className}`}
    >
      <svg
        viewBox="0 0 1000 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-6 sm:h-8 object-cover"
        preserveAspectRatio="none"
      >
        <defs>
          <radialGradient id="garlandMarigoldOrange" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F8C471" />
            <stop offset="50%" stopColor="#D98A19" />
            <stop offset="100%" stopColor="#9C5205" />
          </radialGradient>
          <radialGradient id="garlandMarigoldYellow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDEBD0" />
            <stop offset="45%" stopColor="#F5B041" />
            <stop offset="100%" stopColor="#B7770D" />
          </radialGradient>
        </defs>

        {/* Decorative Golden Twine String */}
        <path
          d="M0 8 Q 125 18, 250 8 T 500 8 T 750 8 T 1000 8"
          stroke="#C89B3C"
          strokeWidth="1.8"
          strokeDasharray="4 2"
        />

        {/* Flower Garland Loops */}
        {Array.from({ length: 25 }).map((_, i) => {
          const cx = i * 40 + 20;
          const cy = 10 + (i % 2 === 0 ? 3 : -1);
          const isYellow = i % 2 === 0;

          return (
            <g key={i} transform={`translate(${cx}, ${cy})`}>
              {/* Petal Outer Cluster */}
              <circle cx="0" cy="0" r="9" fill={isYellow ? "url(#garlandMarigoldYellow)" : "url(#garlandMarigoldOrange)"} />
              <circle cx="-3" cy="-3" r="4" fill="#F8C471" opacity="0.7" />
              <circle cx="3" cy="-2" r="4" fill="#D98A19" opacity="0.8" />
              <circle cx="0" cy="3" r="4" fill="#B7770D" opacity="0.6" />
              <circle cx="0" cy="0" r="3" fill="#FFF6E3" opacity="0.9" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
