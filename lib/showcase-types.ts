import type { GameId } from "@/lib/types";

export type ShowcaseGameId = Extract<GameId, "hsr" | "zzz">;

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
