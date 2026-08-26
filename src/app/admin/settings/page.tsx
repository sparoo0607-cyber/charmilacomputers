"use client";

import { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { WarningIcon } from "@/components/icons";

export default function AdminSettingsPage() {
  const { settings, updateSettings, restoreDefaults } = useAdmin();
  const [form, setForm] = useState(settings);
  const [confirmReset, setConfirmReset] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateSettings(form);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[#E5E0D7] shadow-sm p-6 sm:p-7 space-y-6">
        <div>
          <h2 className="font-bold text-base mb-1">Store Details</h2>
          <p className="text-xs text-zinc-500">Shown across invoices, order confirmations, and support contact.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Store Name">
            <input
              value={form.storeName}
              onChange={(e) => setForm({ ...form, storeName: e.target.value })}
              className="w-full border border-[#E5E0D7] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#D1121B]"
            />
          </Field>
          <Field label="GSTIN">
            <input
              value={form.gstin}
              onChange={(e) => setForm({ ...form, gstin: e.target.value })}
              className="w-full border border-[#E5E0D7] rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:border-[#D1121B]"
            />
          </Field>
          <Field label="Support Email">
            <input
              type="email"
              value={form.supportEmail}
              onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
              className="w-full border border-[#E5E0D7] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#D1121B]"
            />
          </Field>
          <Field label="Support Phone">
            <input
              value={form.supportPhone}
              onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
              className="w-full border border-[#E5E0D7] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#D1121B]"
            />
          </Field>
        </div>

        <div className="h-px bg-zinc-100" />

        <div>
          <h2 className="font-bold text-base mb-1">Shipping &amp; Tax</h2>
          <p className="text-xs text-zinc-500">Drives the free-shipping banner and checkout totals.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Free Shipping Over (₹)">
            <input
              type="number"
              min="0"
              value={form.freeShippingThreshold}
              onChange={(e) => setForm({ ...form, freeShippingThreshold: Number(e.target.value) })}
              className="w-full border border-[#E5E0D7] rounded-xl px-3.5 py-2.5 text-sm tabular-nums focus:outline-none focus:border-[#D1121B]"
            />
          </Field>
          <Field label="Standard Shipping Fee (₹)">
            <input
              type="number"
              min="0"
              value={form.standardShippingFee}
              onChange={(e) => setForm({ ...form, standardShippingFee: Number(e.target.value) })}
              className="w-full border border-[#E5E0D7] rounded-xl px-3.5 py-2.5 text-sm tabular-nums focus:outline-none focus:border-[#D1121B]"
            />
          </Field>
          <Field label="Tax Rate (%)">
            <input
              type="number"
              min="0"
              max="100"
              value={form.taxPercent}
              onChange={(e) => setForm({ ...form, taxPercent: Number(e.target.value) })}
              className="w-full border border-[#E5E0D7] rounded-xl px-3.5 py-2.5 text-sm tabular-nums focus:outline-none focus:border-[#D1121B]"
            />
          </Field>
        </div>

        <div className="h-px bg-zinc-100" />

        <div>
          <h2 className="font-bold text-base mb-1">Inventory</h2>
          <p className="text-xs text-zinc-500">Controls the low-stock alert threshold on the dashboard.</p>
        </div>

        <Field label="Low Stock Threshold (units)">
          <input
            type="number"
            min="0"
            value={form.lowStockThreshold}
            onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })}
            className="w-full sm:w-48 border border-[#E5E0D7] rounded-xl px-3.5 py-2.5 text-sm tabular-nums focus:outline-none focus:border-[#D1121B]"
          />
        </Field>

        <div className="h-px bg-zinc-100" />

        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.maintenanceMode}
            onChange={(e) => setForm({ ...form, maintenanceMode: e.target.checked })}
            className="w-4 h-4 mt-0.5 accent-[#D1121B]"
          />
          <span>
            <span className="block text-sm font-bold text-zinc-800">Maintenance Mode</span>
            <span className="block text-xs text-zinc-500">Flag only — wiring this to actually gate the storefront is a follow-up task.</span>
          </span>
        </label>

        <button
          type="submit"
          className="bg-[#D1121B] hover:bg-[#7A1118] text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-sm"
        >
          Save Settings
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 sm:p-7">
        <h2 className="font-bold text-base mb-1 text-red-700">Danger Zone</h2>
        <p className="text-xs text-zinc-500 mb-4">
          Undo every product added, edited, or removed from this browser and restore the original catalog.
        </p>
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-sm px-4 py-2.5 rounded-xl transition-colors border border-red-200"
          >
            <WarningIcon className="w-4 h-4" /> Reset Product Catalog
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold text-zinc-700">Are you sure? This can&apos;t be undone.</p>
            <button
              onClick={() => {
                restoreDefaults();
                setConfirmReset(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-4 py-2 rounded-xl transition-colors"
            >
              Yes, Reset
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-sm px-4 py-2 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-zinc-600 uppercase tracking-wide mb-1.5">{label}</span>
      {children}
    </label>
  );
}
