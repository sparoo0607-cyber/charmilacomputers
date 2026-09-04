"use client";

import { useEffect, useState } from "react";
import { festivalConfig } from "@/config/festivalConfig";

interface Petal {
  id: number;
  left: number; // percentage
  size: number; // px
  duration: number; // seconds
  delay: number; // seconds
  color: string;
  rotation: number;
}

export default function FestivePetals() {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    if (!festivalConfig.enabled || !festivalConfig.petals) return;

    // Check reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const colors = ["#D98A19", "#F5B041", "#F8C471", "#C89B3C"];
    const count = 8; // Max 8 petals for optimal performance

    const generated: Petal[] = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 92 + 4,
      size: Math.floor(Math.random() * 8) + 10,
      duration: Math.random() * 6 + 10, // 10s - 16s slow drift
      delay: Math.random() * 8,
      color: colors[i % colors.length],
      rotation: Math.floor(Math.random() * 360),
    }));

    setPetals(generated);
  }, []);

  if (!festivalConfig.enabled || !festivalConfig.petals || petals.length === 0) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-20 overflow-hidden"
    >
      {petals.map((petal) => (
        <svg
          key={petal.id}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute top-0 opacity-0"
          style={{
            left: `${petal.left}%`,
            width: `${petal.size}px`,
            height: `${petal.size}px`,
            animation: `festivePetalFall ${petal.duration}s linear infinite`,
            animationDelay: `${petal.delay}s`,
            transform: `rotate(${petal.rotation}deg)`,
          }}
        >
          {/* Organic Marigold Petal Shape */}
          <path
            d="M12 2 C8 7, 4 14, 12 22 C20 14, 16 7, 12 2 Z"
            fill={petal.color}
            opacity="0.85"
          />
          <path
            d="M12 4 L12 18"
            stroke="#FFF6E3"
            strokeWidth="0.8"
            opacity="0.5"
          />
        </svg>
      ))}
    </div>
  );
}
