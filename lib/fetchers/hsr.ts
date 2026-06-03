import type {
  Banner,
  BannerCharacter,
  BannerWeapon,
  Challenge,
  GameData,
  GameEvent,
  NewsItem,
} from "@/lib/types";
import { HSR_ELEMENTS, HSR_PATHS } from "@/lib/types";
import {
  fetchEnneadNews,
  mapEnneadNewsItem,
  type EnneadNewsItem,
} from "@/lib/fetchers/ennead-news";
import { isAnnouncementKind } from "@/lib/news-classify";
import { parseDateRangeFromText } from "@/lib/date-parse";
import { deriveHSRPatchStatus } from "@/lib/patch-status";
import { emptyGameData } from "@/lib/fetchers/empty-game-data";

const API_BASE = "https://api.ennead.cc/mihoyo/starrail";

type HSRCharacter = {
  id: number;
  name: string;
  icon: string;
  element: string;
  path: string;
  rarity: number;
};

type HSRLightCone = {
  id: number;
  name: string;
  icon: string;
  rarity: number;
};

type HSRBanner = {
  id: number;
  name: string;
  version: string;
  characters: HSRCharacter[];
  light_cones: HSRLightCone[];
  start_time: number;
  end_time: number;
};

type HSREvent = {
  id: number;
  name: string;
  description: string;
  image_url: string;
  type_name: string;
  start_time: number;
  end_time: number;
  rewards?: Array<{
    id: number;
    name: string;
    icon: string;
    rarity: string;
    amount: number;
  }>;
};

type HSRChallenge = {
  id: number;
  name: string;
  type_name: string;
  start_time: number;
  end_time: number;
  rewards?: Array<{
    id: number;
    name: string;
    icon: string;
    rarity: string;
    amount: number;
  }>;
};

type HSRCalendarResponse = {
  events: HSREvent[];
  banners: HSRBanner[];
  challenges: HSRChallenge[];
};

function mapCharacter(char: HSRCharacter): BannerCharacter {
  return {
    id: char.id,
    name: char.name,
    icon: char.icon,
    element: HSR_ELEMENTS[char.element] ?? char.element,
    path: HSR_PATHS[char.path] ?? char.path,
    rarity: char.rarity,
  };
}

function mapLightCone(cone: HSRLightCone): BannerWeapon {
  return {
    id: cone.id,
    name: cone.name,
    icon: cone.icon,
    rarity: cone.rarity,
  };
}

function buildBannerName(banner: HSRBanner): string {
  if (banner.name.trim()) return banner.name;

  const featuredChars = banner.characters
    .filter((c) => c.rarity >= 5)
    .map((c) => c.name);
  if (featuredChars.length > 0) {
    return featuredChars.join(" & ");
  }

  const featuredCones = banner.light_cones
    .filter((c) => c.rarity >= 5)
    .map((c) => c.name);
  if (featuredCones.length > 0) {
    return featuredCones.slice(0, 2).join(" & ");
  }

  return `Version ${banner.version} Banner`;
}

function mapBanner(banner: HSRBanner): Banner {
  const hasLightCones = banner.light_cones.length > 0;
  const featuredChars = banner.characters.filter((c) => c.rarity >= 5);

  return {
    id: `hsr-banner-${banner.id}`,
    name: buildBannerName(banner),
    version: banner.version,
    type: hasLightCones && featuredChars.length === 0 ? "weapon" : "character",
    characters: banner.characters.map(mapCharacter),
    weapons: banner.light_cones.map(mapLightCone),
    startTime: banner.start_time * 1000,
    endTime: banner.end_time * 1000,
  };
}

function mapEvent(event: HSREvent): GameEvent {
  return {
    id: `hsr-event-${event.id}`,
    name: event.name,
    description: event.description || undefined,
    imageUrl: event.image_url || undefined,
    type: formatActivityType(event.type_name),
    startTime: event.start_time * 1000,
    endTime: event.end_time * 1000,
    rewards: event.rewards?.map((reward) => ({
      id: reward.id,
      name: reward.name,
      icon: reward.icon,
      rarity: reward.rarity,
      amount: reward.amount,
    })),
  };
}

function mapChallenge(challenge: HSRChallenge): Challenge {
  return {
    id: `hsr-challenge-${challenge.id}`,
    name: challenge.name,
    type: formatActivityType(challenge.type_name),
    startTime: challenge.start_time * 1000,
    endTime: challenge.end_time * 1000,
  };
}

function formatActivityType(typeName: string): string {
  return typeName
    .replace(/^ActivityType|^ChallengeType/, "")
    .replace(/([A-Z])/g, " $1")
    .trim();
}

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

function mapNoticeItem(item: EnneadNewsItem): NewsItem {
  const mapped = mapEnneadNewsItem(item, "hsr");
  const range = item.description ? parseDateRangeFromText(item.description) : null;

  if (range && mapped.kind === "banner_info") {
    mapped.description = [
      mapped.description,
      `Period: ${new Date(range.startTime).toLocaleString("de-DE")} – ${new Date(range.endTime).toLocaleString("de-DE")}`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  return mapped;
}

export async function fetchHSRData(): Promise<GameData> {
  try {
    const [calendarRes, noticeItems] = await Promise.all([
      fetch(`${API_BASE}/calendar?lang=en-us`, {
        next: { revalidate: 3600 },
        headers: { Accept: "application/json" },
      }),
      fetchEnneadNews("starrail", ["notices", "info"]),
    ]);

    const banners: Banner[] = [];
    const events: GameEvent[] = [];
    const challenges: Challenge[] = [];

    if (calendarRes.ok) {
      const calendarData: HSRCalendarResponse = await calendarRes.json();

      banners.push(...(calendarData.banners ?? []).map(mapBanner));
      events.push(...(calendarData.events ?? []).map(mapEvent));
      challenges.push(...(calendarData.challenges ?? []).map(mapChallenge));
    }

    const allNews = noticeItems.map(mapNoticeItem);
    const { announcements, news } = splitNewsItems(allNews);
    const patchStatus = deriveHSRPatchStatus(banners, noticeItems);

    return {
      game: "hsr",
      patchStatus,
      banners,
      events,
      challenges,
      announcements: announcements.slice(0, 8),
      news: news.slice(0, 10),
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("HSR fetch error:", error);
    return emptyGameData("hsr", "Failed to fetch HSR data");
  }
}
