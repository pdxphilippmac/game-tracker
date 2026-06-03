import type { GameData, GameEvent, NewsItem } from "@/lib/types";
import {
  fetchEnneadNews,
  mapEnneadNewsItem,
  type EnneadNewsItem,
} from "@/lib/fetchers/ennead-news";
import {
  fetchEnneadRedeemCodes,
  type EnneadGameSlug,
} from "@/lib/fetchers/redeem-codes";
import { isAnnouncementKind } from "@/lib/news-classify";
import { parseDateRangeFromText } from "@/lib/date-parse";
import { emptyGameData } from "@/lib/fetchers/empty-game-data";

type EnneadNewsGameConfig = {
  gameId: GameData["game"];
  enneadSlug: EnneadGameSlug;
  prefix: string;
};

function splitNewsItems(items: NewsItem[]): {
  announcements: NewsItem[];
  news: NewsItem[];
} {
  const announcements: NewsItem[] = [];
  const news: NewsItem[] = [];

  for (const item of items) {
    if (item.kind && isAnnouncementKind(item.kind)) {
      announcements.push(item);
    } else {
      news.push(item);
    }
  }

  return { announcements, news };
}

function parseEventFromNewsItem(item: EnneadNewsItem, prefix: string): GameEvent | null {
  const title = item.title ?? "";
  const description = item.description ?? "";
  const lowerTitle = title.toLowerCase();

  if (
    lowerTitle.includes("twitch drops") ||
    lowerTitle.includes("prize event") ||
    lowerTitle.startsWith("🎁")
  ) {
    return null;
  }

  const isInGameEvent =
    item.type === "event" ||
    lowerTitle.includes("event details") ||
    (lowerTitle.includes("event") &&
      !lowerTitle.includes("version") &&
      !lowerTitle.includes("update"));

  if (!isInGameEvent) {
    return null;
  }

  const range = parseDateRangeFromText(description);
  const startTime =
    range?.startTime ?? (item.created_at ? item.created_at * 1000 : Date.now());
  const endTime = range?.endTime ?? startTime + 14 * 24 * 60 * 60 * 1000;

  return {
    id: `${prefix}-event-${item.id}`,
    name: title.replace(/\[.*?\]\s*/g, "").replace(/ Event Details$/i, "").trim(),
    description: description || undefined,
    imageUrl: item.banner ?? undefined,
    type: "In-Game Event",
    startTime,
    endTime,
  };
}

export async function fetchEnneadNewsGameData({
  gameId,
  enneadSlug,
  prefix,
}: EnneadNewsGameConfig): Promise<GameData> {
  try {
    const [newsItems, redeemCodes] = await Promise.all([
      fetchEnneadNews(enneadSlug, ["info", "notices", "events"]),
      fetchEnneadRedeemCodes(enneadSlug),
    ]);

    const events: GameEvent[] = [];
    const mappedNews: NewsItem[] = [];

    for (const item of newsItems) {
      const event = parseEventFromNewsItem(item, prefix);
      if (event) {
        events.push(event);
      }

      mappedNews.push(mapEnneadNewsItem(item, prefix));
    }

    const { announcements, news } = splitNewsItems(mappedNews);

    return {
      game: gameId,
      patchStatus: null,
      banners: [],
      events: events.slice(0, 12),
      challenges: [],
      announcements: announcements.slice(0, 8),
      news: news.slice(0, 10),
      redeemCodes: redeemCodes.filter((code) => code.active),
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`${gameId} fetch error:`, error);
    return emptyGameData(gameId, `Failed to fetch ${gameId} data`);
  }
}
