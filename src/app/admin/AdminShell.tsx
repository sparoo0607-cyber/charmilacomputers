"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAdmin } from "@/context/AdminContext";
import {
  DashboardIcon,
  PackageIcon,
  UsersIcon,
  SettingsIcon,
  LogoutIcon,
  ChevronRightIcon,
  CheckIcon,
} from "@/components/icons";

function BannerIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M21 12H3M12 3v18" />
    </svg>
  );
}

function ThemeIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.66-.74 1.66-1.66 0-.43-.17-.83-.45-1.13-.27-.29-.44-.68-.44-1.12 0-.92.74-1.66 1.66-1.66H17c2.76 0 5-2.24 5-5 0-4.97-4.48-9.01-10-9.01z" />
    </svg>
  );
}

const NAV = [
  { href: "/admin", label: "Dashboard", icon: DashboardIcon, exact: true },
  { href: "/admin/products", label: "Products", icon: PackageIcon },
  { href: "/admin/users", label: "Users", icon: UsersIcon },
  { href: "/admin/banners", label: "Banners", icon: BannerIcon },
  { href: "/admin/themes", label: "Themes", icon: ThemeIcon },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthed, hydrated, adminName, logout, toast } = useAdmin();

  useEffect(() => {
    // Wait for the auth session check to complete before deciding to redirect
    if (!hydrated) return;
    if (!isAuthed) {
      const redirectUrl = pathname ? `/login?redirect=${encodeURIComponent(pathname)}` : "/login?redirect=/admin";
      router.replace(redirectUrl);
    }

  }, [isAuthed, hydrated, pathname, router]);

  if (!hydrated || !isAuthed) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#0F0D0C] text-white/60 text-sm font-mono">
        {hydrated ? "Redirecting to Admin Portal…" : "Checking admin privileges…"}
      </div>
    );
  }


  const pageTitle =
    NAV.find((n) => (n.exact ? pathname === n.href : pathname?.startsWith(n.href)))?.label || "Admin";

  return (
    <div className="min-h-screen flex bg-[#F4F1EC] text-[#1B1B1B] font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-[#17130F] text-[#EDE7DE] border-r border-black/20">
        <div className="px-6 h-20 flex items-center gap-2.5 border-b border-white/10">
          <span className="w-8 h-8 rounded-lg bg-[#D1121B] grid place-items-center font-black text-sm">C</span>
          <div className="leading-tight">
            <p className="font-extrabold text-sm tracking-tight">charmila</p>
            <p className="text-[10px] uppercase tracking-widest text-[#D1121B] font-bold">Admin Console</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  active
                    ? "bg-[#D1121B] text-white shadow-md"
                    : "text-[#C9C1B4] hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#C9C1B4] hover:bg-white/5 hover:text-white transition-colors"
          >
            <ChevronRightIcon className="w-4 h-4 rotate-180" />
            View Store
          </Link>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#C9C1B4] hover:bg-white/5 hover:text-red-300 transition-colors"
          >

            <LogoutIcon className="w-[18px] h-[18px]" />
            Sign Out
          </button>

        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="h-20 shrink-0 flex items-center justify-between gap-4 px-5 sm:px-8 border-b border-[#E5E0D7] bg-white/70 backdrop-blur-sm sticky top-0 z-20">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#B33F30]">Admin Console</p>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right leading-tight">
              <span className="text-sm font-bold">{adminName}</span>
              <span className="text-[11px] text-zinc-500">Store Administrator</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#7A1118] text-white font-bold grid place-items-center text-sm shrink-0">
              {adminName.trim().charAt(0).toUpperCase() || "A"}
            </div>
          </div>
        </header>

        <main id="main-content" className="flex-1 px-5 sm:px-8 py-6 sm:py-8 max-w-[1400px]">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[#17130F] border-t border-black/20 flex items-stretch">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold uppercase tracking-wide ${
                active ? "text-[#D1121B]" : "text-[#C9C1B4]"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="md:hidden h-16" />

      {/* Admin toast (Toast in root layout is still mounted, but admin uses its own AdminContext toast) */}
      <div
        aria-live="polite"
        className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
      >
        {toast && (
          <div className="pointer-events-auto flex items-center gap-2.5 rounded-lg bg-[#17130F] text-white shadow-xl px-4 py-3 text-sm font-semibold border border-white/10 max-w-[90vw]">
            <span className="grid place-items-center w-5 h-5 rounded-full bg-emerald-500 shrink-0">
              <CheckIcon className="w-3 h-3" />
            </span>
            <span className="line-clamp-2">{toast}</span>
          </div>
        )}
      </div>
    </div>
  );
}
