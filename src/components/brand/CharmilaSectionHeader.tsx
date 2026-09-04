"use client";

interface CharmilaSectionHeaderProps {
  index?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  className?: string;
}

export default function CharmilaSectionHeader({
  index,
  title,
  subtitle,
  badge = "ENGINEERED FOR PERFORMANCE",
  className = "",
}: CharmilaSectionHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-[#E5E0D7] relative ${className}`}>
      {/* Index Number & Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {index && (
            <span className="text-xs font-mono font-bold tracking-widest text-[#A90000] bg-[#A90000]/10 px-2 py-0.5 rounded">
              {index}
            </span>
          )}
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            {badge}
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#1D303B] font-serif uppercase">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-zinc-600 font-medium max-w-xl">
            {subtitle}
          </p>
        )}
      </div>

      {/* Signature Red Accent Bar */}
      <div className="hidden sm:flex items-center gap-2">
        <span className="w-2 h-2 bg-[#A90000] rotate-45" />
        <div className="w-16 h-[2px] bg-gradient-to-r from-[#A90000] to-transparent" />
      </div>
    </div>
  );
}
