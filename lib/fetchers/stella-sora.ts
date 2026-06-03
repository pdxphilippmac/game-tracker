import type { Banner, BannerCharacter, GameData, GameEvent, NewsItem } from "@/lib/types";
import { classifyAnnouncementKind, isAnnouncementKind } from "@/lib/news-classify";
import { upstreamFetchInit } from "@/lib/fetch-config";
import { emptyGameData } from "@/lib/fetchers/empty-game-data";

const API_BASE = "https://api.ennead.cc/stella";
const ASSET_BASE = "https://api.ennead.cc";

type StellaRateUpEntry = {
  id: number;
  name: string;
  element?: string;
};

type StellaBanner = {
  id: number;
  name: string;
  bannerType: string;
  element: string | null;
  startTime: string;
  endTime: string;
  assets?: {
    banner?: string;
    cover?: string;
    tabIcon?: string;
  };
  rateUp?: {
    fiveStar?: { entries?: StellaRateUpEntry[] };
    fourStar?: { entries?: StellaRateUpEntry[] };
  };
};

type StellaBannerResponse = {
  current: StellaBanner[];
  upcoming: StellaBanner[];
  permanent?: StellaBanner[];
  ended?: StellaBanner[];
};

type StellaEvent = {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  textures?: {
    banner?: string;
  };
};

type StellaEventResponse = {
  current: StellaEvent[];
  upcoming?: StellaEvent[];
};

type StellaNewsRow = {
  id: number;
  title: string;
  description?: string;
  link: string;
  publishTime: number;
  thumbnail?: string;
  type: string;
  typeLabel?: string;
};

type StellaNewsResponse = {
  code: number;
  data?: {
    rows?: StellaNewsRow[];
  };
};

const NEWS_CATEGORIES = ["updates", "notices", "news", "events"] as const;

function resolveAsset(path: string | undefined): string | undefined {
  if (!path) {
    return undefined;
  }
  if (path.startsWith("http")) {
    return path;
  }
  return `${ASSET_BASE}${path}`;
}

function parseIsoTime(iso: string): number {
  return new Date(iso).getTime();
}

function mapBannerCharacters(banner: StellaBanner): BannerCharacter[] {
  const characters: BannerCharacter[] = [];

  for (const entry of banner.rateUp?.fiveStar?.entries ?? []) {
    characters.push({
      id: `stella-char-${entry.id}`,
      name: entry.name,
      element: entry.element,
      rarity: 5,
    });
  }

  for (const entry of banner.rateUp?.fourStar?.entries ?? []) {
    characters.push({
      id: `stella-char-${entry.id}`,
      name: entry.name,
      element: entry.element,
      rarity: 4,
    });
  }

  return characters;
}

function mapBannerType(bannerType: string): Banner["type"] {
  const lower = bannerType.toLowerCase();
  if (lower.includes("disc")) {
    return "weapon";
  }
  if (lower.includes("limited")) {
    return "limited";
  }
  if (lower.includes("standard") || lower.includes("permanent")) {
    return "standard";
  }
  return "character";
}

function mapBanner(banner: StellaBanner): Banner {
  return {
    id: `stella-banner-${banner.id}`,
    name: banner.name,
    type: mapBannerType(banner.bannerType),
    characters: mapBannerCharacters(banner),
    weapons: [],
    startTime: parseIsoTime(banner.startTime),
    endTime: parseIsoTime(banner.endTime),
    imageUrl: resolveAsset(banner.assets?.banner ?? banner.assets?.cover),
  };
}

function mapEvent(event: StellaEvent): GameEvent {
  return {
    id: `stella-event-${event.id}`,
    name: event.title,
    description: event.description,
    imageUrl: resolveAsset(event.textures?.banner),
    type: "In-Game Event",
    startTime: parseIsoTime(event.startTime),
    endTime: parseIsoTime(event.endTime),
  };
}

function mapNewsItem(row: StellaNewsRow): NewsItem {
  const kind = classifyAnnouncementKind(row.title, row.description ?? "");

  return {
    id: `stella-${row.id}`,
    title: row.title,
    category: row.typeLabel ?? row.type,
    kind,
    date: new Date(row.publishTime).toISOString(),
    url: row.link,
    thumbnail: row.thumbnail,
    description: row.description,
  };
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

async function fetchStellaNews(): Promise<NewsItem[]> {
  const byId = new Map<string, NewsItem>();

  await Promise.all(
    NEWS_CATEGORIES.map(async (category) => {
      try {
        const res = await fetch(`${API_BASE}/news/${category}?size=10`, {
          ...upstreamFetchInit,
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          return;
        }

        const data: StellaNewsResponse = await res.json();
        for (const row of data.data?.rows ?? []) {
          const item = mapNewsItem(row);
          byId.set(item.id, item);
        }
      } catch {
        // ignore individual category failures
      }
    }),
  );

  return [...byId.values()].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export async function fetchStellaSoraData(): Promise<GameData> {
  try {
    const [bannerRes, eventRes, newsItems] = await Promise.all([
      fetch(`${API_BASE}/banners`, {
        ...upstreamFetchInit,
        headers: { Accept: "application/json" },
      }),
      fetch(`${API_BASE}/events`, {
        ...upstreamFetchInit,
        headers: { Accept: "application/json" },
      }),
      fetchStellaNews(),
    ]);

    const banners: Banner[] = [];
    const events: GameEvent[] = [];

    if (bannerRes.ok) {
      const bannerData: StellaBannerResponse = await bannerRes.json();
      banners.push(
        ...(bannerData.current ?? []).map(mapBanner),
        ...(bannerData.upcoming ?? []).map(mapBanner),
      );
    }

    if (eventRes.ok) {
      const eventData: StellaEventResponse = await eventRes.json();
      events.push(
        ...(eventData.current ?? []).map(mapEvent),
        ...(eventData.upcoming ?? []).map(mapEvent),
      );
    }

    const { announcements, news } = splitNewsItems(newsItems);

    return {
      game: "stella",
      patchStatus: null,
      banners,
      events: events.slice(0, 12),
      challenges: [],
      announcements: announcements.slice(0, 8),
      news: news.slice(0, 10),
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Stella Sora fetch error:", error);
    return emptyGameData("stella", "Failed to fetch Stella Sora data");
  }
}
