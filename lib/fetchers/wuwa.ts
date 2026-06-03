import type {
  Banner,
  BannerCharacter,
  GameData,
  GameEvent,
  NewsItem,
} from "@/lib/types";
import { classifyAnnouncementKind, isAnnouncementKind } from "@/lib/news-classify";
import { parseDateRangeFromText } from "@/lib/date-parse";
import { deriveWuWaPatchStatus } from "@/lib/patch-status";
import { emptyGameData } from "@/lib/fetchers/empty-game-data";

const LAUNCHER_NEWS_URL =
  "https://prod-alicdn-gamestarter.kurogame.com/launcher/50004_obOHXFrFanqsaIEOmuKroCcbZkQRBC7c/G153/information/en.json";
const NEWS_BASE = "https://wutheringwaves.kurogames.com";

type LauncherContent = {
  content: string;
  jumpUrl: string;
  time: string;
};

type LauncherSection = {
  title: string;
  contents: LauncherContent[];
};

type LauncherResponse = {
  guidance: {
    activity: LauncherSection;
    notice: LauncherSection;
    news: LauncherSection;
  };
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

function extractBannerTitle(rawTitle: string): string {
  const bracketPrefix = rawTitle.match(/^\[(.+?)\]\s*(.*)$/);
  if (bracketPrefix) {
    const [, inner, rest] = bracketPrefix;
    const lowerInner = inner.toLowerCase();
    if (
      lowerInner.includes("version") ||
      lowerInner.includes("convene:") ||
      lowerInner.includes("phase")
    ) {
      return rest.trim() || inner.trim();
    }
    return rest ? `${inner.trim()} — ${rest.trim()}` : inner.trim();
  }

  return rawTitle.trim();
}

function extractFeaturedNames(rawTitle: string): string[] {
  const bracketMatch = rawTitle.match(/^\[(.+?)\]/);

  if (bracketMatch) {
    const inner = bracketMatch[1].trim();
    const lower = inner.toLowerCase();

    if (
      !lower.includes("convene") &&
      !lower.includes("version") &&
      !lower.includes("phase") &&
      !lower.includes("featured resonator/weapon")
    ) {
      return [inner];
    }
  }

  const cleaned = extractBannerTitle(rawTitle);
  const conveneMatch = cleaned.match(/:\s*(.+)$/);
  if (conveneMatch) {
    const suffix = conveneMatch[1].trim();
    if (!/phase\s*[ⅠIⅡ2-9]/i.test(suffix)) {
      return suffix
        .split(/[,&/]/)
        .map((part) => part.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function isConveneNotice(title: string): boolean {
  const lower = title.toLowerCase();
  return (
    lower.includes("convene") ||
    lower.includes("resonator/weapon") ||
    lower.includes("featured resonator")
  );
}

function mapLauncherItem(
  item: LauncherContent,
  category: string,
  index: number
): NewsItem {
  const title = extractBannerTitle(item.content);
  const kind = classifyAnnouncementKind(title, item.content);
  const detailId = item.jumpUrl.match(/detail\/(\d+)/)?.[1];
  const year = new Date().getFullYear();
  const [month, day] = item.time.split("-").map(Number);
  const date = new Date(year, month - 1, day).toISOString();

  return {
    id: `wuwa-${category}-${detailId ?? index}`,
    title,
    category,
    kind,
    date,
    url: item.jumpUrl.startsWith("http")
      ? item.jumpUrl
      : `${NEWS_BASE}${item.jumpUrl}`,
    description: item.content,
  };
}

function mapConveneBanner(item: LauncherContent, index: number): Banner {
  const title = extractBannerTitle(item.content);
  const names = extractFeaturedNames(item.content);
  const [month, day] = item.time.split("-").map(Number);
  const year = new Date().getFullYear();
  const startTime = Date.UTC(year, month - 1, day);
  const endTime = startTime + 21 * 24 * 60 * 60 * 1000;
  const isWeapon = title.toLowerCase().includes("weapon");

  const characters: BannerCharacter[] = names.map((name, nameIndex) => ({
    id: `wuwa-char-${index}-${nameIndex}`,
    name,
    icon: "",
    rarity: 5,
  }));

  return {
    id: `wuwa-banner-${item.jumpUrl.match(/detail\/(\d+)/)?.[1] ?? index}`,
    name: title,
    type: isWeapon ? "weapon" : "character",
    characters,
    weapons: [],
    startTime,
    endTime,
  };
}

function mapActivityEvent(item: NewsItem): GameEvent | null {
  if (item.kind !== "general") return null;

  const lower = item.title.toLowerCase();
  if (!lower.includes("event") || lower.includes("convene")) {
    return null;
  }

  const range = item.description ? parseDateRangeFromText(item.description) : null;
  const startTime = range?.startTime ?? new Date(item.date).getTime();
  const endTime = range?.endTime ?? startTime + 14 * 24 * 60 * 60 * 1000;

  return {
    id: item.id,
    name: item.title,
    description: item.description,
    type: "In-Game Event",
    startTime,
    endTime,
  };
}

export async function fetchWuWaData(): Promise<GameData> {
  try {
    const res = await fetch(LAUNCHER_NEWS_URL, {
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Launcher API returned ${res.status}`);
    }

    const data: LauncherResponse = await res.json();
    const notices = data.guidance.notice.contents ?? [];
    const newsItems = data.guidance.news.contents ?? [];
    const activities = data.guidance.activity.contents ?? [];

    const mappedNotices = notices.map((item, index) =>
      mapLauncherItem(item, "Notice", index)
    );
    const mappedNews = newsItems.map((item, index) =>
      mapLauncherItem(item, "News", index + notices.length)
    );
    const mappedActivities = activities.map((item, index) =>
      mapLauncherItem(item, "Activity", index + notices.length + newsItems.length)
    );

    const allItems = [...mappedNotices, ...mappedNews, ...mappedActivities];
    const banners = notices
      .filter((item) => isConveneNotice(item.content))
      .map(mapConveneBanner);
    const events = allItems
      .map(mapActivityEvent)
      .filter((event): event is GameEvent => event !== null);
    const { announcements, news } = splitNewsItems(allItems);
    const patchStatus = deriveWuWaPatchStatus(banners, allItems);

    return {
      game: "wuwa",
      patchStatus,
      banners,
      events,
      challenges: [],
      announcements: announcements.slice(0, 8),
      news: news.slice(0, 10),
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("WuWa fetch error:", error);
    return {
      ...emptyGameData("wuwa", "Failed to fetch WuWa data"),
      news: [
        {
          id: "wuwa-fallback",
          title: "Visit the official website for latest news",
          category: "Info",
          kind: "general",
          date: new Date().toISOString(),
          url: `${NEWS_BASE}/en/main/news`,
        },
      ],
    };
  }
}
