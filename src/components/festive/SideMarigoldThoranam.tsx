"use client";

import { festivalConfig } from "@/config/festivalConfig";

export default function SideMarigoldThoranam() {
  if (!festivalConfig.enabled || !festivalConfig.thoranam) return null;

  return (
    <>
      {/* Left Hanging Marigold Garland */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-1 sm:left-3 z-[150] pointer-events-none select-none hidden md:block festive-sway"
      >
        <svg
          width="40"
          height="450"
          viewBox="0 0 40 450"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-md"
        >
          <defs>
            <radialGradient id="sideOrange" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F8C471" />
              <stop offset="55%" stopColor="#D98A19" />
              <stop offset="100%" stopColor="#9C5205" />
            </radialGradient>
            <radialGradient id="sideYellow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF6E3" />
              <stop offset="50%" stopColor="#F5B041" />
              <stop offset="100%" stopColor="#B7770D" />
            </radialGradient>
          </defs>

          {/* Golden Thread */}
          <line x1="20" y1="0" x2="20" y2="420" stroke="#C89B3C" strokeWidth="2.5" strokeDasharray="6 3" />

          {/* Marigold Flower Clusters Along Thread */}
          {Array.from({ length: 11 }).map((_, i) => {
            const cy = i * 36 + 25;
            const isYellow = i % 2 === 0;
            const size = i === 0 || i === 10 ? 14 : 16;

            return (
              <g key={i} transform={`translate(20, ${cy})`}>
                <circle cx="0" cy="0" r={size} fill={isYellow ? "url(#sideYellow)" : "url(#sideOrange)"} />
                <circle cx="-4" cy="-4" r={size * 0.45} fill="#F8C471" opacity="0.8" />
                <circle cx="4" cy="4" r={size * 0.45} fill="#D98A19" opacity="0.8" />
                <circle cx="0" cy="0" r={size * 0.25} fill="#FFF6E3" />
              </g>
            );
          })}

          {/* Bottom Brass Bell Accent */}
          <g transform="translate(20, 422)">
            <path d="M-8 0 L8 0 L10 14 C10 18 -10 18 -10 14 Z" fill="#C89B3C" stroke="#A77A24" strokeWidth="1" />
            <circle cx="0" cy="18" r="3.5" fill="#7E5B15" />
          </g>
        </svg>
      </div>

      {/* Right Hanging Marigold Garland */}
      <div
        aria-hidden="true"
        className="fixed top-0 right-1 sm:right-3 z-[150] pointer-events-none select-none hidden md:block festive-sway"
        style={{ animationDelay: "-2.5s" }}
      >
        <svg
          width="40"
          height="450"
          viewBox="0 0 40 450"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-md"
        >
          <line x1="20" y1="0" x2="20" y2="420" stroke="#C89B3C" strokeWidth="2.5" strokeDasharray="6 3" />

          {Array.from({ length: 11 }).map((_, i) => {
            const cy = i * 36 + 25;
            const isYellow = i % 2 !== 0;
            const size = i === 0 || i === 10 ? 14 : 16;

            return (
              <g key={i} transform={`translate(20, ${cy})`}>
                <circle cx="0" cy="0" r={size} fill={isYellow ? "url(#sideYellow)" : "url(#sideOrange)"} />
                <circle cx="-4" cy="-4" r={size * 0.45} fill="#F8C471" opacity="0.8" />
                <circle cx="4" cy="4" r={size * 0.45} fill="#D98A19" opacity="0.8" />
                <circle cx="0" cy="0" r={size * 0.25} fill="#FFF6E3" />
              </g>
            );
          })}

          <g transform="translate(20, 422)">
            <path d="M-8 0 L8 0 L10 14 C10 18 -10 18 -10 14 Z" fill="#C89B3C" stroke="#A77A24" strokeWidth="1" />
            <circle cx="0" cy="18" r="3.5" fill="#7E5B15" />
          </g>
        </svg>
      </div>
    </>
  );
}
