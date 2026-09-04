"use client";

interface CharmilaCornerAccentProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function CharmilaCornerAccent({
  size = "md",
  className = "",
}: CharmilaCornerAccentProps) {
  const sizeMap = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div
      aria-hidden="true"
      className={`absolute top-0 right-0 z-20 pointer-events-none select-none overflow-hidden ${sizeMap[size]} ${className}`}
    >
      {/* Signature Diagonal Charmila Red Corner Triangle */}
      <div className="w-full h-full bg-gradient-to-bl from-[#A90000] via-[#C51A1A] to-transparent transform translate-x-1/2 -translate-y-1/2 rotate-45 shadow-xs transition-opacity group-hover:opacity-100 opacity-80" />
    </div>
  );
}
