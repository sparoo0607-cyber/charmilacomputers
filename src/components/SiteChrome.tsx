"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import CompareDrawer from "./CompareDrawer";
import { useCart } from "@/context/CartContext";
import { PhoneIcon, CloseIcon, CheckIcon } from "./icons";

/**
 * Phone-collect modal — shown once after login when the user's profile
 * doesn't have a phone number saved yet.  Saves to Supabase profiles table
 * via CartContext.savePhone().
 */
function PhoneCollectModal() {
  const { user, authLoading, savePhone } = useCart();
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dismissed, setDismissed] = useState(false);

  // Show only when: auth check done, user is logged in, phone is missing, not dismissed
  const shouldShow =
    !authLoading && !!user && !user.phone && !dismissed;

  if (!shouldShow) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = phone.replace(/\s/g, "");
    if (cleaned.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setError("");
    setBusy(true);
    const res = await savePhone(cleaned);
    setBusy(false);
    if (!res.success) {
      setError(res.message);
    }
    // On success, user.phone is updated → shouldShow becomes false → modal auto-hides
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
        onClick={() => setDismissed(true)}
      />

      {/* Bottom sheet modal */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] animate-slide-up font-sans">
        <div className="bg-white rounded-t-3xl shadow-2xl p-6 sm:p-8 max-w-lg mx-auto w-full">
          {/* Close */}
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1"
            aria-label="Close"
          >
            <CloseIcon className="w-5 h-5" />
          </button>

          {/* Icon + heading */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-[#7A1118]/10 flex items-center justify-center shrink-0">
              <PhoneIcon className="w-5 h-5 text-[#7A1118]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-zinc-900">
                One last thing, {user.name?.split(" ")[0]}!
              </h2>
              <p className="text-xs text-zinc-500">
                Save your WhatsApp number to place orders instantly.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                Your WhatsApp / Mobile Number
              </label>
              <div className="flex gap-2 items-center">
                {/* India prefix */}
                <span className="shrink-0 px-3 py-2.5 bg-zinc-100 border border-zinc-300 rounded-xl text-sm font-bold text-zinc-600 select-none">
                  IN +91
                </span>
                <input
                  type="tel"
                  required
                  autoFocus
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    setError("");
                    setPhone(e.target.value.replace(/\D/g, ""));
                  }}
                  placeholder="98480 22334"
                  className="flex-1 px-3.5 py-2.5 border border-zinc-300 rounded-xl font-bold text-sm tracking-wider focus:outline-none focus:border-[#7A1118] focus:ring-2 focus:ring-[#7A1118]/20"
                />
              </div>
              {error && (
                <p className="text-[11px] text-red-600 font-semibold mt-1.5">
                  {error}
                </p>
              )}
              <p className="text-[10px] text-zinc-400 mt-1.5">
                Used only for order updates &amp; WhatsApp order confirmation. We don&apos;t share your number.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={busy}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#D1121B] hover:bg-[#7A1118] text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-60"
              >
                {busy ? (
                  "Saving…"
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    Save Number
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold text-xs rounded-xl transition-colors"
              >
                Skip
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

/**
 * The storefront's customer-facing header/footer/compare-drawer only make sense
 * on storefront pages. The /admin section renders its own dedicated shell
 * (see src/app/admin/AdminShell.tsx), so we hide the storefront chrome there.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
      <CompareDrawer />
      {/* Phone collect modal — shown after login when phone is missing */}
      <PhoneCollectModal />
    </>
  );
}
