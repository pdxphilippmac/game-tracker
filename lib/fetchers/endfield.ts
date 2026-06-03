import type { GameData } from "@/lib/types";
import { deriveEndfieldPatchStatus } from "@/lib/patch-status";
import { emptyGameData } from "@/lib/fetchers/empty-game-data";
import {
  extractEndfieldPatchInfo,
  fetchGryphlineArticles,
  mapGryphlineBanner,
  mapGryphlineEvent,
  mapGryphlineNewsItem,
  splitNewsItems,
} from "@/lib/fetchers/gryphline-news";

const NEWS_URL = "https://endfield.gryphline.com/en-us/news";

export async function fetchEndfieldData(): Promise<GameData> {
  try {
    const articles = await fetchGryphlineArticles();
    const mappedNews = articles.map(mapGryphlineNewsItem);
    const banners = articles
      .map(mapGryphlineBanner)
      .filter((banner): banner is NonNullable<typeof banner> => banner !== null);
    const events = articles
      .map(mapGryphlineEvent)
      .filter((event): event is NonNullable<typeof event> => event !== null);
    const { announcements, news } = splitNewsItems(mappedNews);
    const patchStatus = deriveEndfieldPatchStatus(
      extractEndfieldPatchInfo(articles)
    );

    return {
      game: "endfield",
      patchStatus,
      banners,
      events,
      challenges: [],
      announcements: announcements.slice(0, 10),
      news: news.slice(0, 10),
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Endfield fetch error:", error);
    return {
      ...emptyGameData("endfield", "Failed to fetch Endfield data from Gryphline"),
      news: [
        {
          id: "endfield-error",
          title: "Visit the official Endfield news page",
          category: "Info",
          kind: "general",
          date: new Date().toISOString(),
          url: NEWS_URL,
          description:
            "Could not load live Endfield news. The official site may be temporarily unavailable.",
        },
      ],
    };
  }
}
