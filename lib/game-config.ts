import { GameId } from "@/lib/types";

/** Semantic classes — use var(--game-accent) via globals.css, not Tailwind color tokens. */
export const gameAccentText = "text-game-accent";
export const gameBadge = "game-badge border";
export const gameTabActive = "game-tab-active";
export const gameTabInactive = "game-tab-inactive";
export const gameHeroPanel = "game-hero-panel";
export const gamePanel = "game-panel";
export const gameIconBox =
  "border border-border bg-secondary text-muted-foreground";

export const surfaceCard = "surface-card";
export const sectionTitle = "section-title";
export const sectionCaption = "section-caption";
export const metaLabel = "meta-label";
export const toolbarButton = "toolbar-btn";
export const filterChip = "filter-chip";
export const overviewSection = "overview-section";

export type GameThemeConfig = {
  name: string;
  shortName: string;
};

export const GAME_CONFIG: Record<GameId, GameThemeConfig> = {
  hsr: {
    name: "Honkai: Star Rail",
    shortName: "HSR",
  },

  zzz: {
    name: "Zenless Zone Zero",
    shortName: "ZZZ",
  },

  endfield: {
    name: "Arknights: Endfield",
    shortName: "Endfield",
  },
  genshin: {
    name: "Genshin Impact",
    shortName: "GI",
  },
  hi3: {
    name: "Honkai Impact 3rd",
    shortName: "HI3",
  },
  themis: {
    name: "Tears of Themis",
    shortName: "ToT",
  },
  wuwa: {
    name: "Wuthering Waves",
    shortName: "WuWa",
  },
  n2e: {
    name: "Neverness to Everness",
    shortName: "NTE",
  },
  ba: {
    name: "Blue Archive",
    shortName: "BA",
  },
  stella: {
    name: "Stella Sora",
    shortName: "Stella",
  },
};

export const GAME_IDS: GameId[] = [
  "hsr",
  "zzz",
  "genshin",
  "endfield",
  "wuwa",
  "hi3",
  "themis",
  "n2e",
  "ba",
  "stella",
];
