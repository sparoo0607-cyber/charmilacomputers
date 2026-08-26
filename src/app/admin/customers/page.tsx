"use client";

import { useMemo, useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { formatINR } from "@/lib/format";
import { SearchIcon } from "@/components/icons";

const SEGMENT_STYLES: Record<string, string> = {
  VIP: "bg-amber-50 text-amber-700 border-amber-200",
  Regular: "bg-sky-50 text-sky-700 border-sky-200",
  New: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

export default function AdminCustomersPage() {
  const { customers } = useAdmin();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return customers;
    const q = query.trim().toLowerCase();
    return customers.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  }, [customers, query]);

  const vipCount = customers.filter((c) => c.segment === "VIP").length;
  const totalLifetimeValue = customers.reduce((s, c) => s + c.totalSpent, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#E5E0D7] shadow-sm p-5">
          <p className="text-2xl font-extrabold tabular-nums">{customers.length}</p>
          <p className="text-xs font-bold text-zinc-500 mt-0.5">Total Customers</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E0D7] shadow-sm p-5">
          <p className="text-2xl font-extrabold tabular-nums text-amber-600">{vipCount}</p>
          <p className="text-xs font-bold text-zinc-500 mt-0.5">VIP Customers</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E0D7] shadow-sm p-5 col-span-2 sm:col-span-1">
          <p className="text-2xl font-extrabold tabular-nums">{formatINR(totalLifetimeValue)}</p>
          <p className="text-xs font-bold text-zinc-500 mt-0.5">Lifetime Value</p>
        </div>
      </div>

      <div className="relative max-w-xs">
        <SearchIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search customers…"
          className="w-full bg-white border border-[#E5E0D7] rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#D1121B]"
        />
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E0D7] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-zinc-500 border-b border-zinc-100">
                <th className="font-semibold px-5 py-3">Customer</th>
                <th className="font-semibold px-3 py-3">Location</th>
                <th className="font-semibold px-3 py-3 text-right">Orders</th>
                <th className="font-semibold px-3 py-3 text-right">Total Spent</th>
                <th className="font-semibold px-5 py-3">Segment</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-zinc-50 last:border-0 hover:bg-[#FAF7F2]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#7A1118] text-white font-bold grid place-items-center text-xs shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-800 line-clamp-1">{c.name}</p>
                        <p className="text-[11px] text-zinc-400 line-clamp-1">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-zinc-600 whitespace-nowrap">{c.city}, {c.state}</td>
                  <td className="px-3 py-3 text-right tabular-nums font-semibold">{c.ordersCount}</td>
                  <td className="px-3 py-3 text-right tabular-nums font-bold whitespace-nowrap">{formatINR(c.totalSpent)}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${SEGMENT_STYLES[c.segment]}`}>
                      {c.segment}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-sm text-zinc-400">
                    No customers match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
