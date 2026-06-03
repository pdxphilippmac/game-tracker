import type { NewsItem } from "@/lib/types";
import { classifyAnnouncementKind } from "@/lib/news-classify";
import { upstreamFetchInit } from "@/lib/fetch-config";

export type EnneadNewsItem = {
  id: string;
  title: string;
  description: string;
  created_at: number;
  banner: string | null;
  url: string;
  type: string;
};

const API_BASE = "https://api.ennead.cc/mihoyo";

export async function fetchEnneadNews(
  game: "starrail" | "zenless",
  endpoints: Array<"info" | "notices" | "events"> = ["info", "notices", "events"]
): Promise<EnneadNewsItem[]> {
  const results: EnneadNewsItem[] = [];

  await Promise.all(
    endpoints.map(async (endpoint) => {
      try {
        const res = await fetch(`${API_BASE}/${game}/news/${endpoint}?lang=en-us`, {
          ...upstreamFetchInit,
          headers: { Accept: "application/json" },
        });

        if (!res.ok) return;

        const data: EnneadNewsItem[] = await res.json();
        if (Array.isArray(data)) {
          results.push(...data);
        }
      } catch {
        // upstream may fail for individual endpoints
      }
    })
  );

  return results;
}

export function mapEnneadNewsItem(item: EnneadNewsItem, prefix: string): NewsItem {
  const kind = classifyAnnouncementKind(item.title, item.description);

  return {
    id: `${prefix}-${item.id}`,
    title: item.title,
    category: item.type,
    kind,
    date: item.created_at
      ? new Date(item.created_at * 1000).toISOString()
      : new Date().toISOString(),
    url: item.url,
    thumbnail: item.banner ?? undefined,
    description: item.description || undefined,
  };
}
