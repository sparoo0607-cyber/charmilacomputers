"use client";

import { createContext } from "react";
import type { ThemeId } from "@/lib/theme";

// The active theme resolved on the SERVER (from Supabase store_settings) and
// handed to the client so the very first client render matches the server HTML.
// This is what kills the theme-flash on refresh: no component has to wait for a
// mount effect or a localStorage read to know which theme to paint.
export const ServerThemeContext = createContext<ThemeId>("standard");

export function ThemeProvider({
  initialTheme,
  children,
}: {
  initialTheme: ThemeId;
  children: React.ReactNode;
}) {
  return (
    <ServerThemeContext.Provider value={initialTheme}>
      {children}
    </ServerThemeContext.Provider>
  );
}
