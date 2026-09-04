"use client";

import { festivalConfig } from "@/config/festivalConfig";

export default function MangoLeafThoranam() {
  if (!festivalConfig.enabled || !festivalConfig.thoranam) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[150] w-full overflow-hidden pointer-events-none select-none"
    >
      <div className="w-full flex items-center justify-between festive-sway">
        <svg
          viewBox="0 0 1200 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-10 sm:h-14 md:h-16 object-cover min-w-[700px] drop-shadow-lg"
          preserveAspectRatio="none"
        >
          {/* Main Decorative Golden Twine Cord */}
          <path
            d="M0 8 Q 150 24, 300 8 T 600 8 T 900 8 T 1200 8"
            stroke="#A77A24"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          <defs>
            {/* Dark Mango Leaf Gradient */}
            <linearGradient id="leafGradDark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#48632E" />
              <stop offset="60%" stopColor="#31471F" />
              <stop offset="100%" stopColor="#1D2E11" />
            </linearGradient>
            {/* Vibrant Mango Leaf Gradient */}
            <linearGradient id="leafGradBright" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6C9440" />
              <stop offset="70%" stopColor="#486727" />
              <stop offset="100%" stopColor="#2E4417" />
            </linearGradient>
            {/* Marigold Petal Radial Gradient */}
            <radialGradient id="marigoldGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F8C471" />
              <stop offset="65%" stopColor="#D98A19" />
              <stop offset="100%" stopColor="#A05A08" />
            </radialGradient>
          </defs>

          {/* Repeatable Leaf & Marigold Cluster Pattern along Cord */}
          {[
            30, 80, 130, 180, 230, 280, 330, 380, 430, 480, 530, 580, 630, 680,
            730, 780, 830, 880, 930, 980, 1030, 1080, 1130, 1170,
          ].map((x, idx) => {
            const isBright = idx % 2 === 0;
            const hasMarigold = idx % 3 === 0;
            const leafAngle = (idx % 5 - 2) * 5;

            return (
              <g key={x} transform={`translate(${x}, ${10 + (idx % 3)})`}>
                {/* Left Leaf */}
                <path
                  d="M0 0 C-12 16, -10 36, 0 48 C6 36, 8 16, 0 0 Z"
                  fill={`url(#${isBright ? "leafGradBright" : "leafGradDark"})`}
                  transform={`rotate(${-18 + leafAngle})`}
                />
                {/* Center Leaf */}
                <path
                  d="M0 0 C-8 20, -5 42, 0 52 C5 42, 8 20, 0 0 Z"
                  fill="url(#leafGradDark)"
                  transform={`rotate(${leafAngle})`}
                />
                {/* Right Leaf */}
                <path
                  d="M0 0 C-6 16, 8 36, 0 48 C10 36, 12 16, 0 0 Z"
                  fill={`url(#${isBright ? "leafGradBright" : "leafGradDark"})`}
                  transform={`rotate(${18 + leafAngle})`}
                />
                {/* Leaf Midrib Lines */}
                <path d="M0 0 L0 44" stroke="#9EBF67" strokeWidth="1" opacity="0.7" />

                {/* Marigold Flower Knot Accent */}
                {hasMarigold && (
                  <g transform="translate(0, 6)">
                    <circle cx="0" cy="0" r="7.5" fill="url(#marigoldGrad)" />
                    <circle cx="-2.5" cy="-2.5" r="3.5" fill="#F8C471" opacity="0.9" />
                    <circle cx="2.5" cy="2.5" r="3.5" fill="#D98A19" />
                    <circle cx="0" cy="0" r="2" fill="#FFF6E3" />
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
