import type { Banner, Challenge, GameData, GameEvent } from "@/lib/types";

export type EndingSoonKind = "banner" | "event" | "challenge" | "patch";

export type EndingSoonItem = {
  id: string;
  kind: EndingSoonKind;
  name: string;
  endTime: number;
  scrollTargetId: string;
};

const DEFAULT_WINDOW_MS = 72 * 60 * 60 * 1000;

export function collectEndingSoonItems(
  data: GameData,
  windowMs = DEFAULT_WINDOW_MS,
  now = Date.now(),
): EndingSoonItem[] {
  const items: EndingSoonItem[] = [];

  for (const banner of data.banners) {
    if (banner.startTime <= now && banner.endTime > now && banner.endTime - now <= windowMs) {
      items.push({
        id: String(banner.id),
        kind: "banner",
        name: banner.name,
        endTime: banner.endTime,
        scrollTargetId: "banners",
      });
    }
  }

  for (const event of data.events) {
    if (event.startTime <= now && event.endTime > now && event.endTime - now <= windowMs) {
      items.push({
        id: String(event.id),
        kind: "event",
        name: event.name,
        endTime: event.endTime,
        scrollTargetId: "events",
      });
    }
  }

  for (const challenge of data.challenges) {
    if (
      challenge.startTime <= now &&
      challenge.endTime > now &&
      challenge.endTime - now <= windowMs
    ) {
      items.push({
        id: String(challenge.id),
        kind: "challenge",
        name: challenge.name,
        endTime: challenge.endTime,
        scrollTargetId: "challenges",
      });
    }
  }

  if (
    data.patchStatus?.patchEndTime &&
    data.patchStatus.patchEndTime > now &&
    data.patchStatus.patchEndTime - now <= windowMs
  ) {
    items.push({
      id: "patch-end",
      kind: "patch",
      name: `Patch ${data.patchStatus.currentVersion}`,
      endTime: data.patchStatus.patchEndTime,
      scrollTargetId: "patch-status",
    });
  }

  return items.sort((a, b) => a.endTime - b.endTime);
}

export const ENDING_SOON_KIND_LABELS: Record<EndingSoonKind, string> = {
  banner: "Banner",
  event: "Event",
  challenge: "Challenge",
  patch: "Patch",
};
