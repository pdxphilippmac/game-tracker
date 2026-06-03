import type { Banner, BannerCharacter, GameData, GameEvent, NewsItem } from "@/lib/types";
import {
  fetchEnneadNews,
  mapEnneadNewsItem,
  type EnneadNewsItem,
} from "@/lib/fetchers/ennead-news";
import {
  classifyAnnouncementKind,
  isAnnouncementKind,
} from "@/lib/news-classify";
import { parseDateRangeFromText, parseSingleDateFromText } from "@/lib/date-parse";
import { deriveZZYPatchStatus } from "@/lib/patch-status";
import { fetchEnneadRedeemCodes } from "@/lib/fetchers/redeem-codes";
import { emptyGameData } from "@/lib/fetchers/empty-game-data";

const DEFAULT_BANNER_DAYS = 21;

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

function extractQuotedNames(text: string): string[] {
  const matches = text.match(/"([^"]{2,40})"/g) ?? [];
  return matches.map((m) => m.replace(/"/g, ""));
}

function parseBannerFromNotice(item: EnneadNewsItem): Banner | null {
  const title = item.title ?? "";
  const description = item.description ?? "";
  const lowerTitle = title.toLowerCase();

  const isExclusiveChannel =
    lowerTitle.includes("exclusive channel") ||
    lowerTitle.includes("signal search showcase");

  const isBannerNotice =
    lowerTitle.includes("limited-time channel") ||
    isExclusiveChannel ||
    (lowerTitle.includes("signal search") && description.length > 0);

  if (!isBannerNotice && !description.toLowerCase().includes("signal search event")) {
    return null;
  }

  const range =
    parseDateRangeFromText(description) ??
    parseDateRangeFromText(title);

  const startTime =
    range?.startTime ??
    (item.created_at ? item.created_at * 1000 : Date.now());
  const endTime =
    range?.endTime ??
    startTime + DEFAULT_BANNER_DAYS * 24 * 60 * 60 * 1000;

  const quotedNames = extractQuotedNames(`${title} ${description}`);
  const channelName = extractQuotedNames(title)[0];
  const characters: BannerCharacter[] = [];

  if (channelName) {
    characters.push({
      id: `zzz-char-${item.id}-channel`,
      name: channelName,
      icon: item.banner ?? "",
      rarity: 5,
    });
  }

  for (const name of quotedNames) {
    if (name === channelName) continue;
    characters.push({
      id: `zzz-char-${item.id}-${name}`,
      name,
      icon: item.banner ?? "",
      rarity: 5,
    });
  }

  const isWeapon =
    lowerTitle.includes("w-engine") ||
    description.toLowerCase().includes("w-engine");

  const bannerName = isExclusiveChannel && channelName
    ? channelName
    : title.replace(/^V[\d.]+\s*/, "");

  return {
    id: `zzz-banner-${item.id}`,
    name: bannerName,
    type: isWeapon ? "weapon" : "character",
    characters,
    weapons: [],
    startTime,
    endTime,
    imageUrl: item.banner ?? undefined,
  };
}

function parseEventFromNewsItem(item: EnneadNewsItem): GameEvent | null {
  const title = item.title ?? "";
  const description = item.description ?? "";
  const lowerTitle = title.toLowerCase();

  if (
    lowerTitle.includes("prize event") ||
    lowerTitle.includes("twitch drops") ||
    lowerTitle.startsWith("🎁") ||
    lowerTitle.includes("playlist event")
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
    range?.startTime ??
    parseSingleDateFromText(description) ??
    (item.created_at ? item.created_at * 1000 : Date.now());
  const endTime =
    range?.endTime ??
    startTime + 14 * 24 * 60 * 60 * 1000;

  return {
    id: `zzz-event-${item.id}`,
    name: title.replace(/\[.*?\]\s*/g, "").replace(/ Event Details$/i, "").trim(),
    description: description || undefined,
    imageUrl: item.banner ?? undefined,
    type: "In-Game Event",
    startTime,
    endTime,
  };
}

function mapNewsWithKind(item: EnneadNewsItem, prefix: string): NewsItem {
  const mapped = mapEnneadNewsItem(item, prefix);
  const patchDate = item.description ? parseSingleDateFromText(item.description) : null;

  if (mapped.kind === "patch" && patchDate) {
    mapped.description = [
      mapped.description,
      `Update start: ${new Date(patchDate).toLocaleString("en-US", { timeZone: "Asia/Shanghai" })} (UTC+8)`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (mapped.kind === "special_program") {
    const airDate = parseSingleDateFromText(item.description);
    if (airDate) {
      mapped.description = [
        mapped.description,
        `Air time: ${new Date(airDate).toLocaleString("en-US", { timeZone: "Asia/Shanghai" })} (UTC+8)`,
      ]
        .filter(Boolean)
        .join("\n");
    }
  }

  return mapped;
}

export async function fetchZZZData(): Promise<GameData> {
  try {
    const [newsItems, redeemCodes] = await Promise.all([
      fetchEnneadNews("zenless", ["info", "notices", "events"]),
      fetchEnneadRedeemCodes("zenless"),
    ]);

    const banners: Banner[] = [];
    const events: GameEvent[] = [];
    const mappedNews: NewsItem[] = [];

    for (const item of newsItems) {
      const banner = parseBannerFromNotice(item);
      if (banner) {
        banners.push(banner);
      }

      const event = parseEventFromNewsItem(item);
      if (event) {
        events.push(event);
      }

      mappedNews.push(mapNewsWithKind(item, "zzz"));
    }

    const uniqueBanners = dedupeById(banners);
    const uniqueEvents = dedupeById(events);
    const { announcements, news } = splitNewsItems(mappedNews);
    const patchStatus = deriveZZYPatchStatus(uniqueBanners, newsItems);

    return {
      game: "zzz",
      patchStatus,
      banners: uniqueBanners,
      events: uniqueEvents.slice(0, 12),
      challenges: [],
      announcements: announcements.slice(0, 8),
      news: news.slice(0, 10),
      redeemCodes: redeemCodes.filter((code) => code.active),
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("ZZZ fetch error:", error);
    return emptyGameData("zzz", "Failed to fetch ZZZ data");
  }
}

function dedupeById<T extends { id: string | number }>(items: T[]): T[] {
  const seen = new Set<string | number>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
