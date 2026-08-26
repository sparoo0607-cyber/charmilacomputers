"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login?redirect=/admin");
  }, [router]);

  return (
    <div className="min-h-screen grid place-items-center bg-[#0F0D0C] text-white/70 text-sm font-sans">
      <div className="text-center space-y-2">
        <p className="font-bold">Redirecting to login…</p>
      </div>
    </div>
  );

}
