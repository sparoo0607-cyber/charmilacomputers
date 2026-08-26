"use client";

import { useMemo, useState } from "react";
import { AdminOrder, AdminOrderStatus, useAdmin } from "@/context/AdminContext";
import { formatINR } from "@/lib/format";
import { SearchIcon, CloseIcon, ChevronRightIcon } from "@/components/icons";

const STATUSES: AdminOrderStatus[] = ["Processing", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];

const STATUS_STYLES: Record<string, string> = {
  Processing: "bg-amber-50 text-amber-700 border-amber-200",
  Packed: "bg-sky-50 text-sky-700 border-sky-200",
  Shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Out for Delivery": "bg-violet-50 text-violet-700 border-violet-200",
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminOrdersPage() {
  const { adminOrders, updateOrderStatus } = useAdmin();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<AdminOrder | null>(null);

  const filtered = useMemo(() => {
    let list = adminOrders;
    if (statusFilter !== "all") list = list.filter((o) => o.status === statusFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((o) => o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q));
    }
    return list;
  }, [adminOrders, statusFilter, query]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <SearchIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order ID or customer…"
            className="w-full bg-white border border-[#E5E0D7] rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#D1121B]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-[#E5E0D7] rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-[#D1121B]"
        >
          <option value="all">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <p className="text-xs text-zinc-500 ml-auto">
          {filtered.length} of {adminOrders.length} orders
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E0D7] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-zinc-500 border-b border-zinc-100">
                <th className="font-semibold px-5 py-3">Order</th>
                <th className="font-semibold px-3 py-3">Customer</th>
                <th className="font-semibold px-3 py-3">Date</th>
                <th className="font-semibold px-3 py-3">Payment</th>
                <th className="font-semibold px-3 py-3">Status</th>
                <th className="font-semibold px-5 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setSelected(o)}
                  className="border-b border-zinc-50 last:border-0 hover:bg-[#FAF7F2] cursor-pointer"
                >
                  <td className="px-5 py-3 font-mono text-xs font-bold">{o.id}</td>
                  <td className="px-3 py-3">
                    <p className="font-semibold text-zinc-800">{o.customerName}</p>
                    <p className="text-[11px] text-zinc-400">{o.city}, {o.state}</p>
                  </td>
                  <td className="px-3 py-3 text-xs text-zinc-600 whitespace-nowrap">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-3 py-3 text-xs text-zinc-600 whitespace-nowrap">{o.paymentMethod}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-block text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${STATUS_STYLES[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-bold tabular-nums whitespace-nowrap">{formatINR(o.total)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-sm text-zinc-400">
                    No orders match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={() => setSelected(null)}>
          <div
            className="bg-white w-full max-w-md h-full shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-zinc-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <p className="font-mono text-xs text-zinc-400">{selected.id}</p>
                <h3 className="font-bold text-base">{selected.customerName}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500">
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2">Order Status</label>
                <select
                  value={selected.status}
                  onChange={(e) => {
                    const status = e.target.value as AdminOrderStatus;
                    updateOrderStatus(selected.id, status);
                    setSelected({ ...selected, status });
                  }}
                  className="w-full border border-[#E5E0D7] rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#D1121B]"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[11px] font-bold text-zinc-400 uppercase mb-1">Email</p>
                  <p className="font-medium truncate">{selected.customerEmail}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-zinc-400 uppercase mb-1">Phone</p>
                  <p className="font-medium">{selected.customerPhone}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-zinc-400 uppercase mb-1">Location</p>
                  <p className="font-medium">{selected.city}, {selected.state}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-zinc-400 uppercase mb-1">Payment</p>
                  <p className="font-medium">{selected.paymentMethod} · {selected.paymentStatus}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2">
                  Items ({selected.items.length})
                </p>
                <div className="divide-y divide-zinc-100 border border-zinc-100 rounded-xl overflow-hidden">
                  {selected.items.map((it, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                      <div className="min-w-0 pr-3">
                        <p className="font-semibold line-clamp-1">{it.name}</p>
                        <p className="text-[11px] text-zinc-400">Qty: {it.qty} × {formatINR(it.price)}</p>
                      </div>
                      <p className="font-bold tabular-nums shrink-0">{formatINR(it.price * it.qty)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-100 pt-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatINR(selected.subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Shipping</span>
                  <span className="tabular-nums">{selected.shippingFee === 0 ? "FREE" : formatINR(selected.shippingFee)}</span>
                </div>
                {selected.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span className="tabular-nums">-{formatINR(selected.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-base pt-2 border-t border-zinc-100 mt-2">
                  <span>Total</span>
                  <span className="tabular-nums">{formatINR(selected.total)}</span>
                </div>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="w-full flex items-center justify-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-sm py-2.5 rounded-xl transition-colors"
              >
                Close <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
