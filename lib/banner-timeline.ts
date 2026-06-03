import type { Banner } from "@/lib/types";
import type { PatchStatus } from "@/lib/patch-types";
import { isRunningActivity, isUpcomingActivity } from "@/lib/activity-utils";

export type TimelineEntry = {
  id: string;
  label: string;
  featuredNames?: string[];
  startTime: number;
  endTime?: number;
  status: "past" | "active" | "upcoming";
};

export function buildBannerTimeline(
  patchStatus: PatchStatus | null,
  banners: Banner[],
  now = Date.now(),
): TimelineEntry[] {
  const entries: TimelineEntry[] = [];
  const seenStarts = new Set<number>();

  const characterBanners = banners.filter(
    (b) => b.characters.some((c) => c.rarity >= 5) || b.weapons.some((w) => w.rarity >= 5),
  );

  for (const banner of characterBanners) {
    if (seenStarts.has(banner.startTime)) {
      continue;
    }
    seenStarts.add(banner.startTime);

    const featured = [
      ...banner.characters.filter((c) => c.rarity >= 5).map((c) => c.name),
      ...banner.weapons.filter((w) => w.rarity >= 5).map((w) => w.name),
    ];

    let status: TimelineEntry["status"] = "upcoming";
    if (isRunningActivity(banner)) {
      status = "active";
    } else if (banner.endTime <= now) {
      status = "past";
    } else if (!isUpcomingActivity(banner) && banner.startTime <= now) {
      status = "past";
    }

    entries.push({
      id: String(banner.id),
      label: banner.name,
      featuredNames: featured.length > 0 ? featured : undefined,
      startTime: banner.startTime,
      endTime: banner.endTime,
      status,
    });
  }

  if (patchStatus?.nextVersion?.startTime && !seenStarts.has(patchStatus.nextVersion.startTime)) {
    entries.push({
      id: "next-version",
      label: patchStatus.nextVersion.versionName ?? patchStatus.nextVersion.label,
      startTime: patchStatus.nextVersion.startTime,
      status: "upcoming",
    });
  }

  return entries.sort((a, b) => a.startTime - b.startTime);
}
