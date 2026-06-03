import type { GameData } from "@/lib/types";

const reloadFreshGames =
  typeof window !== "undefined" &&
  (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)
    ?.type === "reload"
    ? new Set(["hsr", "zzz", "wuwa", "endfield", "n2e"])
    : null;

export async function fetchGameData(
  gameId: string,
  options?: { forceRefresh?: boolean }
): Promise<GameData> {
  const forceRefresh =
    options?.forceRefresh || (reloadFreshGames?.has(gameId) ?? false);
  reloadFreshGames?.delete(gameId);

  const query = forceRefresh ? "?refresh=true" : "";
  const response = await fetch(`/api/games/${gameId}${query}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to load ${gameId}`);
  }

  return response.json() as Promise<GameData>;
}
