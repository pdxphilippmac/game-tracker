import { buildBannerTimeline, type TimelineEntry } from "@/lib/banner-timeline";
import { collectEndingSoonItems, ENDING_SOON_KIND_LABELS, type EndingSoonKind } from "@/lib/ending-soon";
import { collectStartingSoonItems, STARTING_SOON_KIND_LABELS, type StartingSoonKind } from "@/lib/starting-soon";
import { findUpcomingSpecialProgram, isSpecialProgramLive } from "@/lib/special-program";
import { isRunningActivity } from "@/lib/activity-utils";
import { GAME_CONFIG } from "@/lib/game-config";
import type { GameData, GameId, RedeemCode } from "@/lib/types";

export type CrossGameAlertKind = EndingSoonKind | StartingSoonKind | "special_program" | "code";

export type CrossGameAlert = {
  id: string;
  gameId: GameId;
  kind: CrossGameAlertKind;
  name: string;
  time: number;
  timeType: "end" | "start" | "air";
  url?: string;
};

export type CrossGameTimelineEntry = {
  id: string;
  gameId: GameId;
  category: "banner" | "event" | "challenge" | "patch" | "special_program";
  label: string;
  sublabel?: string;
  startTime: number;
  endTime: number;
  status: TimelineEntry["status"];
};

export type GameSnapshot = {
  gameId: GameId;
  name: string;
  shortName: string;
  activeBanners: number;
  activeEvents: number;
  activeCodes: number;
  patchVersion?: string;
  hasError: boolean;
};

export const CROSS_GAME_ALERT_LABELS: Record<CrossGameAlertKind, string> = {
  ...ENDING_SOON_KIND_LABELS,
  ...STARTING_SOON_KIND_LABELS,
  special_program: "Special Program",
  code: "Redeem Code",
};

export function collectCrossGameAlerts(
  allData: GameData[],
  now = Date.now(),
): CrossGameAlert[] {
  const alerts: CrossGameAlert[] = [];

  for (const data of allData) {
    for (const item of collectEndingSoonItems(data)) {
      alerts.push({
        id: `${data.game}-end-${item.id}`,
        gameId: data.game,
        kind: item.kind,
        name: item.name,
        time: item.endTime,
        timeType: "end",
      });
    }

    for (const item of collectStartingSoonItems(data.events, data.challenges)) {
      alerts.push({
        id: `${data.game}-start-${item.id}`,
        gameId: data.game,
        kind: item.kind,
        name: item.name,
        time: item.startTime,
        timeType: "start",
      });
    }

    const program = findUpcomingSpecialProgram(data.announcements, now);
    if (program) {
      const airTime = program.airTime ?? now;
      if (program.airTime === null || program.airTime >= now - 6 * 60 * 60 * 1000) {
        alerts.push({
          id: `${data.game}-special-${program.announcement.id}`,
          gameId: data.game,
          kind: "special_program",
          name: program.announcement.title,
          time: airTime,
          timeType: "air",
          url: program.announcement.url,
        });
      }
    }

    for (const code of data.redeemCodes ?? []) {
      if (!code.active) continue;
      alerts.push({
        id: `${data.game}-code-${code.code}`,
        gameId: data.game,
        kind: "code",
        name: code.code,
        time: now,
        timeType: "air",
      });
    }
  }

  return alerts.sort((a, b) => {
    if (a.timeType === "end" && b.timeType !== "end") return -1;
    if (b.timeType === "end" && a.timeType !== "end") return 1;
    return a.time - b.time;
  });
}

export function buildCrossGameTimeline(
  allData: GameData[],
  windowDays = 30,
  now = Date.now(),
): CrossGameTimelineEntry[] {
  const windowStart = now - 3 * 24 * 60 * 60 * 1000;
  const windowEnd = now + windowDays * 24 * 60 * 60 * 1000;
  const entries: CrossGameTimelineEntry[] = [];

  for (const data of allData) {
    for (const banner of buildBannerTimeline(data.patchStatus, data.banners, now)) {
      const endTime = banner.endTime ?? banner.startTime + 21 * 24 * 60 * 60 * 1000;
      if (endTime < windowStart || banner.startTime > windowEnd) continue;

      entries.push({
        id: `${data.game}-${banner.id}`,
        gameId: data.game,
        category: "banner",
        label: banner.label,
        sublabel: banner.featuredNames?.join(" · "),
        startTime: banner.startTime,
        endTime,
        status: banner.status,
      });
    }

    for (const event of data.events) {
      if (event.endTime < windowStart || event.startTime > windowEnd) continue;
      entries.push({
        id: `${data.game}-event-${event.id}`,
        gameId: data.game,
        category: "event",
        label: event.name,
        sublabel: event.type,
        startTime: event.startTime,
        endTime: event.endTime,
        status: getTimedStatus(event.startTime, event.endTime, now),
      });
    }

    for (const challenge of data.challenges) {
      if (challenge.endTime < windowStart || challenge.startTime > windowEnd) continue;
      entries.push({
        id: `${data.game}-challenge-${challenge.id}`,
        gameId: data.game,
        category: "challenge",
        label: challenge.name,
        sublabel: challenge.type,
        startTime: challenge.startTime,
        endTime: challenge.endTime,
        status: getTimedStatus(challenge.startTime, challenge.endTime, now),
      });
    }

    const program = findUpcomingSpecialProgram(data.announcements, now);
    if (program?.airTime && program.airTime >= windowStart && program.airTime <= windowEnd) {
      entries.push({
        id: `${data.game}-special-${program.announcement.id}`,
        gameId: data.game,
        category: "special_program",
        label: program.announcement.title,
        startTime: program.airTime,
        endTime: program.airTime + 3 * 60 * 60 * 1000,
        status: isSpecialProgramLive(program.airTime, now) ? "active" : "upcoming",
      });
    }

    if (
      data.patchStatus?.patchEndTime &&
      data.patchStatus.patchEndTime >= windowStart &&
      data.patchStatus.patchEndTime <= windowEnd
    ) {
      entries.push({
        id: `${data.game}-patch-end`,
        gameId: data.game,
        category: "patch",
        label: `Patch ${data.patchStatus.currentVersion} ends`,
        startTime: data.patchStatus.patchStartTime ?? data.patchStatus.patchEndTime - 42 * 24 * 60 * 60 * 1000,
        endTime: data.patchStatus.patchEndTime,
        status: getTimedStatus(
          data.patchStatus.patchStartTime ?? 0,
          data.patchStatus.patchEndTime,
          now,
        ),
      });
    }
  }

  return entries.sort((a, b) => a.startTime - b.startTime);
}

export function buildGameSnapshots(allData: GameData[]): GameSnapshot[] {
  return allData.map((data) => {
    const config = GAME_CONFIG[data.game];
    return {
      gameId: data.game,
      name: config.name,
      shortName: config.shortName,
      activeBanners: data.banners.filter(isRunningActivity).length,
      activeEvents: data.events.filter(isRunningActivity).length,
      activeCodes: data.redeemCodes?.filter((c) => c.active).length ?? 0,
      patchVersion: data.patchStatus?.currentVersion,
      hasError: Boolean(data.error),
    };
  });
}

export function collectAllRedeemCodes(allData: GameData[]): Array<RedeemCode & { gameId: GameId }> {
  return allData.flatMap((data) =>
    (data.redeemCodes ?? [])
      .filter((code) => code.active)
      .map((code) => ({ ...code, gameId: data.game })),
  );
}

function getTimedStatus(
  startTime: number,
  endTime: number,
  now: number,
): TimelineEntry["status"] {
  if (startTime <= now && endTime > now) return "active";
  if (endTime <= now) return "past";
  return "upcoming";
}

export function getTimelineWindow(windowDays: number, now = Date.now()) {
  return {
    start: now - 3 * 24 * 60 * 60 * 1000,
    end: now + windowDays * 24 * 60 * 60 * 1000,
    now,
  };
}
