import { NextResponse } from "next/server";
import type { GameId, GameData } from "@/lib/types";
import { GAME_IDS } from "@/lib/game-config";
import { getFromCache, setInCache } from "@/lib/cache";
import { DATA_REVALIDATE_SECONDS } from "@/lib/fetch-config";
import { emptyGameData } from "@/lib/fetchers/empty-game-data";
import {
  fetchHSRData,
  fetchGenshinData,
  fetchZZZData,
  fetchHI3Data,
  fetchThemisData,
  fetchWuWaData,
  fetchEndfieldData,
  fetchN2EData,
  fetchBlueArchiveData,
  fetchStellaSoraData,
} from "@/lib/fetchers";

const fetchers: Record<GameId, () => Promise<GameData>> = {
  hsr: fetchHSRData,
  genshin: fetchGenshinData,
  zzz: fetchZZZData,
  hi3: fetchHI3Data,
  themis: fetchThemisData,
  wuwa: fetchWuWaData,
  endfield: fetchEndfieldData,
  n2e: fetchN2EData,
  ba: fetchBlueArchiveData,
  stella: fetchStellaSoraData,
};

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ game: string }> }
) {
  const { game } = await params;
  const url = new URL(request.url);
  const skipCache = url.searchParams.get("refresh") === "true";

  if (!GAME_IDS.includes(game as GameId)) {
    return NextResponse.json(
      { error: `Invalid game. Valid options: ${GAME_IDS.join(", ")}` },
      { status: 400 }
    );
  }

  const gameId = game as GameId;
  const cacheKey = `game-data-${gameId}`;

  // Check cache first (unless skipCache)
  if (!skipCache) {
    const cached = getFromCache<GameData>(cacheKey);
    if (cached && !cached.error) {
      return NextResponse.json(cached, {
        headers: {
          "X-Cache": "HIT",
          "Cache-Control": `private, max-age=0, s-maxage=${DATA_REVALIDATE_SECONDS}, stale-while-revalidate=60`,
        },
      });
    }
  }

  // Fetch fresh data
  try {
    const data = await fetchers[gameId]();
    
    // Only cache successful responses
    if (!data.error) {
      setInCache(cacheKey, data);
    }

    return NextResponse.json(data, {
      headers: {
        "X-Cache": skipCache ? "BYPASS" : "MISS",
        "Cache-Control": `private, max-age=0, s-maxage=${DATA_REVALIDATE_SECONDS}, stale-while-revalidate=60`,
      },
    });
  } catch (error) {
    console.error(`Error fetching ${gameId} data:`, error);
    return NextResponse.json(emptyGameData(gameId, "Failed to fetch data"), {
      status: 500,
    });
  }
}
