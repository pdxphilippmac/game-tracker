import type { GameId } from "@/lib/types";
import type { ShowcaseGameId } from "@/lib/showcase-types";

export const SHOWCASE_GAME_IDS: ShowcaseGameId[] = ["hsr", "zzz"];

export function isShowcaseGame(gameId: GameId): gameId is ShowcaseGameId {
  return SHOWCASE_GAME_IDS.includes(gameId as ShowcaseGameId);
}
