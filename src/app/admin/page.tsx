"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAdmin } from "@/context/AdminContext";
import { formatINR } from "@/lib/format";
import {
  ChartBarIcon,
  ClipboardListIcon,
  PackageIcon,
  UsersIcon,
  WarningIcon,
  ChevronRightIcon,
} from "@/components/icons";

const STATUS_STYLES: Record<string, string> = {
  Processing: "bg-amber-50 text-amber-700 border-amber-200",
  Packed: "bg-sky-50 text-sky-700 border-sky-200",
  Shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Out for Delivery": "bg-violet-50 text-violet-700 border-violet-200",
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminDashboardPage() {
  const { adminOrders, adminProducts, customers, settings } = useAdmin();

  const stats = useMemo(() => {
    const validOrders = adminOrders.filter((o) => o.status !== "Cancelled");
    const revenue = validOrders.reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue = validOrders.length ? Math.round(revenue / validOrders.length) : 0;
    const pendingOrders = adminOrders.filter((o) => !["Delivered", "Cancelled"].includes(o.status)).length;
    return { revenue, avgOrderValue, pendingOrders, orderCount: adminOrders.length };
  }, [adminOrders]);

  const lowStock = useMemo(
    () => adminProducts.filter((p) => p.inStock && p.stockQty <= settings.lowStockThreshold).slice(0, 6),
    [adminProducts, settings.lowStockThreshold]
  );

  const outOfStock = useMemo(() => adminProducts.filter((p) => !p.inStock).length, [adminProducts]);

  const recentOrders = useMemo(() => adminOrders.slice(0, 6), [adminOrders]);

  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const o of adminOrders) counts[o.status] = (counts[o.status] || 0) + 1;
    return counts;
  }, [adminOrders]);

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<ChartBarIcon className="w-5 h-5" />}
          label="Total Revenue"
          value={formatINR(stats.revenue)}
          sub={`${adminOrders.length} orders lifetime`}
          accent="text-[#D1121B]"
        />
        <StatCard
          icon={<ClipboardListIcon className="w-5 h-5" />}
          label="Pending Orders"
          value={String(stats.pendingOrders)}
          sub="Awaiting fulfilment"
          accent="text-amber-600"
        />
        <StatCard
          icon={<PackageIcon className="w-5 h-5" />}
          label="Catalog Size"
          value={String(adminProducts.length)}
          sub={`${outOfStock} out of stock`}
          accent="text-sky-600"
        />
        <StatCard
          icon={<UsersIcon className="w-5 h-5" />}
          label="Customers"
          value={String(customers.length)}
          sub={`Avg order ${formatINR(stats.avgOrderValue)}`}
          accent="text-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E0D7] shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
            <h2 className="font-bold text-sm">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs font-bold text-[#D1121B] hover:underline flex items-center gap-1">
              View all <ChevronRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-zinc-500 border-b border-zinc-100">
                  <th className="font-semibold px-6 py-2.5">Order</th>
                  <th className="font-semibold px-3 py-2.5">Customer</th>
                  <th className="font-semibold px-3 py-2.5">Status</th>
                  <th className="font-semibold px-6 py-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-xs text-zinc-400 font-medium">
                      No customer orders yet — catalog and PC builder inquiries mode.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-zinc-50 last:border-0 hover:bg-[#FAF7F2]">
                      <td className="px-6 py-3 font-mono text-xs font-bold">{o.id}</td>
                      <td className="px-3 py-3">
                        <p className="font-semibold text-zinc-800">{o.customerName}</p>
                        <p className="text-[11px] text-zinc-400">{o.city}</p>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-block text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${STATUS_STYLES[o.status]}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right font-bold tabular-nums">{formatINR(o.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order status breakdown + low stock */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E5E0D7] shadow-sm p-6">
            <h2 className="font-bold text-sm mb-4">Order Status</h2>
            <div className="space-y-2.5">
              {Object.entries(statusBreakdown).map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-xs text-zinc-600 w-32 shrink-0">{status}</span>
                  <div className="flex-1 h-2 rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#D1121B]"
                      style={{ width: `${(count / adminOrders.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold tabular-nums w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6">
            <h2 className="font-bold text-sm mb-4 flex items-center gap-2 text-amber-700">
              <WarningIcon className="w-4 h-4" /> Low Stock Alerts
            </h2>
            {lowStock.length === 0 ? (
              <p className="text-xs text-zinc-500">All products are well stocked.</p>
            ) : (
              <div className="space-y-3">
                {lowStock.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-zinc-800 line-clamp-1">{p.name}</span>
                    <span className="font-mono font-bold text-amber-700 shrink-0">{p.stockQty} left</span>
                  </div>
                ))}
              </div>
            )}
            <Link href="/admin/products" className="text-xs font-bold text-[#D1121B] hover:underline mt-4 inline-flex items-center gap-1">
              Manage inventory <ChevronRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
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
