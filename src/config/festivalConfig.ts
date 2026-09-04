/**
 * Master configuration controller for seasonal Indian festive experience.
 * All visual effects, splash screens, decorations, and micro-interactions can be
 * enabled or disabled globally or individually from this central source.
 */

export interface FestivalConfig {
  enabled: boolean;
  themeName: string;
  splash: boolean;
  thoranam: boolean;
  garlands: boolean;
  diyas: boolean;
  petals: boolean;
  shimmer: boolean;
  badges: boolean;
  sectionAccents: boolean;
}

export const festivalConfig: FestivalConfig = {
  enabled: true,
  themeName: "Vinayaka Chavithi",
  splash: true,
  thoranam: true,
  garlands: true,
  diyas: true,
  petals: true,
  shimmer: true,
  badges: true,
  sectionAccents: true,
};
