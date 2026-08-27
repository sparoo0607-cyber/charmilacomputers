"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { categories } from "@/data/categories";
import {
  ChartBarIcon,
  PackageIcon,
  UsersIcon,
  ChevronRightIcon,
} from "@/components/icons";

const DAY = 864e5;

function EyeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function AdminDashboardPage() {
  const { pageViews, siteUsers, adminProducts, analyticsLoading } = useAdmin();
  // Captured once on mount so the render stays pure and the windows are stable.
  const [now] = useState(() => Date.now());

  const catName = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of categories) m.set(c.slug, c.name);
    return m;
  }, []);
  const productName = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of adminProducts) m.set(p.id, p.name);
    return m;
  }, [adminProducts]);

  const stats = useMemo(() => {
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const visitorsInWindow = (ms: number) => {
      const cutoff = now - ms;
      const set = new Set<string>();
      for (const v of pageViews) {
        if (new Date(v.createdAt).getTime() >= cutoff) set.add(v.visitorId || `row-${v.id}`);
      }
      return set.size;
    };

    const todaySet = new Set<string>();
    let viewsToday = 0;
    for (const v of pageViews) {
      if (new Date(v.createdAt).getTime() >= startOfToday.getTime()) {
        todaySet.add(v.visitorId || `row-${v.id}`);
        viewsToday++;
      }
    }

    // Daily unique-visitor series, last 14 days (oldest → newest).
    const series: { label: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setHours(0, 0, 0, 0);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = dayStart.getTime() + DAY;
      const set = new Set<string>();
      for (const v of pageViews) {
        const t = new Date(v.createdAt).getTime();
        if (t >= dayStart.getTime() && t < dayEnd) set.add(v.visitorId || `row-${v.id}`);
      }
      series.push({
        label: dayStart.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        count: set.size,
      });
    }

    const rank = (kind: "category" | "product", ms: number) => {
      const cutoff = now - ms;
      const counts = new Map<string, number>();
      for (const v of pageViews) {
        if (v.kind !== kind || !v.slug) continue;
        if (new Date(v.createdAt).getTime() < cutoff) continue;
        counts.set(v.slug, (counts.get(v.slug) || 0) + 1);
      }
      return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    };

    return {
      visitorsToday: todaySet.size,
      viewsToday,
      visitors7d: visitorsInWindow(7 * DAY),
      visitors30d: visitorsInWindow(30 * DAY),
      series,
      topCategories: rank("category", 7 * DAY),
      topProducts: rank("product", 7 * DAY),
    };
  }, [pageViews, now]);

  const maxDaily = Math.max(1, ...stats.series.map((d) => d.count));
  const recentUsers = siteUsers.slice(0, 6);
  const notWired = !analyticsLoading && pageViews.length === 0;

  return (
    <div className="space-y-8">
      {notWired && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          <strong className="font-bold">Analytics not live yet.</strong> Run{" "}
          <code className="font-mono text-[13px] bg-amber-100 px-1 rounded">supabase/analytics_setup.sql</code>{" "}
          in the Supabase SQL editor, then page views and the Users list will populate here.
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<EyeIcon className="w-5 h-5" />}
          label="Visitors Today"
          value={String(stats.visitorsToday)}
          sub={`${stats.viewsToday} page views today`}
          accent="text-[#D1121B]"
        />
        <StatCard
          icon={<ChartBarIcon className="w-5 h-5" />}
          label="Visitors (7 days)"
          value={String(stats.visitors7d)}
          sub={`${stats.visitors30d} in last 30 days`}
          accent="text-amber-600"
        />
        <StatCard
          icon={<UsersIcon className="w-5 h-5" />}
          label="Registered Users"
          value={String(siteUsers.length)}
          sub="Signed-in accounts"
          accent="text-emerald-600"
        />
        <StatCard
          icon={<PackageIcon className="w-5 h-5" />}
          label="Catalog Size"
          value={String(adminProducts.length)}
          sub={`${adminProducts.filter((p) => !p.inStock).length} out of stock`}
          accent="text-sky-600"
        />
      </div>

      {/* Daily visitors */}
      <div className="bg-white rounded-2xl border border-[#E5E0D7] shadow-sm p-6">
        <h2 className="font-bold text-sm mb-5">Daily Visitors · Last 14 Days</h2>
        <div className="flex items-end gap-1.5 h-40">
          {stats.series.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full rounded-t bg-[#D1121B]/85 group-hover:bg-[#D1121B] transition-all min-h-[2px]"
                  style={{ height: `${(d.count / maxDaily) * 100}%` }}
                  title={`${d.count} visitor${d.count === 1 ? "" : "s"}`}
                />
              </div>
              <span className="text-[9px] text-zinc-400 font-medium tabular-nums">{d.count}</span>
              <span className="text-[8px] text-zinc-400 leading-none text-center hidden sm:block">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top categories + products */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <RankPanel
            title="Top Categories · 7 days"
            rows={stats.topCategories.map(([slug, n]) => ({
              key: slug,
              label: catName.get(slug) || slug,
              href: `/category/${slug}`,
              count: n,
            }))}
          />
          <RankPanel
            title="Top Products · 7 days"
            rows={stats.topProducts.map(([id, n]) => ({
              key: id,
              label: productName.get(id) || id,
              href: `/product/${id}`,
              count: n,
            }))}
          />
        </div>

        {/* Recent users + shortcuts */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E5E0D7] shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <h2 className="font-bold text-sm">Recent Sign-ups</h2>
              <Link href="/admin/users" className="text-xs font-bold text-[#D1121B] hover:underline flex items-center gap-1">
                View all <ChevronRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-zinc-50">
              {recentUsers.length === 0 ? (
                <p className="px-6 py-8 text-center text-xs text-zinc-400">No registered users yet.</p>
              ) : (
                recentUsers.map((u) => (
                  <div key={u.id} className="px-6 py-3">
                    <p className="font-semibold text-zinc-800 text-sm line-clamp-1">{u.name}</p>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">
                      {u.phone !== "—" ? `${u.phone} · ` : ""}{u.email}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E0D7] shadow-sm p-6 space-y-2">
            <h2 className="font-bold text-sm mb-3">Storefront Settings</h2>
            <Link href="/admin/banners" className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-zinc-100 text-sm font-semibold transition-colors">
              Banners <ChevronRightIcon className="w-4 h-4 text-zinc-400" />
            </Link>
            <Link href="/admin/themes" className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-zinc-100 text-sm font-semibold transition-colors">
              Themes <ChevronRightIcon className="w-4 h-4 text-zinc-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function RankPanel({
  title,
  rows,
}: {
  title: string;
  rows: { key: string; label: string; href: string; count: number }[];
}) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D7] shadow-sm p-6">
      <h2 className="font-bold text-sm mb-4">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-xs text-zinc-400">No views recorded in this window yet.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <Link key={r.key} href={r.href} className="block group">
              <div className="flex items-center justify-between gap-3 text-xs mb-1">
                <span className="font-semibold text-zinc-700 line-clamp-1 group-hover:text-[#D1121B]">{r.label}</span>
                <span className="font-bold tabular-nums text-zinc-500 shrink-0">{r.count}</span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                <div className="h-full rounded-full bg-[#D1121B]" style={{ width: `${(r.count / max) * 100}%` }} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D7] shadow-sm p-5">
      <div className={`w-9 h-9 rounded-xl bg-[#FAF7F2] grid place-items-center mb-3 ${accent}`}>{icon}</div>
      <p className="text-2xl font-extrabold tracking-tight tabular-nums">{value}</p>
      <p className="text-xs font-bold text-zinc-500 mt-0.5">{label}</p>
      <p className="text-[11px] text-zinc-400 mt-1">{sub}</p>
    </div>
  );
}
