import type { Banner, NewsItem } from "@/lib/types";
import type { EnneadNewsItem } from "@/lib/fetchers/ennead-news";
import type { PatchMilestone, PatchStatus, UpcomingVersion } from "@/lib/patch-types";
import { parseDateRangeFromText, parseSingleDateFromText } from "@/lib/date-parse";

const VERSION_IN_TITLE = /Version\s+(\d+\.\d+)(?:\s+"([^"]+)")?/i;
const VERSION_CODENAME = /\[([^\]]+)\]\s*Version/i;
const PHASE_IN_TITLE = /Phase\s*(I{1,3}|IV|\d+|[ⅠⅡⅢⅣ])/i;

export function extractVersionFromTitle(title: string): {
  version?: string;
  versionName?: string;
} {
  const numericMatch = title.match(VERSION_IN_TITLE);
  if (numericMatch) {
    return {
      version: numericMatch[1],
      versionName: numericMatch[2],
    };
  }

  const codenameMatch = title.match(VERSION_CODENAME);
  if (codenameMatch) {
    return { versionName: codenameMatch[1] };
  }

  const bracketMatch = title.match(/\[([^\]]+)\]/);
  if (bracketMatch && /version|update/i.test(title)) {
    return { versionName: bracketMatch[1] };
  }

  return {};
}

export function extractPhaseLabel(title: string, description = ""): string | undefined {
  const source = `${title} ${description}`;
  const match = source.match(PHASE_IN_TITLE);
  if (!match) return undefined;

  const raw = match[1];
  const romanMap: Record<string, string> = {
    I: "Phase I",
    II: "Phase II",
    III: "Phase III",
    IV: "Phase IV",
    "Ⅰ": "Phase I",
    "Ⅱ": "Phase II",
    "Ⅲ": "Phase III",
    "Ⅳ": "Phase IV",
  };

  return romanMap[raw] ?? `Phase ${raw}`;
}

export function deriveHSRPatchStatus(
  banners: Banner[],
  notices: EnneadNewsItem[]
): PatchStatus | null {
  const version = banners[0]?.version;
  if (!version) return null;

  const characterBanners = banners.filter(
    (banner) => banner.characters.filter((char) => char.rarity >= 5).length > 0
  );

  const phases = dedupePhases(
    characterBanners.map((banner) => ({
      label: inferPhaseLabel(banner.startTime, characterBanners),
      startTime: banner.startTime,
      endTime: banner.endTime,
    }))
  ).sort((a, b) => (a.startTime ?? 0) - (b.startTime ?? 0));

  phases.forEach((phase, index) => {
    phase.label = `Phase ${index + 1}`;
  });

  const now = Date.now();
  const currentPhase =
    phases.find(
      (phase) =>
        (phase.startTime ?? 0) <= now + 60_000 && (phase.endTime ?? 0) > now
    ) ?? phases[0];
  const nextPhase = phases.find(
    (phase) => (phase.startTime ?? 0) > now && (phase.endTime ?? 0) > now
  );

  const versionNotice = notices.find((item) =>
    new RegExp(`Version\\s+${version.replace(".", "\\.")}`, "i").test(item.title)
  );
  const versionMeta = versionNotice
    ? extractVersionFromTitle(versionNotice.title)
    : {};

  const patchStartTime =
    parseSingleDateFromText(versionNotice?.description ?? "") ??
    phases[0]?.startTime;
  const patchEndTime = phases.at(-1)?.endTime;

  const nextVersion = findUpcomingVersion(notices, version);

  return buildPatchStatus({
    currentVersion: version,
    currentVersionName: versionMeta.versionName,
    patchStartTime,
    patchEndTime,
    currentPhase,
    nextMilestone: nextPhase,
    nextVersion,
  });
}

export function deriveZZYPatchStatus(
  banners: Banner[],
  notices: EnneadNewsItem[]
): PatchStatus | null {
  const patchNotice = notices.find(
    (item) =>
      /Version\s+\d+\.\d+/i.test(item.title) &&
      /update|announcement|details|compensation/i.test(item.title) &&
      !/special program|preview/i.test(item.title)
  );
  const versionMeta = patchNotice
    ? extractVersionFromTitle(patchNotice.title)
    : { version: undefined, versionName: undefined };

  const liveVersions = notices
    .filter(
      (item) =>
        /Version\s+\d+\.\d+/i.test(item.title) && !/special program/i.test(item.title)
    )
    .map((item) => extractVersionFromTitle(item.title).version)
    .filter((value): value is string => Boolean(value));

  const version =
    versionMeta.version ??
    liveVersions.sort((a, b) => Number.parseFloat(b) - Number.parseFloat(a))[0];

  if (!version) return null;

  const bannerNotice = notices.find((item) =>
    /limited-time channel|phase/i.test(item.title)
  );
  const bannerRange = bannerNotice?.description
    ? parseDateRangeFromText(bannerNotice.description)
    : null;
  const activeBanner = banners[0];

  const currentPhase: PatchMilestone | undefined = bannerNotice
    ? {
        label:
          extractPhaseLabel(bannerNotice.title, bannerNotice.description) ??
          "Current Banner Phase",
        startTime: bannerRange?.startTime ?? activeBanner?.startTime,
        endTime: bannerRange?.endTime ?? activeBanner?.endTime,
      }
    : activeBanner
      ? {
          label: "Current Banner Phase",
          startTime: activeBanner.startTime,
          endTime: activeBanner.endTime,
        }
      : undefined;

  const patchStartTime =
    parseSingleDateFromText(patchNotice?.description ?? "") ?? currentPhase?.startTime;

  const nextVersionNotice = notices.find((item) =>
    /Version\s+\d+\.\d+/i.test(item.title) &&
    Number.parseFloat((item.title.match(/Version\s+(\d+\.\d+)/i)?.[1] ?? "0")) >
      Number.parseFloat(version)
  );

  const specialProgram = notices.find((item) =>
    /special program/i.test(item.title)
  );

  let nextVersion: UpcomingVersion | undefined;
  if (nextVersionNotice) {
    const meta = extractVersionFromTitle(nextVersionNotice.title);
    nextVersion = {
      version: meta.version,
      versionName: meta.versionName,
      startTime: parseSingleDateFromText(nextVersionNotice.description ?? "") ?? undefined,
      label: nextVersionNotice.title,
    };
  } else if (specialProgram) {
    const meta = extractVersionFromTitle(specialProgram.title);
    nextVersion = {
      version: meta.version,
      versionName: meta.versionName,
      startTime: parseSingleDateFromText(specialProgram.description ?? "") ?? undefined,
      label: "Special Program / Next Version",
    };
  }

  return buildPatchStatus({
    currentVersion: version,
    currentVersionName: versionMeta.versionName,
    patchStartTime,
    patchEndTime: currentPhase?.endTime,
    currentPhase,
    nextVersion,
  });
}

export function deriveWuWaPatchStatus(
  banners: Banner[],
  items: NewsItem[]
): PatchStatus | null {
  const versionItem = items.find((item) => /Version\s+\d+\.\d+/i.test(item.title));
  const versionMatch = (versionItem?.title ?? items[0]?.description ?? "").match(
    /Version\s+(\d+\.\d+)/i
  );
  const version = versionMatch?.[1];
  if (!version) return null;

  const phaseItem = items.find((item) => /Phase\s*[ⅠIⅡ2]/i.test(item.title));
  const phaseLabel = phaseItem
    ? extractPhaseLabel(phaseItem.title, phaseItem.description)
    : undefined;
  const activeBanner = banners[0];

  const currentPhase: PatchMilestone | undefined =
    phaseLabel || activeBanner
      ? {
          label: phaseLabel ?? "Current Convene Phase",
          startTime: activeBanner?.startTime,
          endTime: activeBanner?.endTime,
        }
      : undefined;

  return buildPatchStatus({
    currentVersion: version,
    patchStartTime: activeBanner?.startTime,
    patchEndTime: activeBanner?.endTime,
    currentPhase,
    nextMilestone: undefined,
  });
}

export function deriveEndfieldPatchStatus(input: {
  currentVersionName?: string;
  nextVersionName?: string;
  patchStartTime?: number;
  patchEndTime?: number;
  nextVersionStartTime?: number;
}): PatchStatus | null {
  if (!input.currentVersionName && !input.nextVersionName) return null;

  return buildPatchStatus({
    currentVersion: input.currentVersionName ?? "Current Version",
    currentVersionName: input.currentVersionName,
    patchStartTime: input.patchStartTime,
    patchEndTime: input.patchEndTime ?? input.nextVersionStartTime,
    nextVersion: input.nextVersionName
      ? {
          versionName: input.nextVersionName,
          startTime: input.nextVersionStartTime,
          label: `Next version: ${input.nextVersionName}`,
        }
      : undefined,
  });
}

function inferPhaseLabel(startTime: number, banners: Banner[]): string {
  const sorted = [...banners].sort((a, b) => a.startTime - b.startTime);
  const index = sorted.findIndex((banner) => banner.startTime === startTime);
  return `Phase ${Math.max(index, 0) + 1}`;
}

function dedupePhases(phases: PatchMilestone[]): PatchMilestone[] {
  const seen = new Set<string>();
  return phases.filter((phase) => {
    const key = `${phase.startTime}-${phase.endTime}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return Boolean(phase.startTime && phase.endTime);
  });
}

function findUpcomingVersion(
  notices: EnneadNewsItem[],
  currentVersion: string
): UpcomingVersion | undefined {
  const current = Number.parseFloat(currentVersion);
  const candidates: UpcomingVersion[] = [];

  for (const item of notices) {
    const meta = extractVersionFromTitle(item.title);
    if (!meta.version) continue;
    const value = Number.parseFloat(meta.version);
    if (value <= current) continue;

    candidates.push({
      version: meta.version,
      versionName: meta.versionName,
      startTime: parseSingleDateFromText(item.description ?? "") ?? undefined,
      label: item.title,
    });
  }

  candidates.sort(
    (a, b) =>
      Number.parseFloat(a.version ?? "0") - Number.parseFloat(b.version ?? "0")
  );

  return candidates[0];
}

function buildPatchStatus(input: {
  currentVersion: string;
  currentVersionName?: string;
  patchStartTime?: number;
  patchEndTime?: number;
  currentPhase?: PatchMilestone;
  nextMilestone?: PatchMilestone;
  nextVersion?: UpcomingVersion;
}): PatchStatus {
  return {
    currentVersion: input.currentVersion,
    currentVersionName: input.currentVersionName,
    patchStartTime: input.patchStartTime,
    patchEndTime: input.patchEndTime,
    currentPhase: input.currentPhase,
    nextMilestone: input.nextMilestone,
    nextVersion: input.nextVersion,
  };
}
