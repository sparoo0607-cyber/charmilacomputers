"use client";

import { festivalConfig } from "@/config/festivalConfig";
import { useStoreTheme } from "@/hooks/useStoreTheme";
import { isFestiveTheme } from "@/lib/theme";
import FestiveSplashScreen from "./FestiveSplashScreen";
import MangoLeafThoranam from "./MangoLeafThoranam";
import SideMarigoldThoranam from "./SideMarigoldThoranam";
import FestivePetals from "./FestivePetals";

export default function FestivalEffects() {
  const activeTheme = useStoreTheme();

  // Festive effects display when any festive theme (Vinayaka or Dussara) is active
  if (!festivalConfig.enabled || !isFestiveTheme(activeTheme)) {
    return null;
  }

  return (
    <>
      <FestiveSplashScreen />
      <MangoLeafThoranam />
      <SideMarigoldThoranam />
      <FestivePetals />
    </>
  );
}
