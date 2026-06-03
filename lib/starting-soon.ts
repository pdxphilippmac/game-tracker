import { isUpcomingActivity } from "@/lib/activity-utils";
import type { Challenge, GameEvent } from "@/lib/types";

export type StartingSoonKind = "event" | "challenge";

export type StartingSoonItem = {
  id: string;
  kind: StartingSoonKind;
  name: string;
  startTime: number;
  scrollTargetId: string;
};

const DEFAULT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

function isStartingWithinWindow(
  item: { startTime: number; endTime: number },
  windowMs: number,
  now: number,
): boolean {
  return isUpcomingActivity(item) && item.startTime - now <= windowMs;
}

export function collectStartingSoonItems(
  events: GameEvent[],
  challenges: Challenge[],
  windowMs = DEFAULT_WINDOW_MS,
  now = Date.now(),
): StartingSoonItem[] {
  const items: StartingSoonItem[] = [];

  for (const event of events) {
    if (isStartingWithinWindow(event, windowMs, now)) {
      items.push({
        id: String(event.id),
        kind: "event",
        name: event.name,
        startTime: event.startTime,
        scrollTargetId: "events",
      });
    }
  }

  for (const challenge of challenges) {
    if (isStartingWithinWindow(challenge, windowMs, now)) {
      items.push({
        id: String(challenge.id),
        kind: "challenge",
        name: challenge.name,
        startTime: challenge.startTime,
        scrollTargetId: "challenges",
      });
    }
  }

  return items.sort((a, b) => a.startTime - b.startTime);
}

export const STARTING_SOON_KIND_LABELS: Record<StartingSoonKind, string> = {
  event: "Event",
  challenge: "Challenge",
};
