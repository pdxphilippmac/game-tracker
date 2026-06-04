import { NextResponse } from "next/server";
import {
  fetchPlayerShowcase,
  ShowcaseFetchError,
} from "@/lib/fetchers/enka-showcase";
import { getFromCache, setInCache } from "@/lib/cache";
import { SHOWCASE_GAME_IDS } from "@/lib/showcase-games";
import type { ShowcaseGameId } from "@/lib/showcase-types";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ game: string }> },
) {
  const { game } = await params;
  const url = new URL(request.url);
  const uid = url.searchParams.get("uid")?.trim() ?? "";

  if (!SHOWCASE_GAME_IDS.includes(game as ShowcaseGameId)) {
    return NextResponse.json(
      {
        error: `Invalid game. Supported: ${SHOWCASE_GAME_IDS.join(", ")}`,
        code: "invalid_game",
      },
      { status: 400 },
    );
  }

  if (!uid) {
    return NextResponse.json(
      { error: "Missing uid query parameter.", code: "invalid_uid" },
      { status: 400 },
    );
  }

  const gameId = game as ShowcaseGameId;
  const cacheKey = `showcase-${gameId}-${uid}`;
  const cached = getFromCache<Awaited<ReturnType<typeof fetchPlayerShowcase>>>(
    cacheKey,
  );

  if (cached) {
    return NextResponse.json(cached, {
      headers: { "X-Cache": "HIT" },
    });
  }

  try {
    const data = await fetchPlayerShowcase(gameId, uid);
    const ttlMs = Math.max(data.ttl, 30) * 1000;
    setInCache(cacheKey, data, ttlMs);

    return NextResponse.json(data, {
      headers: { "X-Cache": "MISS" },
    });
  } catch (error) {
    if (error instanceof ShowcaseFetchError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status >= 400 ? error.status : 502 },
      );
    }

    console.error(`Showcase fetch failed (${gameId}/${uid}):`, error);
    return NextResponse.json(
      {
        error: "Failed to load showcase data.",
        code: "upstream_error",
      },
      { status: 502 },
    );
  }
}
