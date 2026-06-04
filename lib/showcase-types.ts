import type { GameId } from "@/lib/types";

export type ShowcaseGameId = Extract<GameId, "hsr" | "zzz">;

export type ShowcaseStat = {
  type: string;
  label: string;
  value: number;
  display: string;
};

export type ShowcaseRelic = {
  slot: string;
  level: number;
  setId: number;
  setName: string;
  mainStat: ShowcaseStat | null;
  substats: ShowcaseStat[];
};

export type ShowcaseLightCone = {
  id: string;
  name: string;
  iconUrl: string;
  level: number;
  superimposition: number;
  rarity: number;
  path?: string;
};

export type ShowcaseWEngine = {
  id: string;
  name: string;
  iconUrl: string;
  level: number;
  refinement: number;
  rarity: number;
};

export type ShowcaseDisc = {
  slot: number;
  slotLabel: string;
  level: number;
  suitId: number;
  suitName: string;
  mainStat: ShowcaseStat;
  substats: ShowcaseStat[];
};

export type ShowcaseSkill = {
  label: string;
  level: number;
};

export type ShowcaseSetBonus = {
  setId: number;
  setName: string;
  count: number;
};

export type HsrCharacterBuild = {
  lightCone: ShowcaseLightCone | null;
  relics: ShowcaseRelic[];
  setBonuses: ShowcaseSetBonus[];
  finalStats: ShowcaseStat[];
  skills: ShowcaseSkill[];
};

export type ZzzCharacterBuild = {
  wEngine: ShowcaseWEngine | null;
  discs: ShowcaseDisc[];
  setBonuses: ShowcaseSetBonus[];
  stats: ShowcaseStat[];
  skills: ShowcaseSkill[];
};

export type ShowcaseCharacter = {
  id: string;
  name: string;
  iconUrl: string;
  level: number;
  rarity: number;
  element?: string;
  path?: string;
  /** HSR eidolon / ZZZ mindscape */
  specialLevel?: number;
  promotion?: number;
  hsrBuild?: HsrCharacterBuild;
  zzzBuild?: ZzzCharacterBuild;
};

export type PlayerShowcase = {
  uid: string;
  gameId: ShowcaseGameId;
  nickname: string;
  signature?: string;
  level: number;
  worldLevel?: number;
  characters: ShowcaseCharacter[];
  ttl: number;
  fetchedAt: string;
  showcaseEmpty: boolean;
};

export type ShowcaseErrorCode =
  | "invalid_uid"
  | "invalid_game"
  | "not_found"
  | "showcase_closed"
  | "rate_limited"
  | "maintenance"
  | "upstream_error";

export type ShowcaseErrorResponse = {
  error: string;
  code: ShowcaseErrorCode;
};
