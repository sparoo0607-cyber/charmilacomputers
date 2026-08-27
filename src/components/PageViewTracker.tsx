"use client";

import { useEffect } from "react";
import { logPageView, type ViewKind } from "@/lib/analytics";

// Drop-in client component for Server Components. Records exactly one page view
// on mount (deduped per path per tab session inside logPageView).
export default function PageViewTracker({ kind, slug }: { kind: ViewKind; slug?: string }) {
  useEffect(() => {
    logPageView({ kind, slug });
  }, [kind, slug]);
  return null;
}
