import type { Banner, GameEvent, NewsItem } from "@/lib/types";
import type { GryphlineArticle } from "@/lib/fetchers/gryphline-types";
import { classifyAnnouncementKind, isAnnouncementKind } from "@/lib/news-classify";
import { parseDateRangeFromText, parseSingleDateFromText } from "@/lib/date-parse";
import { decodeRscString, stripHtml } from "@/lib/html-utils";

const NEWS_URL = "https://endfield.gryphline.com/en-us/news";
const ARTICLE_URL = "https://endfield.gryphline.com/en-us/news";

const ARTICLE_PATTERN =
  /\{"cid":"([^"]+)","tab":"([^"]+)","sticky":(?:true|false),"title":"((?:\\.|[^"\\])*)","author":"[^"]*","displayTime":(\d+),"cover":"((?:\\.|[^"\\])*)","extraCover":"[^"]*","brief":"((?:\\.|[^"\\])*)"\}/g;

const MONTH_DATE_PATTERN =
  /(?:After[^–-]*–\s*)?(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s+(\d{4})(?:\s+at\s+(\d{1,2}):(\d{2}))?/gi;

const MONTHS: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

export async function fetchGryphlineArticles(): Promise<GryphlineArticle[]> {
  const res = await fetch(NEWS_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Gryphline news page returned ${res.status}`);
  }

  const html = await res.text();
  const chunks = [...html.matchAll(/self\.__next_f\.push\(\[1,"(.*?)"\]\)/g)].map(
    (match) => match[1]
  );
  const payload = chunks
    .map((chunk) => decodeRscString(chunk))
    .join("\n");

  const articles: GryphlineArticle[] = [];
  for (const match of payload.matchAll(ARTICLE_PATTERN)) {
    articles.push({
      cid: match[1],
      tab: match[2],
      title: decodeRscString(match[3]),
      displayTime: Number.parseInt(match[4], 10) * 1000,
      cover: decodeRscString(match[5]),
      brief: stripHtml(decodeRscString(match[6])),
      url: `${ARTICLE_URL}/${match[1]}`,
    });
  }

  const detailTargets = articles
    .filter((article) => shouldFetchDetail(article.title))
    .slice(0, 6);

  await Promise.all(
    detailTargets.map(async (article) => {
      const detail = await fetchGryphlineArticleDetail(article.cid);
      if (detail && isUsableArticleText(detail.text)) {
        article.detailText = detail.text;
        article.detailHtml = detail.html;
      }
    })
  );

  return articles;
}

async function fetchGryphlineArticleDetail(
  cid: string
): Promise<{ text: string; html: string } | null> {
  try {
    const res = await fetch(`${ARTICLE_URL}/${cid}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    const html = await res.text();
    const chunks = [...html.matchAll(/self\.__next_f\.push\(\[1,"(.*?)"\]\)/g)].map(
      (match) => match[1]
    );
    const payload = chunks.map((chunk) => decodeRscString(chunk)).join("\n");
    const contentHtml = extractArticleHtmlFromRscPayload(payload);

    if (!contentHtml) return null;

    return {
      html: contentHtml,
      text: stripHtml(contentHtml),
    };
  } catch {
    return null;
  }
}

function extractBannerCharacterNames(text: string): string[] {
  const includeMatch = text.match(/include:\s*([^.\n]+)/i);
  if (includeMatch) {
    return includeMatch[1]
      .split(/\s*\/\s*/)
      .map((name) => name.trim())
      .filter((name) => name.length > 0 && name.length <= 40);
  }

  const operatorMatches = [...text.matchAll(/6★ operator \[([^\]]+)\]/gi)].map(
    (match) => match[1]
  );
  if (operatorMatches.length > 0) {
    return operatorMatches;
  }

  return [...text.matchAll(/\[([^\]]+)\]/g)]
    .map((match) => match[1])
    .filter(
      (name) =>
        name.length <= 40 &&
        !/headhunting|issue|fest of|fists of|scarlet knot|chartered|special headhunting|version|endfield|operators? that may appear|shimmering moment|aic quota/i.test(
          name
        )
    );
}

function extractArticleHtmlFromRscPayload(payload: string): string | null {
  const match = payload.match(/(<p>Dear Endministrator(?:[\s\S]*?<\/p>)+)/);
  if (!match) {
    const legacyMatch = payload.match(/T\d+,((?:<p>[\s\S]*?<\/p>)+)/);
    if (!legacyMatch) return null;
    return legacyMatch[1];
  }

  return match[1];
}

function isUsableArticleText(text: string): boolean {
  return (
    text.length > 80 &&
    !text.includes("width=device-width") &&
    !text.includes("initial-scale=1")
  );
}

function shouldFetchDetail(title: string): boolean {
  const lower = title.toLowerCase();
  return (
    lower.includes("headhunting") ||
    lower.includes("version") ||
    lower.includes("pre-download") ||
    lower.includes("dev comm") ||
    lower.includes("lto") ||
    lower.includes("update notice")
  );
}

export function mapGryphlineNewsItem(article: GryphlineArticle): NewsItem {
  const description = article.detailText ?? article.brief;
  return {
    id: `endfield-${article.cid}`,
    title: article.title,
    category: article.tab,
    kind: classifyAnnouncementKind(article.title, description),
    date: new Date(article.displayTime).toISOString(),
    url: article.url,
    thumbnail: article.cover || undefined,
    description,
  };
}

export function mapGryphlineBanner(article: GryphlineArticle): Banner | null {
  const lower = article.title.toLowerCase();
  if (
    !lower.includes("headhunting") &&
    !lower.includes("lto") &&
    !lower.includes("convene")
  ) {
    return null;
  }

  const text = article.detailText ?? article.brief;
  const range = parseDateRangeFromText(text) ?? parseEnglishDateRange(text);
  const startTime = range?.startTime ?? article.displayTime;
  const endTime = range?.endTime ?? startTime + 21 * 24 * 60 * 60 * 1000;
  const names = extractBannerCharacterNames(text);

  return {
    id: `endfield-banner-${article.cid}`,
    name: article.title,
    type: lower.includes("weapon") || lower.includes("lto") ? "weapon" : "character",
    characters: names.slice(0, 4).map((name, index) => ({
      id: `${article.cid}-${index}`,
      name,
      rarity: 5,
    })),
    weapons: [],
    startTime,
    endTime,
    imageUrl: article.cover,
  };
}

export function mapGryphlineEvent(article: GryphlineArticle): GameEvent | null {
  if (article.tab !== "events") return null;

  const text = article.detailText ?? article.brief;
  const range = parseDateRangeFromText(text) ?? parseEnglishDateRange(text);
  const startTime = range?.startTime ?? article.displayTime;
  const endTime = range?.endTime ?? startTime + 14 * 24 * 60 * 60 * 1000;

  return {
    id: `endfield-event-${article.cid}`,
    name: article.title,
    description: text || undefined,
    imageUrl: article.cover,
    type: "In-Game Event",
    startTime,
    endTime,
  };
}

export function extractEndfieldPatchInfo(articles: GryphlineArticle[]): {
  currentVersionName?: string;
  nextVersionName?: string;
  patchStartTime?: number;
  patchEndTime?: number;
  nextVersionStartTime?: number;
} {
  const current = articles.find((article) =>
    /version update notes/i.test(article.title)
  );
  const next = articles.find((article) =>
    /pre-download|update notice/i.test(article.title) &&
    /version/i.test(article.title)
  );
  const launchReference = articles.find((article) =>
    /launch of the \[/i.test(`${article.brief} ${article.detailText ?? ""}`)
  );
  const devComm = articles.find((article) => /dev comm/i.test(article.title));
  const launchMatch = (
    launchReference?.detailText ??
    launchReference?.brief ??
    devComm?.detailText ??
    devComm?.brief ??
    ""
  ).match(/launch of the \[([^\]]+)\]/i);

  const currentVersionName =
    current?.title.match(/\[([^\]]+)\]/)?.[1] ?? launchMatch?.[1];
  const nextVersionName =
    next?.title.match(/\[([^\]]+)\]/)?.[1] ??
    extractVersionFromTitle(next?.title ?? "").versionName;

  const nextText = next?.detailText ?? next?.brief ?? "";
  const maintenanceMatch = nextText.match(
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\s+at\s+\d{1,2}:\d{2}\s+\(UTC\+8\)/i
  );
  const nextVersionStartTime =
    (maintenanceMatch ? parseFirstEnglishDate(maintenanceMatch[0]) : undefined) ??
    parseSingleDateFromText(nextText) ??
    parseEnglishDateRange(nextText)?.startTime ??
    parseFirstEnglishDate(nextText);

  return {
    currentVersionName,
    nextVersionName,
    patchStartTime: current?.displayTime ?? launchReference?.displayTime,
    patchEndTime: nextVersionStartTime,
    nextVersionStartTime,
  };
}

function extractVersionFromTitle(title: string): { versionName?: string } {
  const match = title.match(/\[([^\]]+)\]/);
  return match ? { versionName: match[1] } : {};
}

function parseEnglishDateRange(text: string): ReturnType<typeof parseDateRangeFromText> {
  const matches = [...text.matchAll(MONTH_DATE_PATTERN)];
  if (matches.length >= 2) {
    return {
      startTime: englishDateToMs(matches[0]),
      endTime: englishDateToMs(matches[1]),
    };
  }

  if (matches.length === 1) {
    const startTime = englishDateToMs(matches[0]);
    return { startTime, endTime: startTime + 21 * 24 * 60 * 60 * 1000 };
  }

  return null;
}

function parseFirstEnglishDate(text: string): number | undefined {
  const match = text.match(MONTH_DATE_PATTERN);
  return match ? englishDateToMs(match) : undefined;
}

function englishDateToMs(match: RegExpMatchArray): number {
  const month = MONTHS[match[1].toLowerCase()];
  const day = Number.parseInt(match[2], 10);
  const year = Number.parseInt(match[3], 10);
  const hours = match[4] ? Number.parseInt(match[4], 10) : 0;
  const minutes = match[5] ? Number.parseInt(match[5], 10) : 0;
  return Date.UTC(year, month, day, hours - 8, minutes);
}

export function splitNewsItems(items: NewsItem[]): {
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
