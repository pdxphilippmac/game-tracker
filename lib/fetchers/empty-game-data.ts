import type { GameData } from "@/lib/types";

export function emptyGameData(
  game: GameData["game"],
  error?: string
): GameData {
  return {
    game,
    patchStatus: null,
    banners: [],
    events: [],
    challenges: [],
    announcements: [],
    news: [],
    lastUpdated: new Date().toISOString(),
    error,
  };
}
