"use client";

import { useState } from "react";
import Link from "next/link";
import { STORE } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import {
  PhoneIcon, WhatsAppIcon, LocationIcon, ClockIcon,
  ChevronDownIcon, CheckCircleIcon
} from "@/components/icons";

export default function ContactPage() {
  const { showToast } = useCart();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "Custom PC Quotation",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    showToast("✓ Message sent successfully! Our hardware technician will contact you shortly.");
  }

  const faqs = [
    {
      q: "Are all components brand new and covered by official warranty?",
      a: "Yes, 100%. We only source directly from authorized Indian national distributors (Ingram Micro, Savex, Rashi Peripherals, Redington). Every item comes brand sealed with a GST Tax Invoice for seamless warranty claims across India.",
    },
    {
      q: "How long does shipping take to my city?",
      a: "Orders placed before 2:00 PM are dispatched same-day via BlueDart Air Express or Delhivery. Metros & South India take 1-2 business days, while other regions take 2-4 business days. Real-time SMS and WhatsApp tracking links are provided upon dispatch.",
    },
    {
      q: "Can I get a custom PC quotation for my specific budget?",
      a: "Absolutely! Fill in our contact form or ping us on WhatsApp with your budget (e.g. ₹60,000 or ₹1.5 Lakhs) and intended usage (Gaming, 4K Premiere Pro, 3D Blender, Machine Learning). Our techs will draft an optimized zero-bottleneck part list within 30 minutes.",
    },
    {
      q: "What payment options do you support?",
      a: "We accept all UPI apps (Google Pay, PhonePe, Paytm), Credit/Debit cards (Visa, MasterCard, RuPay), Net Banking from all major Indian banks, and No-Cost EMI options on eligible cards.",
    },
  ];

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-8 font-sans">
      {/* Breadcrumb */}
      <nav className="text-xs text-zinc-500 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-[#D1121B]">Home</Link>
        <span>/</span>
        <span className="text-[#1B1B1B] font-bold">Contact Us</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#7A1118] to-[#4E0B10] text-white p-8 sm:p-12 rounded-3xl border border-[#C89B3C]/50 shadow-xl mb-12">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#FFD700]">
            We&apos;re Here to Help
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Contact Charmila Computers
          </h1>
          <p className="text-xs sm:text-sm text-zinc-200">
            Have questions regarding PC parts, custom gaming rigs, delivery timelines, or bulk corporate quotes? Get in touch with our veteran hardware engineers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-14">
        {/* Contact Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E0D7] shadow-sm space-y-6">
          <h2 className="text-xl font-extrabold text-[#1B1B1B]">Send Us a Message</h2>

          {submitted ? (
            <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
              <CheckCircleIcon className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-emerald-950">Thank You, {formData.name}!</h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                Your message regarding <strong>{formData.subject}</strong> has been received. Our hardware consultant will call or WhatsApp you within 2 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 text-xs font-bold text-[#7A1118] underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Srikanth Reddy"
                    className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl font-medium focus:border-[#7A1118] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Phone / WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98480 XXXXX"
                    className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl font-medium focus:border-[#7A1118] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="srikanth@example.com"
                    className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl font-medium focus:border-[#7A1118] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Inquiry Purpose *</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl font-bold bg-white focus:border-[#7A1118] focus:outline-none"
                  >
                    <option>Custom PC Quotation</option>
                    <option>Order Tracking / Delivery</option>
                    <option>Warranty / RMA Assistance</option>
                    <option>Corporate / Bulk Orders</option>
                    <option>Hardware Repair / Bench Service</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Your Message or Build Requirements *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your budget, games/software you want to run, or order questions..."
                  className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl font-medium focus:border-[#7A1118] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#D1121B] hover:bg-[#7A1118] text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-98"
              >
                Submit Inquiry →
              </button>
            </form>
          )}
        </div>

        {/* Contact Info & Store Details (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E0D7] shadow-sm space-y-5 text-xs">
            <h2 className="text-xl font-extrabold text-[#1B1B1B]">Retail Store &amp; Service Lab</h2>

            <div className="space-y-4 text-zinc-700">
              <div className="flex gap-3">
                <LocationIcon className="w-5 h-5 text-[#D1121B] shrink-0" />
                <div>
                  <strong className="block text-zinc-900 text-sm font-bold">Physical Address</strong>
                  <p className="text-zinc-600 mt-0.5 leading-relaxed">{STORE.address}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <ClockIcon className="w-5 h-5 text-[#D1121B] shrink-0" />
                <div>
                  <strong className="block text-zinc-900 text-sm font-bold">Business Hours</strong>
                  <p className="text-zinc-600 mt-0.5">Monday – Saturday: 10:30 AM – 7:30 PM IST</p>
                  <p className="text-zinc-400">Sunday: Closed for maintenance</p>
                </div>
              </div>

              <div className="flex gap-3">
                <PhoneIcon className="w-5 h-5 text-[#D1121B] shrink-0" />
                <div>
                  <strong className="block text-zinc-900 text-sm font-bold">Phone &amp; Sales Helpline</strong>
                  <a href={`tel:${STORE.phonePrimary}`} className="text-zinc-900 font-bold hover:text-[#D1121B] block">
                    {STORE.phonePrimary}
                  </a>
                  <a href={`tel:${STORE.phoneSecondary}`} className="text-zinc-600 hover:text-[#D1121B] block">
                    {STORE.phoneSecondary}
                  </a>
                </div>
              </div>

              <div className="flex gap-3">
                <WhatsAppIcon className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <strong className="block text-zinc-900 text-sm font-bold">WhatsApp Direct Consultation</strong>
                  <p className="text-zinc-600">Instant responses during working hours</p>
                  <a
                    href={`https://wa.me/${STORE.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 font-bold hover:underline inline-block mt-0.5"
                  >
                    Chat on WhatsApp (+91 {STORE.whatsapp}) →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions (FAQ) Accordion */}
      <section className="bg-white p-8 sm:p-12 rounded-3xl border border-[#E5E0D7] shadow-sm mb-14 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl font-black text-[#1B1B1B]">Frequently Asked Questions</h2>
          <p className="text-xs text-zinc-500">Instant answers to common hardware and ordering questions.</p>
        </div>

        <div className="divide-y divide-zinc-200 max-w-3xl mx-auto">
          {faqs.map((f, i) => (
            <div key={i} className="py-4">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between text-left font-bold text-sm text-[#1B1B1B] hover:text-[#7A1118] transition-colors"
              >
                <span>{f.q}</span>
                <ChevronDownIcon className={`w-4 h-4 text-zinc-400 transition-transform ${openFaq === i ? "rotate-180 text-[#7A1118]" : ""}`} />
              </button>
              {openFaq === i && (
                <p className="mt-2 text-xs text-zinc-600 leading-relaxed animate-fade-in-up">
                  {f.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
