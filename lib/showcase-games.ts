import type { GameId } from "@/lib/types";
import type { ShowcaseGameId } from "@/lib/showcase-types";

export const SHOWCASE_GAME_IDS: ShowcaseGameId[] = ["hsr", "zzz"];

/** In-game profile showcase slots exposed via Enka (not full account roster). */
export const SHOWCASE_PROFILE_MAX_SLOTS = 8;

export function isShowcaseGame(gameId: GameId): gameId is ShowcaseGameId {
  return SHOWCASE_GAME_IDS.includes(gameId as ShowcaseGameId);
}
