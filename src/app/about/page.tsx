import Link from "next/link";
import type { Metadata } from "next";
import { STORE } from "@/lib/format";
import { ShieldCheckIcon, TruckIcon, BoltIcon, ComputerIcon, WhatsAppIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Charmila Computers — India's authorized destination for genuine PC hardware, custom builds and expert service, backed by manufacturer warranty pan-India.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const pillars = [
    {
      icon: <ShieldCheckIcon className="w-8 h-8 text-[#D1121B]" />,
      title: "100% Genuine & Brand Sealed",
      description: "Direct authorized partnership with Intel, AMD, NVIDIA, ASUS, MSI, Gigabyte, Corsair, Western Digital and Kingston. Every product carries official manufacturer warranty valid pan-India.",
    },
    {
      icon: <ComputerIcon className="w-8 h-8 text-[#D1121B]" />,
      title: "360° Stress Tested Custom Rigs",
      description: "Every custom PC built at our service lab undergoes a rigorous 24-hour thermal, memory, and GPU stability stress test with optimal BIOS configuration before dispatch.",
    },
    {
      icon: <TruckIcon className="w-8 h-8 text-[#D1121B]" />,
      title: "Insured Pan-India Express Delivery",
      description: "Triple-layer shock-cushioned packaging with specialized expanding internal foam to protect heavy GPUs and liquid coolers during transit via BlueDart and Delhivery.",
    },
    {
      icon: <BoltIcon className="w-8 h-8 text-[#D1121B]" />,
      title: "Lifetime Technical Consultation",
      description: "Our veteran hardware engineers provide honest, bottleneck-free upgrade advice and lifetime remote troubleshooting support via WhatsApp and phone.",
    },
  ];

  const milestones = [
    { number: "15,000+", label: "Custom PCs Built & Delivered" },
    { number: "4.9/5", label: "Average Verified Customer Rating" },
    { number: "100%", label: "Genuine Manufacturer Warranty" },
    { number: "Pan-India", label: "Fast Insured Express Shipping" },
  ];

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-8 font-sans">
      {/* Breadcrumb */}
      <nav className="text-xs text-zinc-500 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-[#D1121B]">Home</Link>
        <span>/</span>
        <span className="text-[#1B1B1B] font-bold">About Us</span>
      </nav>

      {/* Hero Showcase Banner */}
      <div className="relative bg-gradient-to-r from-[#263844] via-[#1D2B34] to-[#4E0B10] text-white p-8 sm:p-14 rounded-3xl border border-[#C89B3C]/50 shadow-xl overflow-hidden mb-12">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#FFD700] bg-white/10 px-3 py-1 rounded-full border border-white/20">
            India&apos;s Trusted PC Hardware Destination
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Building Dreams. Powering Performance.
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            From humble beginnings to India&apos;s leading enthusiast computer hardware supplier, Charmila Computers empowers gamers, creators, engineers, and enterprises with pure computing horsepower.
          </p>
        </div>
      </div>

      {/* Milestones Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
        {milestones.map((m, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-[#E5E0D7] shadow-2xs text-center space-y-1">
            <span className="text-3xl font-black text-[#D1121B] block">{m.number}</span>
            <span className="text-xs font-bold text-zinc-700">{m.label}</span>
          </div>
        ))}
      </div>

      {/* Story & Legacy Section */}
      <section className="bg-white p-8 sm:p-12 rounded-3xl border border-[#E5E0D7] shadow-sm mb-14 space-y-6">
        <div className="max-w-3xl space-y-4 text-xs sm:text-sm text-zinc-700 leading-relaxed">
          <h2 className="text-2xl font-black text-[#1B1B1B]">Our Story &amp; Passion for Hardware</h2>
          <p>
            Founded with a singular vision to eradicate counterfeit hardware and overpriced markup in the Indian PC gaming market, <strong>Charmila Computers</strong> has grown into the premier authorized hub for cutting-edge desktop processors, RTX graphics cards, DDR5 RAM, and custom liquid-cooled workstations.
          </p>
          <p>
            Unlike generic multi-brand marketplaces where third-party sellers compromise on serial numbers and gray-market imports, every single item dispatched from our state-of-the-art warehouse is <strong>100% brand-sealed with official GST tax invoices</strong>, entitling you to full local warranty coverage across India.
          </p>
          <p>
            Whether you are crafting your first budget esports PC or configuring a dual-RTX 4090 deep learning workstation, our dedicated assembly crew treats every single build as a masterpiece of cable routing and thermal optimization.
          </p>
        </div>
      </section>

      {/* 4 Pillars Grid */}
      <section className="mb-14 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl font-black text-[#1B1B1B]">Why Gamers &amp; Creators Choose Us</h2>
          <p className="text-xs text-zinc-500">The four pillars of excellence behind every Charmila Computers shipment.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((p, idx) => (
            <div key={idx} className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E0D7] shadow-2xs space-y-3 flex flex-col justify-start">
              <div className="p-3 bg-red-50 rounded-2xl w-fit border border-red-100 mb-2">
                {p.icon}
              </div>
              <h3 className="font-extrabold text-base text-[#1B1B1B]">{p.title}</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Retail Store & Consultation CTA */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 sm:p-10 rounded-3xl border border-amber-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl font-black text-zinc-900">Visit Our Physical Experience Showroom</h3>
          <p className="text-xs text-zinc-600 max-w-lg">
            Experience high-refresh monitors, mechanical keyboards, and custom liquid loops in person at our flagship retail destination.
          </p>
          <p className="text-xs text-zinc-800 font-bold">{STORE.address} (Mon - Sat: 10:30 AM - 7:30 PM IST)</p>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          <Link
            href="/contact"
            className="bg-[#1B1B1B] hover:bg-black text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-sm"
          >
            Get Store Directions
          </Link>
          <a
            href={`https://wa.me/${STORE.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <WhatsAppIcon className="w-4 h-4" /> WhatsApp Us
          </a>
        </div>
      </div>
    </div>
  );
}
