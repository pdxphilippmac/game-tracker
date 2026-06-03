export type GameId = "hsr" | "zzz" | "wuwa" | "endfield" | "n2e";

export interface GameInfo {
  id: GameId;
  name: string;
  shortName: string;
  website: string;
}

export const GAMES: Record<GameId, GameInfo> = {
  hsr: {
    id: "hsr",
    name: "Honkai: Star Rail",
    shortName: "HSR",
    website: "https://hsr.hoyoverse.com",
  },
  zzz: {
    id: "zzz",
    name: "Zenless Zone Zero",
    shortName: "ZZZ",
    website: "https://zenless.hoyoverse.com",
  },
  wuwa: {
    id: "wuwa",
    name: "Wuthering Waves",
    shortName: "WuWa",
    website: "https://wutheringwaves.kurogames.com",
  },
  endfield: {
    id: "endfield",
    name: "Arknights: Endfield",
    shortName: "Endfield",
    website: "https://endfield.gryphline.com",
  },
  n2e: {
    id: "n2e",
    name: "Neverness to Everness",
    shortName: "N2E",
    website: "https://n2e.papegames.com",
  },
};

// Character/Agent in a banner
export interface BannerCharacter {
  id: number | string;
  name: string;
  icon?: string;
  element?: string;
  path?: string;
  rarity: number;
}

// Light Cone / Weapon / W-Engine
export interface BannerWeapon {
  id: number | string;
  name: string;
  icon: string;
  rarity: number;
}

// Banner with full details
export interface Banner {
  id: string | number;
  name: string;
  version?: string;
  type: "character" | "weapon" | "standard" | "limited" | "rerun";
  characters: BannerCharacter[];
  weapons: BannerWeapon[];
  startTime: number;
  endTime: number;
  imageUrl?: string;
}

// In-game event with rewards
export interface GameEvent {
  id: number | string;
  name: string;
  description?: string;
  imageUrl?: string;
  type: string;
  startTime: number;
  endTime: number;
  rewards?: EventReward[];
}

export interface EventReward {
  id: number | string;
  name: string;
  icon: string;
  rarity: string;
  amount: number;
}

// Challenge (Abyss, MoC, etc.)
export interface Challenge {
  id: number | string;
  name: string;
  type: string;
  startTime: number;
  endTime: number;
}

export type AnnouncementKind =
  | "patch"
  | "maintenance"
  | "special_program"
  | "banner_info"
  | "general";

// News item
export interface NewsItem {
  id: string;
  title: string;
  category: string;
  kind?: AnnouncementKind;
  date: string;
  url: string;
  thumbnail?: string;
  description?: string;
}

import type { PatchStatus } from "@/lib/patch-types";

// Full game data response
export interface GameData {
  game: GameId;
  patchStatus: PatchStatus | null;
  banners: Banner[];
  events: GameEvent[];
  challenges: Challenge[];
  announcements: NewsItem[];
  news: NewsItem[];
  lastUpdated: string;
  error?: string;
}

// Element mappings for HSR
export const HSR_ELEMENTS: Record<string, string> = {
  "1": "Physical",
  "2": "Fire",
  "4": "Ice",
  "8": "Lightning",
  "16": "Wind",
  "32": "Quantum",
  "64": "Imaginary",
};

// Path mappings for HSR
export const HSR_PATHS: Record<string, string> = {
  "1": "Destruction",
  "2": "Hunt",
  "3": "Erudition",
  "4": "Harmony",
  "5": "Nihility",
  "6": "Preservation",
  "7": "Abundance",
  "8": "Remembrance",
  "9": "TheHunt",
};
