import { GameId } from "@/lib/types";

/** Semantic classes — use var(--game-accent) via globals.css, not Tailwind color tokens. */
export const gameAccentText = "text-game-accent";
export const gameBadge = "game-badge border";
export const gameTabActive = "game-tab-active";
export const gameTabInactive = "game-tab-inactive";
export const gameHeroPanel = "game-hero-panel";
export const gamePanel = "game-panel";
export const gameIconBox = "border-game-accent-soft bg-game-accent-soft text-game-accent";

export type GameThemeConfig = {
  name: string;
  shortName: string;
};

export const GAME_CONFIG: Record<GameId, GameThemeConfig> = {
  hsr: {
    name: "Honkai: Star Rail",
    shortName: "HSR",
  },
  genshin: {
    name: "Genshin Impact",
    shortName: "GI",
  },
  zzz: {
    name: "Zenless Zone Zero",
    shortName: "ZZZ",
  },
  wuwa: {
    name: "Wuthering Waves",
    shortName: "WuWa",
  },
  endfield: {
    name: "Arknights: Endfield",
    shortName: "Endfield",
  },
  n2e: {
    name: "Neverness to Everness",
    shortName: "NTE",
  },
};

export const GAME_IDS: GameId[] = ["hsr", "genshin", "zzz", "wuwa", "endfield", "n2e"];
