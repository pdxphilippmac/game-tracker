"use client";

import useSWR from "swr";
import { fetchGameData } from "@/lib/game-data-fetcher";
import { GAME_IDS } from "@/lib/game-config";
import { emptyGameData } from "@/lib/fetchers/empty-game-data";
import { DATA_REVALIDATE_SECONDS } from "@/lib/fetch-config";
import type { GameData } from "@/lib/types";

async function fetchAllGamesData(forceRefresh = false): Promise<GameData[]> {
  const results = await Promise.all(
    GAME_IDS.map(async (gameId) => {
      try {
        return await fetchGameData(gameId, { forceRefresh });
      } catch {
        return emptyGameData(gameId, "Failed to load");
      }
    }),
  );
  return results;
}

export function useAllGamesData() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<GameData[]>(
    "all-games-data",
    () => fetchAllGamesData(),
    {
      refreshInterval: DATA_REVALIDATE_SECONDS * 1000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 15_000,
    },
  );

  const refresh = async () => {
    const fresh = await fetchAllGamesData(true);
    await mutate(fresh, { revalidate: false });
  };

  return {
    data: data ?? [],
    error,
    isLoading,
    isValidating,
    refresh,
  };
}
