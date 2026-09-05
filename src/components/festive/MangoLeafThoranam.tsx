"use client";

import { festivalConfig } from "@/config/festivalConfig";

export default function MangoLeafThoranam() {
  if (!festivalConfig.enabled || !festivalConfig.thoranam) return null;

  // Delicate leaf positions across 1200px (every 32px)
  const leafPositions = Array.from({ length: 38 }, (_, i) => i * 32 + 16);
  
  // Arch peak positions for small flower knots (every 120px)
  const flowerPeaks = Array.from({ length: 11 }, (_, i) => i * 120);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[150] w-full pointer-events-none select-none overflow-hidden flex justify-center"
    >
      <div className="w-full max-w-[1920px] festive-sway">
        <svg
          viewBox="0 0 1200 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-7 sm:h-9 md:h-10 min-w-[700px] filter drop-shadow-sm"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Elegant Fresh Mango Leaf Gradient */}
            <linearGradient id="mangoLeafFresh" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5E8C2B" />
              <stop offset="60%" stopColor="#3E611B" />
              <stop offset="100%" stopColor="#253D0F" />
            </linearGradient>

            {/* Dark Accent Leaf Gradient */}
            <linearGradient id="mangoLeafDark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#43661E" />
              <stop offset="60%" stopColor="#2A4511" />
              <stop offset="100%" stopColor="#182A09" />
            </linearGradient>

            {/* Marigold Petal Radial */}
            <radialGradient id="marigoldSmall" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFE082" />
              <stop offset="60%" stopColor="#F57C00" />
              <stop offset="100%" stopColor="#B73600" />
            </radialGradient>

            {/* Slim Gold Twine */}
            <linearGradient id="goldTwine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#C89B3C" />
              <stop offset="50%" stopColor="#FFE58F" />
              <stop offset="100%" stopColor="#C89B3C" />
            </linearGradient>
          </defs>

          {/* Gentle Scalloped Golden Twine Cord */}
          <path
            d="M0 6 Q 60 16, 120 6 Q 180 16, 240 6 Q 300 16, 360 6 Q 420 16, 480 6 Q 540 16, 600 6 Q 660 16, 720 6 Q 780 16, 840 6 Q 900 16, 960 6 Q 1020 16, 1080 6 Q 1140 16, 1200 6"
            stroke="url(#goldTwine)"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />

          {/* SLEEK & LIGHTWEIGHT MANGO LEAF CLUSTERS */}
          {leafPositions.map((x, idx) => {
            const localX = (x % 120) / 120;
            const archY = 6 + Math.sin(localX * Math.PI) * 10;
            const isFresh = idx % 2 === 0;
            const rotAngle = (localX - 0.5) * 28;

            return (
              <g key={`leaf-${x}`} transform={`translate(${x}, ${archY})`}>
                {/* Left Leaf */}
                <path
                  d="M0 0 C-6 8, -5 20, 0 28 C3 20, 4 8, 0 0 Z"
                  fill={isFresh ? "url(#mangoLeafFresh)" : "url(#mangoLeafDark)"}
                  transform={`rotate(${-14 + rotAngle})`}
                />
                {/* Center Main Leaf */}
                <path
                  d="M0 0 C-4 10, -3 22, 0 31 C3 22, 4 10, 0 0 Z"
                  fill="url(#mangoLeafDark)"
                  transform={`rotate(${rotAngle})`}
                />
                {/* Right Leaf */}
                <path
                  d="M0 0 C-4 8, 6 20, 0 28 C5 20, 6 8, 0 0 Z"
                  fill={isFresh ? "url(#mangoLeafFresh)" : "url(#mangoLeafDark)"}
                  transform={`rotate(${14 + rotAngle})`}
                />
                {/* Spine Vein */}
                <path d="M0 0 L0 26" stroke="#99C250" strokeWidth="0.8" opacity="0.6" transform={`rotate(${rotAngle})`} />
              </g>
            );
          })}

          {/* DELICATE MARIGOLD KNOT ACCENTS */}
          {flowerPeaks.map((x) => (
            <g key={`flower-${x}`} transform={`translate(${x}, 6)`}>
              <circle cx="0" cy="0" r="5" fill="url(#marigoldSmall)" />
              <circle cx="-1.5" cy="-1.5" r="2" fill="#FFE082" opacity="0.9" />
              <circle cx="0" cy="0" r="1.2" fill="#FFFDE7" />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
