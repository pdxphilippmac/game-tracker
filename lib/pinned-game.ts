import { GAME_IDS } from "@/lib/game-config";
import type { GameId } from "@/lib/types";

const STORAGE_KEY = "gacha-tracker-pinned-game";

export function getPinnedGame(): GameId | null {
  if (typeof window === "undefined") {
    return null;
  }
  const value = localStorage.getItem(STORAGE_KEY);
  if (value && (GAME_IDS as readonly string[]).includes(value)) {
    return value as GameId;
  }
  return null;
}

export function setPinnedGame(gameId: GameId | null): void {
  if (typeof window === "undefined") {
    return;
  }
  if (gameId) {
    localStorage.setItem(STORAGE_KEY, gameId);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function sortGameIds(ids: readonly GameId[], pinned: GameId | null): GameId[] {
  if (!pinned || !ids.includes(pinned)) {
    return [...ids];
  }
  return [pinned, ...ids.filter((id) => id !== pinned)];
}
