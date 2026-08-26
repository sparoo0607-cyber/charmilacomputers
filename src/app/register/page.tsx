"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useCart();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    const res = await register(formData.email, formData.password, formData.fullName, formData.phone);
    setBusy(false);
    if (!res.success) return setError(res.message);
    if (res.needsConfirmation) return setInfo(res.message);
    router.push("/account");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 font-sans">
      <div className="bg-white p-8 rounded-3xl border border-[#E5E0D7] shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <Link href="/" className="inline-flex justify-center group mb-2 select-none">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#7A1118] transition-colors group-hover:text-[#D1121B]">
              CHARMILA
              <span className="font-black text-[#D1121B] ml-1 bg-gradient-to-r from-[#D1121B] to-[#7A1118] bg-clip-text text-transparent transition-opacity group-hover:opacity-90">
                COMPUTERS
              </span>
            </span>
          </Link>
          <h1 className="text-xl font-black text-zinc-900 mt-2">Create Customer Account</h1>
          <p className="text-xs text-zinc-500">Get 100 Charmila Coins instantly upon signup!</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-zinc-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Ramesh V."
              className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl font-medium focus:outline-none focus:border-[#7A1118]"
            />
          </div>

          <div>
            <label className="block font-bold text-zinc-700 mb-1">Mobile Phone Number *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98480 XXXXX"
              className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl font-medium focus:outline-none focus:border-[#7A1118]"
            />
          </div>

          <div>
            <label className="block font-bold text-zinc-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl font-medium focus:outline-none focus:border-[#7A1118]"
            />
          </div>

          <div>
            <label className="block font-bold text-zinc-700 mb-1">Create Password *</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 6 characters"
              className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl focus:outline-none focus:border-[#7A1118]"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-950">
            <span>You will receive <strong>100 Bonus Coins (₹100 value)</strong> credited to your wallet.</span>
          </div>

          {error && (
            <p className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {info && (
            <p className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3.5 bg-[#D1121B] hover:bg-[#7A1118] text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-98 disabled:opacity-60"
          >
            {busy ? "Creating account…" : "Create Account & Claim Bonus"}
          </button>
        </form>

        <div className="text-center text-xs text-zinc-600 pt-2 border-t border-zinc-100">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[#7A1118] hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
