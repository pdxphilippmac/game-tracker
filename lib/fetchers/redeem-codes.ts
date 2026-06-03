import { upstreamFetchInit } from "@/lib/fetch-config";
import type { RedeemCode } from "@/lib/types";

const API_BASE = "https://api.ennead.cc/mihoyo";

type EnneadCodesResponse = {
  active?: Array<{ code: string; rewards: string[] }>;
  inactive?: Array<{ code: string; rewards: string[] }>;
};

export type EnneadGameSlug =
  | "genshin"
  | "starrail"
  | "zenless"
  | "honkai"
  | "themis";

export async function fetchEnneadRedeemCodes(
  game: EnneadGameSlug,
): Promise<RedeemCode[]> {
  try {
    const res = await fetch(`${API_BASE}/${game}/codes`, {
      ...upstreamFetchInit,
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return [];
    }

    const data: EnneadCodesResponse = await res.json();
    const active = (data.active ?? []).map((entry) => ({
      code: entry.code,
      rewards: entry.rewards,
      active: true,
    }));
    const inactive = (data.inactive ?? []).map((entry) => ({
      code: entry.code,
      rewards: entry.rewards,
      active: false,
    }));

    return [...active, ...inactive];
  } catch {
    return [];
  }
}
