"use client";

import { festivalConfig } from "@/config/festivalConfig";

interface DiyaDecorationProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function DiyaDecoration({ size = "md", className = "" }: DiyaDecorationProps) {
  if (!festivalConfig.enabled || !festivalConfig.diyas) return null;

  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div
      aria-hidden="true"
      className={`relative inline-flex items-center justify-center pointer-events-none select-none ${sizeMap[size]} ${className}`}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* Flame Glow Radial Gradient */}
          <radialGradient id="diyaGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF6E3" stopOpacity="1" />
            <stop offset="45%" stopColor="#F5B041" stopOpacity="0.8" />
            <stop offset="85%" stopColor="#D98A19" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6E0F12" stopOpacity="0" />
          </radialGradient>
          {/* Brass Lamp Metallic Gradient */}
          <linearGradient id="brassGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E5C158" />
            <stop offset="50%" stopColor="#C89B3C" />
            <stop offset="100%" stopColor="#7E5B15" />
          </linearGradient>
        </defs>

        {/* Ambient Light Halo */}
        <circle cx="32" cy="18" r="18" fill="url(#diyaGlow)" opacity="0.75" />

        {/* Flickering Flame Layer */}
        <g className="festive-diya-flame">
          {/* Outer Flame (Orange) */}
          <path
            d="M32 6 C27 16, 25 22, 32 26 C39 22, 37 16, 32 6 Z"
            fill="#D98A19"
          />
          {/* Middle Flame (Gold/Yellow) */}
          <path
            d="M32 10 C29 17, 28 21, 32 24 C36 21, 35 17, 32 10 Z"
            fill="#F5B041"
          />
          {/* Inner Flame Core (Bright White/Ivory) */}
          <path
            d="M32 14 C30 18, 30 21, 32 22 C34 21, 34 18, 32 14 Z"
            fill="#FFF6E3"
          />
        </g>

        {/* Cotton Wick */}
        <path d="M32 25 L32 29" stroke="#3A2312" strokeWidth="2" strokeLinecap="round" />

        {/* Traditional Brass Diya Base Bowl */}
        <path
          d="M12 30 C12 30, 20 48, 32 48 C44 48, 52 30, 52 30 C52 30, 42 36, 32 36 C22 36, 12 30, 12 30 Z"
          fill="url(#brassGrad)"
          stroke="#A77A24"
          strokeWidth="1.2"
        />

        {/* Decorative Rim Engravings */}
        <path
          d="M16 33 C22 37, 42 37, 48 33"
          stroke="#FFF6E3"
          strokeWidth="1"
          strokeDasharray="2 2"
          opacity="0.6"
        />

        {/* Pedestal Stand */}
        <path
          d="M26 47 L38 47 L42 54 L22 54 Z"
          fill="url(#brassGrad)"
          stroke="#7E5B15"
          strokeWidth="1"
        />
        <rect x="20" y="54" width="24" height="3" rx="1.5" fill="#7E5B15" />
      </svg>
    </div>
  );
}
