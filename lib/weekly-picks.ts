import { isActiveActivity, isRunningActivity } from "@/lib/activity-utils";
import type { Challenge, EventReward, GameEvent } from "@/lib/types";

export type WeeklyPick = {
  id: string;
  name: string;
  type: string;
  endTime: number;
  rewards: EventReward[];
  kind: "challenge" | "event";
};

export function collectWeeklyPicks(
  events: GameEvent[],
  challenges: Challenge[],
): WeeklyPick[] {
  const picks: WeeklyPick[] = [];

  for (const challenge of challenges) {
    if (!isRunningActivity(challenge) || !challenge.rewards?.length) {
      continue;
    }
    picks.push({
      id: String(challenge.id),
      name: challenge.name,
      type: challenge.type,
      endTime: challenge.endTime,
      rewards: challenge.rewards,
      kind: "challenge",
    });
  }

  for (const event of events) {
    if (!isActiveActivity(event) || !event.rewards?.length) {
      continue;
    }
    if (picks.some((pick) => pick.id === String(event.id))) {
      continue;
    }
    picks.push({
      id: String(event.id),
      name: event.name,
      type: event.type,
      endTime: event.endTime,
      rewards: event.rewards,
      kind: "event",
    });
  }

  return picks.sort((a, b) => a.endTime - b.endTime);
}
