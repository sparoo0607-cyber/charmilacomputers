"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";

  const { login } = useCart();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Email & Password login — handles both customer and admin logins seamlessly;
  // admin access is decided server-side by `profiles.is_admin`, never by email string.
  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);

    const res = await login(email.trim(), password);
    setBusy(false);

    if (!res.success) {
      setError(res.message);
      return;
    }

    if (res.isAdmin) {
      window.location.href = "/admin";
    } else {
      router.push(redirectTo.startsWith("/admin") ? "/account" : redirectTo);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16 font-sans">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E0D7] shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <Link href="/" className="inline-flex justify-center group mb-2 select-none">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#7A1118] transition-colors group-hover:text-[#D1121B]">
              CHARMILA
              <span className="font-black text-[#D1121B] ml-1 bg-gradient-to-r from-[#D1121B] to-[#7A1118] bg-clip-text text-transparent">
                COMPUTERS
              </span>
            </span>
          </Link>
          <h1 className="text-xl font-black text-zinc-900 mt-2">Welcome Back!</h1>
          <p className="text-xs text-zinc-500">Sign in to track orders, manage wishlist &amp; earn Charmila Coins</p>
        </div>

        {error && (
          <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
            {error}
          </p>
        )}

        {/* Email & Password Form (Customer or Admin) */}
        <form onSubmit={handlePasswordLogin} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-zinc-700 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl font-medium focus:outline-none focus:border-[#7A1118]"
            />
          </div>

          <div>
            <label className="block font-bold text-zinc-700 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl focus:outline-none focus:border-[#7A1118]"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3.5 bg-[#D1121B] hover:bg-[#7A1118] text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.99] disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* Create account link */}
        <div className="text-center text-xs text-zinc-600">
          New to Charmila Computers?{" "}
          <Link href="/register" className="font-bold text-[#7A1118] hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-16 text-center text-zinc-500 text-sm">Loading…</div>}>
      <LoginContent />
    </Suspense>
  );
}
