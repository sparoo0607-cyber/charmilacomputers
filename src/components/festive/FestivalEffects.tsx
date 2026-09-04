"use client";

import { festivalConfig } from "@/config/festivalConfig";
import { useStoreTheme } from "@/hooks/useStoreTheme";
import FestiveSplashScreen from "./FestiveSplashScreen";
import MangoLeafThoranam from "./MangoLeafThoranam";
import SideMarigoldThoranam from "./SideMarigoldThoranam";
import FestivePetals from "./FestivePetals";

export default function FestivalEffects() {
  const activeTheme = useStoreTheme();

  // CRITICAL CONSTRAINT: Festive effects only display when Vinayaka Theme ("festive") is active!
  if (!festivalConfig.enabled || activeTheme !== "festive") {
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
