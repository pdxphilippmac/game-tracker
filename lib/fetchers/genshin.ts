import type {
  Banner,
  BannerCharacter,
  BannerWeapon,
  Challenge,
  GameData,
  GameEvent,
  NewsItem,
} from "@/lib/types";
import {
  fetchEnneadNews,
  mapEnneadNewsItem,
  type EnneadNewsItem,
} from "@/lib/fetchers/ennead-news";
import { fetchEnneadRedeemCodes } from "@/lib/fetchers/redeem-codes";
import { isAnnouncementKind } from "@/lib/news-classify";
import { parseDateRangeFromText } from "@/lib/date-parse";
import { deriveHSRPatchStatus } from "@/lib/patch-status";
import { buildActivityId } from "@/lib/activity-id";
import { emptyGameData } from "@/lib/fetchers/empty-game-data";
import { upstreamFetchInit } from "@/lib/fetch-config";

const API_BASE = "https://api.ennead.cc/mihoyo/genshin";

type GICharacter = {
  id: number;
  name: string;
  icon: string;
  element: string;
  rarity: number;
};

type GIWeapon = {
  id: number;
  name: string;
  icon: string;
  rarity: number;
};

type GIBanner = {
  id: number;
  name: string;
  version: string;
  characters: GICharacter[];
  weapons: GIWeapon[];
  start_time: number;
  end_time: number;
};

type GIReward = {
  id: number;
  name: string;
  icon: string;
  rarity: string;
  amount: number;
};

type GIEvent = {
  id: number;
  name: string;
  description: string;
  image_url: string;
  type_name: string;
  start_time: number;
  end_time: number;
  rewards?: GIReward[];
};

type GIChallenge = {
  id: number;
  name: string;
  type_name: string;
  start_time: number;
  end_time: number;
  rewards?: GIReward[];
};

type GICalendarResponse = {
  events: GIEvent[];
  banners: GIBanner[];
  challenges: GIChallenge[];
};

function mapCharacter(char: GICharacter): BannerCharacter {
  return {
    id: char.id,
    name: char.name,
    icon: char.icon,
    element: char.element,
    rarity: char.rarity,
  };
}

function mapWeapon(weapon: GIWeapon): BannerWeapon {
  return {
    id: weapon.id,
    name: weapon.name,
    icon: weapon.icon,
    rarity: weapon.rarity,
  };
}

function buildBannerName(banner: GIBanner): string {
  if (banner.name.trim()) return banner.name;

  const featuredChars = banner.characters
    .filter((c) => c.rarity >= 5)
    .map((c) => c.name);
  if (featuredChars.length > 0) {
    return featuredChars.join(" & ");
  }

  const featuredWeapons = banner.weapons
    .filter((w) => w.rarity >= 5)
    .map((w) => w.name);
  if (featuredWeapons.length > 0) {
    return featuredWeapons.slice(0, 2).join(" & ");
  }

  return `Version ${banner.version} Banner`;
}

function mapBanner(banner: GIBanner): Banner {
  const hasWeapons = banner.weapons.length > 0;
  const featuredChars = banner.characters.filter((c) => c.rarity >= 5);

  return {
    id: `genshin-banner-${banner.id}`,
    name: buildBannerName(banner),
    version: banner.version,
    type: hasWeapons && featuredChars.length === 0 ? "weapon" : "character",
    characters: banner.characters.map(mapCharacter),
    weapons: banner.weapons.map(mapWeapon),
    startTime: banner.start_time * 1000,
    endTime: banner.end_time * 1000,
  };
}

function mapReward(reward: GIReward) {
  return {
    id: reward.id,
    name: reward.name,
    icon: reward.icon,
    rarity: reward.rarity,
    amount: reward.amount,
  };
}

function mapEvent(event: GIEvent): GameEvent {
  return {
    id: buildActivityId("genshin", "event", event.id, event.start_time, event.name),
    name: event.name,
    description: event.description || undefined,
    imageUrl: event.image_url || undefined,
    type: formatActivityType(event.type_name),
    startTime: event.start_time * 1000,
    endTime: event.end_time * 1000,
    rewards: event.rewards?.map(mapReward),
  };
}

function mapChallenge(challenge: GIChallenge): Challenge {
  return {
    id: buildActivityId(
      "genshin",
      "challenge",
      challenge.id,
      challenge.start_time,
      challenge.name,
    ),
    name: challenge.name,
    type: formatActivityType(challenge.type_name),
    startTime: challenge.start_time * 1000,
    endTime: challenge.end_time * 1000,
    rewards: challenge.rewards?.map(mapReward),
  };
}

function formatActivityType(typeName: string): string {
  return typeName
    .replace(/^ActType|^ChallengeType/, "")
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
  const mapped = mapEnneadNewsItem(item, "genshin");
  const range = item.description ? parseDateRangeFromText(item.description) : null;

  if (range && mapped.kind === "banner_info") {
    mapped.description = [
      mapped.description,
      `Period: ${new Date(range.startTime).toLocaleString("en-US")} – ${new Date(range.endTime).toLocaleString("en-US")}`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  return mapped;
}

export async function fetchGenshinData(): Promise<GameData> {
  try {
    const [calendarRes, noticeItems, redeemCodes] = await Promise.all([
      fetch(`${API_BASE}/calendar?lang=en-us`, {
        ...upstreamFetchInit,
        headers: { Accept: "application/json" },
      }),
      fetchEnneadNews("genshin", ["notices", "info"]),
      fetchEnneadRedeemCodes("genshin"),
    ]);

    const banners: Banner[] = [];
    const events: GameEvent[] = [];
    const challenges: Challenge[] = [];

    if (calendarRes.ok) {
      const calendarData: GICalendarResponse = await calendarRes.json();

      banners.push(...(calendarData.banners ?? []).map(mapBanner));
      events.push(...(calendarData.events ?? []).map(mapEvent));
      challenges.push(...(calendarData.challenges ?? []).map(mapChallenge));
    }

    const allNews = noticeItems.map(mapNoticeItem);
    const { announcements, news } = splitNewsItems(allNews);
    const patchStatus = deriveHSRPatchStatus(banners, noticeItems);

    return {
      game: "genshin",
      patchStatus,
      banners,
      events,
      challenges,
      announcements: announcements.slice(0, 8),
      news: news.slice(0, 10),
      redeemCodes: redeemCodes.filter((code) => code.active),
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Genshin fetch error:", error);
    return emptyGameData("genshin", "Failed to fetch Genshin Impact data");
  }
}
