import { NextResponse } from "next/server";
import type { GameId, GameData } from "@/lib/types";
import { getFromCache, setInCache } from "@/lib/cache";
import { DATA_REVALIDATE_SECONDS } from "@/lib/fetch-config";
import { emptyGameData } from "@/lib/fetchers/empty-game-data";
import {
  fetchHSRData,
  fetchZZZData,
  fetchWuWaData,
  fetchEndfieldData,
  fetchN2EData,
} from "@/lib/fetchers";

const VALID_GAMES: GameId[] = ["hsr", "zzz", "wuwa", "endfield", "n2e"];

const fetchers: Record<GameId, () => Promise<GameData>> = {
  hsr: fetchHSRData,
  zzz: fetchZZZData,
  wuwa: fetchWuWaData,
  endfield: fetchEndfieldData,
  n2e: fetchN2EData,
};

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ game: string }> }
) {
  const { game } = await params;
  const url = new URL(request.url);
  const skipCache = url.searchParams.get("refresh") === "true";

  if (!VALID_GAMES.includes(game as GameId)) {
    return NextResponse.json(
      { error: `Invalid game. Valid options: ${VALID_GAMES.join(", ")}` },
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
