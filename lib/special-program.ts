import { parseSingleDateFromText } from "@/lib/date-parse";
import type { NewsItem } from "@/lib/types";

export type SpecialProgramInfo = {
  announcement: NewsItem;
  airTime: number | null;
};

export function findUpcomingSpecialProgram(
  announcements: NewsItem[],
  now = Date.now(),
): SpecialProgramInfo | null {
  const programs = announcements.filter((item) => item.kind === "special_program");
  if (programs.length === 0) {
    return null;
  }

  let best: SpecialProgramInfo | null = null;

  for (const announcement of programs) {
    const text = `${announcement.title} ${announcement.description ?? ""}`;
    const airTime = parseSingleDateFromText(text);

    if (airTime !== null && airTime < now - 6 * 60 * 60 * 1000) {
      continue;
    }

    if (!best) {
      best = { announcement, airTime };
      continue;
    }

    const bestTime = best.airTime ?? Number.MAX_SAFE_INTEGER;
    const candidateTime = airTime ?? Number.MAX_SAFE_INTEGER;

    if (candidateTime < bestTime) {
      best = { announcement, airTime };
    }
  }

  return best ?? { announcement: programs[0], airTime: null };
}

export function isSpecialProgramLive(airTime: number | null, now = Date.now()): boolean {
  if (airTime === null) {
    return false;
  }
  const liveWindowMs = 3 * 60 * 60 * 1000;
  return now >= airTime && now <= airTime + liveWindowMs;
}
