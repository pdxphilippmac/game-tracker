import { GAME_IDS } from "@/lib/game-config";
import type { GameId } from "@/lib/types";

const STORAGE_KEY = "gacha-tracker-banner-game-filter";

function isGameId(value: string): value is GameId {
  return (GAME_IDS as readonly string[]).includes(value);
}

export function getBannerGameFilter(): GameId[] | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return null;
    }

    const ids = parsed.filter((item): item is GameId => typeof item === "string" && isGameId(item));
    return ids;
  } catch {
    return null;
  }
}

export function setBannerGameFilter(gameIds: GameId[] | null): void {
  if (typeof window === "undefined") {
    return;
  }

  if (gameIds === null) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(gameIds));
}

export function filterActiveBannersByGames<T extends { gameId: GameId }>(
  entries: T[],
  filter: GameId[] | null,
): T[] {
  if (filter === null) {
    return entries;
  }

  if (filter.length === 0) {
    return [];
  }

  const allowed = new Set(filter);
  return entries.filter((entry) => allowed.has(entry.gameId));
}
