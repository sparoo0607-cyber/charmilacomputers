"use client";

import { useEffect, useMemo, useState } from "react";
import { buildableCategories } from "@/data/categories";
import { getProduct, getProductsByCategory } from "@/data/products";
import { formatINR, whatsappOrderLink, STORE } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { Category, Product } from "@/data/types";
import ProductImage from "@/components/ProductImage";
import {
  CheckIcon, PlusIcon, SearchIcon, TrashIcon,
  WhatsAppIcon, BoltIcon, CloseIcon,
} from "@/components/icons";

// Core components a working PC can't run without — shown first, and counted
// toward the completeness badge. Everything else in buildableCategories
// (monitors, keyboards, mice, headsets, HDD) is an optional add-on.
const CORE_SLUGS = [
  "processors", "motherboards", "memory", "ssd",
  "graphics-cards", "power-supply", "cabinets", "coolers",
];

const BUILD_STORAGE_KEY = "charmila_pc_builder_v1";

interface Selection {
  productId: string;
  qty: number;
}

const PRESET_BUILDS = [
  {
    id: "budget-esports",
    title: "Budget Esports",
    priceRange: "₹45K",
    badge: "Most Popular",
    color: "from-orange-500 to-red-600",
    parts: {
      processors: "cpu-3",
      motherboards: "mb-1",
      memory: "ram-2",
      ssd: "ssd-2",
      "graphics-cards": "gpu-1",
      "power-supply": "psu-1",
      cabinets: "cab-1",
    },
  },
  {
    id: "mid-gaming",
    title: "1440p Beast",
    priceRange: "₹98K",
    badge: "Best Value",
    color: "from-blue-500 to-indigo-600",
    parts: {
      processors: "cpu-6",
      motherboards: "mb-3",
      memory: "ram-3",
      ssd: "ssd-3",
      "graphics-cards": "gpu-3",
      coolers: "cool-3",
      "power-supply": "psu-3",
      cabinets: "cab-3",
      monitors: "mon-3",
    },
  },
  {
    id: "apex-titan",
    title: "4K Titan",
    priceRange: "₹2.95L",
    badge: "Apex Tier",
    color: "from-purple-500 to-pink-600",
    parts: {
      processors: "cpu-7",
      motherboards: "mb-5",
      memory: "ram-5",
      ssd: "ssd-5",
      "graphics-cards": "gpu-suprim",
      coolers: "cool-3",
      "power-supply": "psu-4",
      cabinets: "cab-4",
      monitors: "mon-4",
    },
  },
  {
    id: "office-pro",
    title: "Office Pro",
    priceRange: "₹28.5K",
    badge: "Work Build",
    color: "from-emerald-500 to-teal-600",
    parts: {
      processors: "cpu-2",
      motherboards: "mb-1",
      memory: "ram-1",
      ssd: "ssd-1",
      "power-supply": "psu-1",
      cabinets: "cab-1",
      monitors: "mon-1",
    },
  },
];

// Category short labels (no emojis)
const CAT_LABELS: Record<string, string> = {
  processors: "CPU",
  motherboards: "MB",
  memory: "RAM",
  ssd: "SSD",
  "graphics-cards": "GPU",
  coolers: "Cool",
  "power-supply": "PSU",
  cabinets: "Case",
  monitors: "Mon",
  keyboards: "KB",
};

export default function BuildYourPc() {
  // Start EMPTY — no preloaded default build. Only a build the visitor saved
  // themselves is restored (reading localStorage here, not in an effect, avoids
  // an extra render pass).
  const [selections, setSelections] = useState<Record<string, Selection>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = window.localStorage.getItem(BUILD_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Live catalog per buildable category, pulled from Supabase `products` so the
  // picker only ever suggests parts that actually exist in the store. Falls back
  // to the bundled catalog per-category (getProductsByCategoryLive already does
  // that on error/empty). Keyed by category slug.
  const [liveCatalog, setLiveCatalog] = useState<Record<string, Product[]>>({});
  const [catalogLoading, setCatalogLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const slugs = buildableCategories.map((c) => c.slug);
      const grouped: Record<string, Product[]> = {};
      try {
        const { supabase } = await import("@/lib/supabase/client");
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .in("category_slug", slugs);
        if (error || !data) throw error ?? new Error("no data");
        const { mapProductRow } = await import("@/data/products");
        for (const slug of slugs) grouped[slug] = [];
        for (const row of data) {
          const p = mapProductRow(row as Parameters<typeof mapProductRow>[0]);
          (grouped[p.categorySlug] ??= []).push(p);
        }
        // Any category Supabase returned nothing for → fall back to bundled data
        // so the picker is never emptier than the offline catalog.
        for (const slug of slugs) {
          if (grouped[slug].length === 0) grouped[slug] = getProductsByCategory(slug);
        }
      } catch {
        for (const slug of slugs) grouped[slug] = getProductsByCategory(slug);
      }
      if (cancelled) return;
      setLiveCatalog(grouped);
      setCatalogLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Every id in the live catalog, for O(1) lookups when resolving a selection.
  const liveById = useMemo(() => {
    const m = new Map<string, Product>();
    for (const list of Object.values(liveCatalog)) for (const p of list) m.set(p.id, p);
    return m;
  }, [liveCatalog]);

  // Resolve a product id against the live catalog first, then the bundled one.
  const resolveProduct = (id: string): Product | undefined => liveById.get(id) ?? getProduct(id);
  const catalogFor = (slug: string): Product[] => liveCatalog[slug] ?? getProductsByCategory(slug);

  useEffect(() => {
    try {
      window.localStorage.setItem(BUILD_STORAGE_KEY, JSON.stringify(selections));
    } catch {
      // ignore — storage may be full or unavailable
    }
  }, [selections]);

  const [activePickerCategory, setActivePickerCategory] = useState<string | null>(null);
  const [justAddedAll, setJustAddedAll] = useState(false);
  const { addToCart, showToast } = useCart();

  const coreCategories = useMemo(
    () => buildableCategories.filter((c) => CORE_SLUGS.includes(c.slug)),
    []
  );
  const addonCategories = useMemo(
    () => buildableCategories.filter((c) => !CORE_SLUGS.includes(c.slug)),
    []
  );

  const totals = useMemo(() => {
    let price = 0;
    let watts = 0;
    for (const [categorySlug, sel] of Object.entries(selections)) {
      const p = liveById.get(sel.productId) ?? getProduct(sel.productId);
      if (!p) continue;
      price += p.price * sel.qty;
      // The PSU's `wattage` is its rated *capacity*, not something it draws —
      // counting it here would inflate system draw every time a bigger PSU is picked.
      if (categorySlug !== "power-supply") {
        watts += (p.wattage ?? 0) * sel.qty;
      }
    }
    if (watts > 0) watts += 35;
    return { price, watts };
  }, [selections, liveById]);

  // ~20% headroom over draw, rounded up to the nearest 50W — matches how PSUs are actually sized.
  const recommendedPsu = useMemo(() => {
    if (totals.watts === 0) return 450;
    return Math.max(450, Math.ceil((totals.watts * 1.2) / 50) * 50);
  }, [totals.watts]);

  const compatibility = useMemo(() => {
    const issues: string[] = [];
    const pick = (slug: string) =>
      selections[slug] ? liveById.get(selections[slug].productId) ?? getProduct(selections[slug].productId) : undefined;
    const cpu = pick("processors");
    const mb = pick("motherboards");
    const ram = pick("memory");
    const psu = pick("power-supply");
    const gpu = pick("graphics-cards");

    if (cpu && mb) {
      const cpuIsIntel = cpu.brand.toLowerCase().includes("intel");
      const mbIsAmd = mb.name.toLowerCase().includes("b550") || mb.name.toLowerCase().includes("b650");
      const cpuIsAmd = cpu.brand.toLowerCase().includes("amd");
      const mbIsIntel = mb.name.toLowerCase().includes("h610") || mb.name.toLowerCase().includes("b760");
      if (cpuIsIntel && mbIsAmd) issues.push("Intel CPU ↔ AMD Motherboard — socket mismatch!");
      else if (cpuIsAmd && mbIsIntel) issues.push("AMD CPU ↔ Intel Motherboard — socket mismatch!");
    }
    if (ram && mb) {
      const ramDdr5 = ram.name.toLowerCase().includes("ddr5");
      const mbDdr4 = mb.name.toLowerCase().includes("b550") || mb.name.toLowerCase().includes("h610");
      const ramDdr4 = ram.name.toLowerCase().includes("ddr4");
      const mbDdr5 = mb.name.toLowerCase().includes("b650");
      if (ramDdr5 && mbDdr4) issues.push("DDR5 RAM ↔ DDR4 Motherboard — incompatible!");
      else if (ramDdr4 && mbDdr5) issues.push("DDR4 RAM ↔ DDR5 Motherboard — incompatible!");
    }
    if (psu && totals.watts > 0 && (psu.wattage || 0) < totals.watts) {
      issues.push(`PSU ${psu.wattage}W too low for ${totals.watts}W system draw!`);
    }
    if (cpu && cpu.name.includes("F") && !gpu) {
      issues.push(`${cpu.name} has no iGPU — add a GPU!`);
    }
    return { ok: issues.length === 0, issues };
  }, [selections, totals.watts, liveById]);

  function chooseProduct(categorySlug: string, productId: string) {
    setSelections((prev) => ({ ...prev, [categorySlug]: { productId, qty: 1 } }));
    setActivePickerCategory(null);
    const prod = resolveProduct(productId);
    showToast(`✓ ${prod?.name}`);
  }

  function clearProduct(categorySlug: string) {
    setSelections((prev) => {
      const next = { ...prev };
      delete next[categorySlug];
      return next;
    });
  }

  function loadPreset(id: string) {
    const preset = PRESET_BUILDS.find((p) => p.id === id);
    if (!preset) return;
    const newSel: Record<string, Selection> = {};
    for (const [cat, pid] of Object.entries(preset.parts)) newSel[cat] = { productId: pid, qty: 1 };
    setSelections(newSel);
    showToast(`✓ Loaded "${preset.title}"`);
  }

  function addAllToCart() {
    Object.values(selections).forEach((sel) => addToCart(sel.productId, sel.qty));
    setJustAddedAll(true);
    showToast(`✓ All ${Object.keys(selections).length} parts added to cart!`);
    setTimeout(() => setJustAddedAll(false), 2000);
  }

  // Swap the current PSU for the cheapest one that actually covers the
  // system's power draw — surfaced as a one-click fix on the compatibility warning.
  function applyRecommendedPsu() {
    const allPsus = catalogFor("power-supply");
    // Ideal: cheapest PSU that meets the recommended headroom.
    const ideal = allPsus
      .filter((p) => (p.wattage || 0) >= recommendedPsu)
      .sort((a, b) => a.price - b.price)[0];
    if (ideal) {
      chooseProduct("power-supply", ideal.id);
      return;
    }
    // Fallback: the highest-wattage PSU we stock, even if it's below the ideal headroom.
    const highest = [...allPsus].sort((a, b) => (b.wattage || 0) - (a.wattage || 0))[0];
    if (!highest) {
      showToast("No PSU in stock — please contact us on WhatsApp.");
      return;
    }
    chooseProduct("power-supply", highest.id);
    if ((highest.wattage || 0) < totals.watts) {
      showToast(`⚠ Our largest stocked PSU (${highest.wattage}W) is still tight for this build — ask us on WhatsApp.`);
    }
  }

  const selectedCount = Object.keys(selections).length;
  const psuTooLow = (() => {
    const psu = selections["power-supply"] ? resolveProduct(selections["power-supply"].productId) : undefined;
    return !!psu && totals.watts > 0 && (psu.wattage || 0) < totals.watts;
  })();

  const orderMessage = [
    `Hi ${STORE.name}, please quote this custom PC build:`,
    ...buildableCategories
      .filter((c) => selections[c.slug])
      .map((c) => {
        const p = resolveProduct(selections[c.slug].productId)!;
        return `• ${c.shortName}: ${p.name} — ${formatINR(p.price)}`;
      }),
    `Total: ${formatINR(totals.price)} | Estimated power draw: ${totals.watts}W`,
    "",
    "Please confirm stock, final pricing & delivery. Thank you!",
  ].join("\n");

  return (
    <div className="space-y-6 font-sans">
      {/* ── HERO ── */}
      <div className="relative bg-gradient-to-br from-[#1a0d0e] via-[#1d2535] to-[#0d1a1a] rounded-2xl p-6 sm:p-8 overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#D1121B]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-[#D1121B] text-white text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3">
              <BoltIcon className="w-3 h-3" /> PC Builder
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Build Your Dream Rig
            </h1>
            <p className="text-zinc-400 text-sm mt-1">Live compatibility checks · Instant WhatsApp quote</p>
          </div>

          {/* Stats pills */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-white/8 backdrop-blur rounded-xl px-4 py-3 text-center min-w-[80px]">
              <div className="text-xl font-black text-[#FFD700] font-mono">{totals.watts}W</div>
              <div className="text-[10px] text-zinc-400 uppercase font-bold">TDP</div>
            </div>
            <div className="bg-white/8 backdrop-blur rounded-xl px-4 py-3 text-center min-w-[80px]">
              <div className="text-xl font-black text-white font-mono">{selectedCount}/{buildableCategories.length}</div>
              <div className="text-[10px] text-zinc-400 uppercase font-bold">Parts</div>
            </div>
            <div className="bg-white/8 backdrop-blur rounded-xl px-4 py-3 text-center min-w-[80px]">
              <div className="text-lg font-black text-white">{formatINR(totals.price)}</div>
              <div className="text-[10px] text-emerald-400 uppercase font-bold">Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PRESET BUILDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PRESET_BUILDS.map((p) => (
          <button
            key={p.id}
            onClick={() => loadPreset(p.id)}
            className="group relative bg-white border border-[#E5E0D7] hover:border-transparent rounded-xl p-4 text-left transition-all hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${p.color} opacity-0 group-hover:opacity-8 transition-opacity`} />
            <div className="text-[11px] font-bold text-zinc-500 mb-1">{p.badge}</div>
            <div className="font-black text-sm text-zinc-900 group-hover:text-[#D1121B] transition-colors">{p.title}</div>
            <div className="text-[#D1121B] font-black text-base mt-1">{p.priceRange}</div>
            <div className="text-[10px] text-zinc-400 mt-2 font-bold uppercase tracking-wider">Load →</div>
          </button>
        ))}
      </div>

      {/* ── COMPATIBILITY BADGE ── */}
      {compatibility.ok ? (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-xs font-bold text-emerald-800">
          <CheckIcon className="w-4 h-4 text-emerald-600" /> All components compatible
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 space-y-2">
          {compatibility.issues.map((iss, i) => (
            <div key={i} className="flex items-start justify-between gap-3 text-xs text-red-700 font-semibold">
              <span className="flex items-start gap-2"><span className="font-black">!</span> {iss}</span>
              {iss.startsWith("PSU") && psuTooLow && (
                <button
                  onClick={applyRecommendedPsu}
                  className="shrink-0 px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white rounded-lg text-[10px] font-black uppercase tracking-wide"
                >
                  Auto-fix PSU
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── MAIN AREA ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Component slots — 8 cols */}
        <div className="lg:col-span-8 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Core Components</h2>
              <span className="text-[10px] font-bold text-zinc-400">
                {coreCategories.filter((c) => selections[c.slug]).length}/{coreCategories.length} selected
              </span>
            </div>
            {coreCategories.map((cat, idx) => (
              <CategoryRow
                key={cat.slug}
                cat={cat}
                idx={idx}
                product={selections[cat.slug] ? resolveProduct(selections[cat.slug].productId) : undefined}
                onPick={() => setActivePickerCategory(cat.slug)}
                onClear={() => clearProduct(cat.slug)}
              />
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Optional Add-ons</h2>
              <span className="text-[10px] font-bold text-zinc-400">
                {addonCategories.filter((c) => selections[c.slug]).length}/{addonCategories.length} selected
              </span>
            </div>
            {addonCategories.map((cat, idx) => (
              <CategoryRow
                key={cat.slug}
                cat={cat}
                idx={idx}
                product={selections[cat.slug] ? resolveProduct(selections[cat.slug].productId) : undefined}
                onPick={() => setActivePickerCategory(cat.slug)}
                onClear={() => clearProduct(cat.slug)}
              />
            ))}
          </div>
        </div>

        {/* Sticky summary — 4 cols */}
        <aside className="lg:col-span-4">
          <div className="bg-white border border-[#E5E0D7] rounded-2xl p-5 space-y-4 sticky top-24">
            {/* Totals */}
            <div>
              <div className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-1">Build Total</div>
              <div className="text-3xl font-black text-[#D1121B]">{formatINR(totals.price)}</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">{selectedCount} of {buildableCategories.length} parts · GST incl.</div>
            </div>

            {/* Wattage bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-zinc-700">
                <span>Power Draw</span>
                <span className="font-mono">{totals.watts}W</span>
              </div>
              <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-[#D1121B] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (totals.watts / 850) * 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-zinc-400">Recommended PSU: <strong>{recommendedPsu}W+</strong></div>
            </div>

            {/* Price breakdown */}
            <div className="border-t border-zinc-100 pt-3 space-y-1.5 text-xs text-zinc-500">
              <div className="flex justify-between">
                <span>Assembly & Testing</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={addAllToCart}
                disabled={selectedCount === 0}
                className={`w-full py-3 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
                  justAddedAll
                    ? "bg-emerald-600 text-white"
                    : "bg-[#D1121B] hover:bg-[#7A1118] text-white"
                } disabled:opacity-30`}
              >
                {justAddedAll ? (
                  <><CheckIcon className="w-4 h-4" /> Added!</>
                ) : (
                  <><BoltIcon className="w-4 h-4" /> Add All to Cart</>
                )}
              </button>

              <a
                href={selectedCount > 0 ? whatsappOrderLink(orderMessage) : undefined}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
                  selectedCount === 0 ? "pointer-events-none opacity-30" : ""
                }`}
              >
                <WhatsAppIcon className="w-4 h-4" /> WhatsApp Quote
              </a>

              <button
                onClick={() => setSelections({})}
                className="w-full text-center text-xs text-zinc-400 hover:text-red-500 py-1.5 font-bold transition-colors"
              >
                Reset All
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ── COMPONENT PICKER MODAL ── */}
      {activePickerCategory && (
        <ComponentPickerModal
          categorySlug={activePickerCategory}
          products={catalogFor(activePickerCategory)}
          loading={catalogLoading && !liveCatalog[activePickerCategory]}
          onClose={() => setActivePickerCategory(null)}
          onSelect={(pid) => chooseProduct(activePickerCategory, pid)}
          currentSelectionId={selections[activePickerCategory]?.productId}
        />
      )}
    </div>
  );
}

// ── Picker Modal ──────────────────────────────────────────────────────────────
// ── Component row (one build slot) ─────────────────────────────────────────────
function CategoryRow({
  cat,
  idx,
  product,
  onPick,
  onClear,
}: {
  cat: Category;
  idx: number;
  product: Product | undefined;
  onPick: () => void;
  onClear: () => void;
}) {
  const prod = product;
  const label = CAT_LABELS[cat.slug] ?? cat.shortName.slice(0, 4);

  return (
    <div
      className={`group flex items-center gap-3 rounded-xl border transition-all p-3 ${
        prod
          ? "bg-white border-[#E5E0D7] hover:border-[#D1121B]/40 hover:shadow-sm"
          : "bg-zinc-50 border-dashed border-zinc-300 hover:border-zinc-400"
      }`}
    >
      {/* Number + icon */}
      <div className="w-9 h-9 rounded-lg bg-[#FAF7F2] border border-zinc-200 flex flex-col items-center justify-center shrink-0">
        <span className="text-[9px] text-[#7A1118] font-black leading-none">{label}</span>
        <span className="text-[9px] text-zinc-400 font-bold leading-none mt-0.5">{idx + 1}</span>
      </div>

      {/* Category label */}
      <div className="w-24 shrink-0 hidden sm:block">
        <div className="text-[11px] font-black text-zinc-800 uppercase tracking-wide leading-tight">{cat.shortName}</div>
      </div>

      {/* Selected product OR empty */}
      {prod ? (
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-[#FAF7F2] rounded-lg border border-zinc-100 p-1 shrink-0 flex items-center justify-center">
            <ProductImage categorySlug={cat.slug} productId={prod.id} imageUrl={prod.imageUrl} className="w-full h-full object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-zinc-900 truncate">{prod.name}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-black text-[#D1121B]">{formatINR(prod.price)}</span>
              {prod.wattage && <span className="text-[10px] text-zinc-400">{prod.wattage}W</span>}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 text-xs text-zinc-400">
          <span className="sm:hidden font-semibold text-zinc-600">{cat.shortName} — </span>
          Click to select…
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {prod ? (
          <>
            <button
              onClick={onClear}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Remove"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onPick}
              className="px-3 py-1.5 text-[11px] font-bold border border-zinc-300 hover:border-[#D1121B] hover:text-[#D1121B] rounded-lg transition-colors uppercase tracking-wide"
            >
              Change
            </button>
          </>
        ) : (
          <button
            onClick={onPick}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#D1121B] hover:bg-[#7A1118] text-white text-[11px] font-bold rounded-lg transition-colors uppercase tracking-wide"
          >
            <PlusIcon className="w-3 h-3" />
            Select
          </button>
        )}
      </div>
    </div>
  );
}

function ComponentPickerModal({
  categorySlug,
  products,
  loading,
  onClose,
  onSelect,
  currentSelectionId,
}: {
  categorySlug: string;
  products: Product[];
  loading: boolean;
  onClose: () => void;
  onSelect: (productId: string) => void;
  currentSelectionId?: string;
}) {
  const [query, setQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [sortOrder, setSortOrder] = useState<"featured" | "price-asc" | "price-desc">("featured");

  // Suggestions come straight from the Supabase-backed catalog passed in — the
  // picker never shows a part that isn't actually in the store.
  const allProducts = products;
  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand))).sort(),
    [products]
  );

  const filtered = useMemo(() => {
    const list = allProducts.filter(
      (p) =>
        (selectedBrand === "all" || p.brand === selectedBrand) &&
        (query.trim() === "" ||
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase()) ||
          p.model.toLowerCase().includes(query.toLowerCase()))
    );
    if (sortOrder === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sortOrder === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [allProducts, selectedBrand, query, sortOrder]);

  const catName = buildableCategories.find((c) => c.slug === categorySlug)?.name || categorySlug;
  const catLabel = CAT_LABELS[categorySlug] ?? categorySlug.slice(0, 3).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-3xl sm:rounded-2xl rounded-t-2xl h-[90vh] sm:h-[82vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#7A1118]/10 border border-[#7A1118]/20 flex items-center justify-center">
              <span className="text-[10px] font-black text-[#7A1118]">{catLabel}</span>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-[#D1121B]">Select Part</div>
              <h2 className="text-base font-black text-zinc-900">{catName}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 transition-colors"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-4 py-3 border-b border-zinc-100 flex items-center gap-2 shrink-0">
          <div className="relative flex-1">
            <SearchIcon className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full pl-8 pr-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:border-[#D1121B] transition-colors"
            />
          </div>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-2 py-2 text-xs border border-zinc-200 rounded-lg bg-white font-bold focus:outline-none"
          >
            <option value="all">All ({allProducts.length})</option>
            {brands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "featured" | "price-asc" | "price-desc")}
            className="px-2 py-2 text-xs border border-zinc-200 rounded-lg bg-white font-bold focus:outline-none"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
          </select>
        </div>

        {/* Product list */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-50">
          {loading ? (
            <div className="py-20 text-center text-zinc-400 text-sm animate-pulse">
              Loading parts from catalog…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-zinc-400 text-sm">
              {allProducts.length === 0
                ? "No parts in this category yet."
                : "No results. Try a different search."}
            </div>
          ) : (
            filtered.map((prod) => {
              const isCurrent = prod.id === currentSelectionId;
              return (
                <div
                  key={prod.id}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    isCurrent ? "bg-emerald-50" : "hover:bg-zinc-50"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 bg-[#FAF7F2] rounded-lg border border-zinc-100 p-1 shrink-0 flex items-center justify-center">
                    <ProductImage categorySlug={categorySlug} productId={prod.id} imageUrl={prod.imageUrl} className="w-full h-full object-contain" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black text-[#7A1118] bg-red-50 px-1.5 py-0.5 rounded uppercase">
                        {prod.brand}
                      </span>
                      {prod.rating && (
                        <span className="text-[10px] text-amber-600 font-bold">{prod.rating} / 5</span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-zinc-900 truncate mt-0.5">{prod.name}</div>
                    {prod.specs && (
                      <div className="flex flex-wrap gap-x-2 mt-0.5 text-[10px] text-zinc-400">
                        {Object.entries(prod.specs).slice(0, 3).map(([k, v]) => (
                          <span key={k}><strong>{k}:</strong> {v}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price + action */}
                  <div className="text-right shrink-0 space-y-1">
                    <div className="text-sm font-black text-zinc-900">{formatINR(prod.price)}</div>
                    {prod.wattage && <div className="text-[10px] text-zinc-400">{prod.wattage}W</div>}
                    <button
                      onClick={() => onSelect(prod.id)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wide transition-all ${
                        isCurrent
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-[#1B1B1B] hover:bg-[#D1121B] text-white"
                      }`}
                    >
                      {isCurrent ? "✓ Current" : "Choose"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
