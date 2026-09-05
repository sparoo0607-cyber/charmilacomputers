"use client";

import { festivalConfig } from "@/config/festivalConfig";

export default function MangoLeafThoranam() {
  if (!festivalConfig.enabled || !festivalConfig.thoranam) return null;

  // 8 Scalloped arch peaks across 1200px
  const archPeaks = [0, 150, 300, 450, 600, 750, 900, 1050, 1200];
  
  // Dense leaf positions across 1200px
  const leafPositions = Array.from({ length: 49 }, (_, i) => i * 25);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[150] w-full pointer-events-none select-none overflow-visible flex justify-center"
    >
      <div className="w-full max-w-[1920px] festive-sway overflow-visible">
        <svg
          viewBox="0 0 1200 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-16 sm:h-20 md:h-24 lg:h-28 min-w-[700px] filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)] overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Dark Lush Mango Leaf Gradient */}
            <linearGradient id="mangoLeafDark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3D5A22" />
              <stop offset="50%" stopColor="#294015" />
              <stop offset="100%" stopColor="#15240A" />
            </linearGradient>

            {/* Vibrant Fresh Mango Leaf Gradient */}
            <linearGradient id="mangoLeafFresh" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7DAA42" />
              <stop offset="55%" stopColor="#4F7A25" />
              <stop offset="100%" stopColor="#2D4B12" />
            </linearGradient>

            {/* Golden Leaf Highlights */}
            <linearGradient id="mangoLeafGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#99C250" />
              <stop offset="70%" stopColor="#5E8C2A" />
              <stop offset="100%" stopColor="#355415" />
            </linearGradient>

            {/* Marigold Orange Radial */}
            <radialGradient id="marigoldOrange" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFE082" />
              <stop offset="35%" stopColor="#FF9800" />
              <stop offset="75%" stopColor="#E65100" />
              <stop offset="100%" stopColor="#8D2600" />
            </radialGradient>

            {/* Marigold Yellow Radial */}
            <radialGradient id="marigoldYellow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFDE7" />
              <stop offset="40%" stopColor="#FFEB3B" />
              <stop offset="80%" stopColor="#F57F17" />
              <stop offset="100%" stopColor="#AF6000" />
            </radialGradient>

            {/* Metallic Gold Braid */}
            <linearGradient id="goldBraid" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#C89B3C" />
              <stop offset="30%" stopColor="#FFF3B0" />
              <stop offset="50%" stopColor="#E5B23D" />
              <stop offset="80%" stopColor="#9A701E" />
              <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
          </defs>

          {/* Background Shadow Strand */}
          <path
            d="M0 14 Q 75 38, 150 14 Q 225 38, 300 14 Q 375 38, 450 14 Q 525 38, 600 14 Q 675 38, 750 14 Q 825 38, 900 14 Q 975 38, 1050 14 Q 1125 38, 1200 14"
            stroke="rgba(0,0,0,0.4)"
            strokeWidth="6"
            fill="none"
          />

          {/* Primary Golden Braided Rope Cord */}
          <path
            d="M0 12 Q 75 36, 150 12 Q 225 36, 300 12 Q 375 36, 450 12 Q 525 36, 600 12 Q 675 36, 750 12 Q 825 36, 900 12 Q 975 36, 1050 12 Q 1125 36, 1200 12"
            stroke="url(#goldBraid)"
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* DENSE MANGO LEAVES ALONG ARCHES */}
          {leafPositions.map((x, idx) => {
            // Catenary Y curve calculation for natural arch placement
            const archIndex = Math.floor(x / 150);
            const localX = (x % 150) / 150; // 0 to 1
            const archY = 12 + Math.sin(localX * Math.PI) * 24;

            const isFresh = idx % 2 === 0;
            const isGold = idx % 5 === 0;
            const leafFill = isGold ? "url(#mangoLeafGold)" : isFresh ? "url(#mangoLeafFresh)" : "url(#mangoLeafDark)";
            const rotAngle = (localX - 0.5) * 45; // rotate outwards along curve

            return (
              <g key={`leaf-${x}`} transform={`translate(${x}, ${archY})`}>
                {/* Left Sub-leaf */}
                <path
                  d="M0 0 C-14 18, -12 42, 0 58 C8 42, 10 18, 0 0 Z"
                  fill={leafFill}
                  transform={`rotate(${-22 + rotAngle}) scale(0.95)`}
                />
                {/* Center Main Mango Leaf */}
                <path
                  d="M0 0 C-10 22, -6 48, 0 66 C6 48, 10 22, 0 0 Z"
                  fill="url(#mangoLeafDark)"
                  transform={`rotate(${rotAngle})`}
                />
                {/* Right Sub-leaf */}
                <path
                  d="M0 0 C-8 18, 12 42, 0 58 C14 42, 12 18, 0 0 Z"
                  fill={leafFill}
                  transform={`rotate(${22 + rotAngle}) scale(0.95)`}
                />
                {/* Leaf Spine Vein */}
                <path d="M0 0 L0 56" stroke="#A6D157" strokeWidth="1.2" opacity="0.65" transform={`rotate(${rotAngle})`} />
              </g>
            );
          })}

          {/* MARIGOLD FLOWER KNOTS & BRASS BELLS AT EACH ARCH PEAK */}
          {archPeaks.map((x, idx) => {
            const isYellow = idx % 2 === 0;
            return (
              <g key={`peak-${x}`} transform={`translate(${x}, 12)`}>
                {/* Marigold Flower Base */}
                <circle cx="0" cy="0" r="13" fill={isYellow ? "url(#marigoldYellow)" : "url(#marigoldOrange)"} />
                <circle cx="-5" cy="-5" r="6" fill="#FFE082" opacity="0.85" />
                <circle cx="5" cy="5" r="6" fill="#FF9800" opacity="0.85" />
                <circle cx="0" cy="0" r="4.5" fill="#FFFDE7" />

                {/* Hanging Small Bell Accent under Flower Knot */}
                <g transform="translate(0, 16)">
                  <line x1="0" y1="0" x2="0" y2="8" stroke="#C89B3C" strokeWidth="1.5" />
                  <path d="M-5 8 L5 8 L6 16 C6 18 -6 18 -6 16 Z" fill="url(#goldBraid)" stroke="#8A6110" strokeWidth="0.8" />
                  <circle cx="0" cy="18" r="2" fill="#5C3E00" />
                </g>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
