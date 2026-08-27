"use client";

import { useMemo, useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { SearchIcon } from "@/components/icons";

function joined(dateStr: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminUsersPage() {
  const { siteUsers } = useAdmin();
  const [query, setQuery] = useState("");
  const [now] = useState(() => Date.now());

  const joinedLast30 = useMemo(
    () =>
      siteUsers.filter((u) => {
        const d = new Date(u.joinedAt).getTime();
        return d && now - d < 30 * 864e5;
      }).length,
    [siteUsers, now]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return siteUsers;
    const q = query.trim().toLowerCase();
    return siteUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q)
    );
  }, [siteUsers, query]);

  const withPhone = siteUsers.filter((u) => u.phone !== "—").length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#E5E0D7] shadow-sm p-5">
          <p className="text-2xl font-extrabold tabular-nums">{siteUsers.length}</p>
          <p className="text-xs font-bold text-zinc-500 mt-0.5">Registered Users</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E0D7] shadow-sm p-5">
          <p className="text-2xl font-extrabold tabular-nums text-emerald-600">{withPhone}</p>
          <p className="text-xs font-bold text-zinc-500 mt-0.5">With Mobile Number</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E0D7] shadow-sm p-5 col-span-2 sm:col-span-1">
          <p className="text-2xl font-extrabold tabular-nums">{joinedLast30}</p>
          <p className="text-xs font-bold text-zinc-500 mt-0.5">Joined (30 days)</p>
        </div>
      </div>

      <div className="relative max-w-xs">
        <SearchIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, mobile…"
          className="w-full bg-white border border-[#E5E0D7] rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#D1121B]"
        />
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E0D7] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-zinc-500 border-b border-zinc-100">
                <th className="font-semibold px-5 py-3">Name</th>
                <th className="font-semibold px-3 py-3">Mobile</th>
                <th className="font-semibold px-3 py-3">Email</th>
                <th className="font-semibold px-5 py-3 whitespace-nowrap">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-zinc-50 last:border-0 hover:bg-[#FAF7F2]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#7A1118] text-white font-bold grid place-items-center text-xs shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-semibold text-zinc-800 line-clamp-1">{u.name}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3 tabular-nums text-zinc-700 whitespace-nowrap">{u.phone}</td>
                  <td className="px-3 py-3 text-zinc-600">
                    <span className="line-clamp-1">{u.email}</span>
                  </td>
                  <td className="px-5 py-3 text-xs text-zinc-500 whitespace-nowrap">{joined(u.joinedAt)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-sm text-zinc-400">
                    {siteUsers.length === 0
                      ? "No registered users yet — or run supabase/analytics_setup.sql to enable this view."
                      : "No users match your search."}
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
