"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShieldCheckIcon, CheckCircleIcon } from "@/components/icons";

export default function WarrantyRmaPage() {
  const { showToast } = useCart();
  const [filterBrand, setFilterBrand] = useState("");
  const [rmaSubmitted, setRmaSubmitted] = useState(false);

  const [rmaForm, setRmaForm] = useState({
    name: "",
    phone: "",
    orderId: "",
    brand: "Intel",
    serialNumber: "",
    issueDescription: "",
  });

  function handleRmaSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRmaSubmitted(true);
    showToast("✓ RMA Assistance Ticket created! Our service desk will reach out within 24 hours.");
  }

  const brandDirectory = [
    {
      brand: "Intel",
      warranty: "3 Years Limited Warranty",
      contact: "1800 425 8838",
      portal: "supporttickets.intel.com",
      servicePartner: "Kaizen Infoserve / Direct Intel India",
    },
    {
      brand: "AMD",
      warranty: "3 Years Boxed Processor Warranty",
      contact: "1800 425 6664",
      portal: "amd.com/en/support/warranty",
      servicePartner: "Rashi Peripherals / Redington",
    },
    {
      brand: "ASUS",
      warranty: "3 Years Motherboards & GPUs",
      contact: "1800 209 0365",
      portal: "asus.com/in/support",
      servicePartner: "F1 Info Solutions / ASUS Exclusive Centers",
    },
    {
      brand: "MSI",
      warranty: "3 Years Component Warranty",
      contact: "022 4912 5588",
      portal: "in.msi.com/page/service-location",
      servicePartner: "Kaizen Infoserve Pan-India",
    },
    {
      brand: "Gigabyte",
      warranty: "3 Years Brand Warranty",
      contact: "1800 220 966",
      portal: "gigabyte.com/in/Support",
      servicePartner: "Gigabyte Authorised RMA Hubs",
    },
    {
      brand: "Corsair",
      warranty: "3 to 10 Years (RAM: Lifetime / SMPS: 5-10 Yrs)",
      contact: "1800 425 5464",
      portal: "corsair.com/support",
      servicePartner: "Kaizen Infoserve",
    },
    {
      brand: "Western Digital",
      warranty: "3 to 5 Years Warranty",
      contact: "1800 200 5789",
      portal: "support.wdc.com",
      servicePartner: "Flextronics / WD Direct Doorstep Pickup",
    },
    {
      brand: "Samsung",
      warranty: "5 Years SSD Warranty",
      contact: "1800 407 267 864",
      portal: "samsung.com/in/support",
      servicePartner: "Samsung Authorized Service Centers",
    },
  ];

  const visibleBrands = brandDirectory.filter(
    (b) =>
      b.brand.toLowerCase().includes(filterBrand.toLowerCase()) ||
      b.servicePartner.toLowerCase().includes(filterBrand.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-8 font-sans">
      {/* Breadcrumb */}
      <nav className="text-xs text-zinc-500 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-[#D1121B]">Home</Link>
        <span>/</span>
        <span className="text-[#1B1B1B] font-bold">Warranty &amp; RMA Center</span>
      </nav>

      {/* Header Hero */}
      <div className="bg-gradient-to-r from-[#263844] via-[#1D2B34] to-[#7A1118] text-white p-8 sm:p-12 rounded-3xl border border-[#C89B3C]/50 shadow-xl mb-12">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-amber-300 flex items-center gap-1">
            <ShieldCheckIcon className="w-4 h-4" /> Official Brand Warranty Guarantee
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Warranty Directory &amp; RMA Assistance
          </h1>
          <p className="text-xs sm:text-sm text-zinc-200">
            Every product sold at Charmila Computers is covered by manufacturer warranty valid across India. Need help with a claim? Use our direct support directory or request RMA assistance below.
          </p>
        </div>
      </div>

      {/* Policy Highlights Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
        <div className="bg-white p-6 rounded-2xl border border-[#E5E0D7] shadow-2xs space-y-2">
          <span className="w-8 h-8 rounded-full bg-red-50 text-[#D1121B] font-bold text-sm grid place-items-center mb-1">
            1
          </span>
          <h3 className="font-extrabold text-sm text-[#1B1B1B]">7 Days Replacement</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            In the rare event of Dead-on-Arrival (DOA) or shipping damage, we provide an immediate direct replacement from our warehouse within 7 days of delivery.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E5E0D7] shadow-2xs space-y-2">
          <span className="w-8 h-8 rounded-full bg-red-50 text-[#D1121B] font-bold text-sm grid place-items-center mb-1">
            2
          </span>
          <h3 className="font-extrabold text-sm text-[#1B1B1B]">Pan-India Brand Centers</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Carry your tax invoice to any authorized service center (ASUS, MSI, Gigabyte, Intel, AMD, Corsair) in any city in India for free hardware servicing or replacement.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E5E0D7] shadow-2xs space-y-2">
          <span className="w-8 h-8 rounded-full bg-red-50 text-[#D1121B] font-bold text-sm grid place-items-center mb-1">
            3
          </span>
          <h3 className="font-extrabold text-sm text-[#1B1B1B]">Charmila RMA Concierge</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Live outside metro cities or need our lab to diagnose the faulty component? Ship it to our central service bench and our team will coordinate the RMA for you.
          </p>
        </div>
      </div>

      {/* Brand Warranty Directory */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E0D7] shadow-sm mb-14 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-[#1B1B1B]">Brand-Wise Official RMA Portals &amp; Helplines</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Toll-free customer care and service partner details.</p>
          </div>
          <div className="relative sm:w-72">
            <input
              type="text"
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              placeholder="Filter brand (e.g. ASUS, MSI)..."
              className="w-full px-3.5 py-2 border border-zinc-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#7A1118]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-[#FAF7F2] font-bold text-zinc-700 uppercase">
                <th className="p-3.5 rounded-l-xl">Brand</th>
                <th className="p-3.5">Warranty Period</th>
                <th className="p-3.5">Toll-Free Helpline</th>
                <th className="p-3.5">Authorized Service Partner</th>
                <th className="p-3.5 rounded-r-xl text-right">RMA Portal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {visibleBrands.map((b, idx) => (
                <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                  <td className="p-3.5 font-extrabold text-zinc-900 text-sm">{b.brand}</td>
                  <td className="p-3.5 text-zinc-600 font-semibold">{b.warranty}</td>
                  <td className="p-3.5 font-mono font-bold text-[#7A1118]">{b.contact}</td>
                  <td className="p-3.5 text-zinc-600">{b.servicePartner}</td>
                  <td className="p-3.5 text-right">
                    <span className="text-xs font-bold text-[#D1121B] hover:underline cursor-pointer">
                      {b.portal}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* RMA Assistance Request Form */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E0D7] shadow-sm mb-14 space-y-6">
        <h2 className="text-xl font-black text-[#1B1B1B]">Submit Charmila RMA Assistance Ticket</h2>
        <p className="text-xs text-zinc-500">
          Our service lab will verify your serial number, test the hardware on our benchmark station, and manage the replacement process with the brand.
        </p>

        {rmaSubmitted ? (
          <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
            <CheckCircleIcon className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold text-emerald-950">RMA Assistance Ticket Created!</h3>
            <p className="text-xs text-emerald-800 max-w-md mx-auto">
              Our hardware technician will contact you at <strong>{rmaForm.phone}</strong> with shipping instructions and a doorstep pickup label.
            </p>
            <button
              onClick={() => setRmaSubmitted(false)}
              className="mt-2 text-xs font-bold text-[#7A1118] underline"
            >
              Submit another ticket
            </button>
          </div>
        ) : (
          <form onSubmit={handleRmaSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={rmaForm.name}
                  onChange={(e) => setRmaForm({ ...rmaForm, name: e.target.value })}
                  placeholder="Srikanth Reddy"
                  className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl font-medium focus:border-[#7A1118] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={rmaForm.phone}
                  onChange={(e) => setRmaForm({ ...rmaForm, phone: e.target.value })}
                  placeholder="+91 98480 XXXXX"
                  className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl font-medium focus:border-[#7A1118] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Order ID / Invoice No. *</label>
                <input
                  type="text"
                  required
                  value={rmaForm.orderId}
                  onChange={(e) => setRmaForm({ ...rmaForm, orderId: e.target.value })}
                  placeholder="CC-2026-XXXXX"
                  className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl uppercase font-bold focus:border-[#7A1118] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Component Brand *</label>
                <select
                  value={rmaForm.brand}
                  onChange={(e) => setRmaForm({ ...rmaForm, brand: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl font-bold bg-white focus:border-[#7A1118] focus:outline-none"
                >
                  {brandDirectory.map((b) => (
                    <option key={b.brand}>{b.brand}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Product Serial Number (from box/sticker) *</label>
                <input
                  type="text"
                  required
                  value={rmaForm.serialNumber}
                  onChange={(e) => setRmaForm({ ...rmaForm, serialNumber: e.target.value })}
                  placeholder="e.g. SN24098192801"
                  className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl font-mono uppercase font-bold focus:border-[#7A1118] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 mb-1">Fault / Issue Description *</label>
              <textarea
                rows={3}
                required
                value={rmaForm.issueDescription}
                onChange={(e) => setRmaForm({ ...rmaForm, issueDescription: e.target.value })}
                placeholder="Describe what happened: e.g. No display output on HDMI, fan rattling sound, memory bluescreen error code..."
                className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl font-medium focus:border-[#7A1118] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#D1121B] hover:bg-[#7A1118] text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-98"
            >
              Submit RMA Assistance Ticket →
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
