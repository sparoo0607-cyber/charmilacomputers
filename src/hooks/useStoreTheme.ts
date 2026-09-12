"use client";

import { useLiveTheme } from "@/context/ThemeContext";

// The active storefront theme.
//
// This used to fetch /api/theme itself, once per calling component — and
// ProductCard is a caller, so a page of product cards fired one uncached
// request each. The single sync now lives in ThemeProvider (see
// src/context/ThemeContext.tsx) and this is a plain context read.
export function useStoreTheme() {
  return useLiveTheme();
}
