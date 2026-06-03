import type { Challenge, GameEvent } from "@/lib/types";

export function isActiveActivity(item: {
  startTime: number;
  endTime: number;
}): boolean {
  const now = Date.now();
  return item.endTime > now && item.startTime <= now + 7 * 24 * 60 * 60 * 1000;
}

export function isUpcomingActivity(item: {
  startTime: number;
  endTime: number;
}): boolean {
  return item.startTime > Date.now() && item.endTime > Date.now();
}

export function sortByEndTime<T extends { endTime: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.endTime - b.endTime);
}

export type TimedActivity = GameEvent | Challenge;

export function getActivityEndTime(activity: TimedActivity): number {
  return activity.endTime;
}

export function getActivityStartTime(activity: TimedActivity): number {
  return activity.startTime;
}
