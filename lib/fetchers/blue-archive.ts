import type { Banner, BannerCharacter, GameData } from "@/lib/types";
import { upstreamFetchInit } from "@/lib/fetch-config";
import { emptyGameData } from "@/lib/fetchers/empty-game-data";

const API_BASE = "https://api.ennead.cc/buruaka";

type BlueArchiveBanner = {
  id: number;
  gachaType: string;
  startedAt: number;
  endedAt: number;
  rateups: string[];
};

type BlueArchiveBannerResponse = {
  current: BlueArchiveBanner[];
  upcoming: BlueArchiveBanner[];
  ended: BlueArchiveBanner[];
};

function mapBannerType(gachaType: string): Banner["type"] {
  if (gachaType.includes("Limited")) {
    return "limited";
  }
  if (gachaType.includes("Pickup")) {
    return "rerun";
  }
  return "character";
}

function mapBannerName(banner: BlueArchiveBanner): string {
  if (banner.rateups.length === 1) {
    return banner.rateups[0];
  }
  if (banner.rateups.length > 1) {
    return banner.rateups.join(" / ");
  }
  return banner.gachaType.replace(/Gacha$/, "").trim();
}

function mapRateups(banner: BlueArchiveBanner): BannerCharacter[] {
  const rarity = banner.gachaType.includes("Limited") ? 5 : 3;

  return banner.rateups.map((name, index) => ({
    id: `ba-char-${banner.id}-${index}`,
    name,
    rarity,
  }));
}

function mapBanner(banner: BlueArchiveBanner): Banner {
  return {
    id: `ba-banner-${banner.id}`,
    name: mapBannerName(banner),
    type: mapBannerType(banner.gachaType),
    characters: mapRateups(banner),
    weapons: [],
    startTime: banner.startedAt,
    endTime: banner.endedAt,
  };
}

export async function fetchBlueArchiveData(): Promise<GameData> {
  try {
    const res = await fetch(`${API_BASE}/banner`, {
      ...upstreamFetchInit,
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return emptyGameData("ba", "Failed to fetch Blue Archive banner data");
    }

    const data: BlueArchiveBannerResponse = await res.json();
    const banners = [
      ...(data.current ?? []),
      ...(data.upcoming ?? []),
    ].map(mapBanner);

    return {
      game: "ba",
      patchStatus: null,
      banners,
      events: [],
      challenges: [],
      announcements: [],
      news: [],
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Blue Archive fetch error:", error);
    return emptyGameData("ba", "Failed to fetch Blue Archive data");
  }
}
