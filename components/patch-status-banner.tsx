"use client";

import { Countdown } from "@/components/countdown";
import type { PatchMilestone, PatchStatus } from "@/lib/patch-types";
import type { GameId } from "@/lib/types";
import { GAME_CONFIG } from "@/lib/game-config";

type PatchStatusBannerProps = {
  patchStatus: PatchStatus | null;
  gameId: GameId;
  dataError?: string;
  officialUrl?: string;
  onShowUpcoming?: () => void;
};

const DATE_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

function formatTime(timestamp?: number): string {
  if (!timestamp) return "Unknown";
  return new Date(timestamp).toLocaleString("de-DE", DATE_TIME_FORMAT);
}

function MilestoneBlock({
  title,
  milestone,
  accentClass,
  onPreview,
}: {
  title: string;
  milestone: PatchMilestone;
  accentClass: string;
  onPreview?: () => void;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-background/40 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <p className="mt-1 text-sm font-medium text-foreground">{milestone.label}</p>
      {milestone.featuredNames && milestone.featuredNames.length > 0 && (
        <p className="mt-1.5 text-sm leading-snug text-foreground/90">
          {milestone.featuredNames.join(" · ")}
        </p>
      )}
      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
        {milestone.startTime && <p>Start: {formatTime(milestone.startTime)}</p>}
        {milestone.endTime && (
          <p>
            End: {formatTime(milestone.endTime)} ·{" "}
            <span className={accentClass}>
              <Countdown endDate={new Date(milestone.endTime).toISOString()} />
            </span>
          </p>
        )}
      </div>
      {onPreview && milestone.featuredNames && milestone.featuredNames.length > 0 && (
        <button
          type="button"
          onClick={onPreview}
          className={`mt-3 text-xs font-medium ${accentClass} hover:underline`}
        >
          Kommende Banner anzeigen →
        </button>
      )}
    </div>
  );
}

export function PatchStatusBanner({
  patchStatus,
  gameId,
  dataError,
  officialUrl,
  onShowUpcoming,
}: PatchStatusBannerProps) {
  const config = GAME_CONFIG[gameId];

  if (!patchStatus) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-4 sm:p-5">
        <p className="text-sm font-medium text-foreground">Version schedule unavailable</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {dataError ??
            "No public patch calendar was found for this game yet. News below may still contain manual update notices."}
        </p>
        {officialUrl && (
          <a
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm text-primary hover:underline"
          >
            Open official website →
          </a>
        )}
      </div>
    );
  }

  const versionLabel = patchStatus.currentVersionName
    ? `${patchStatus.currentVersion} · ${patchStatus.currentVersionName}`
    : patchStatus.currentVersion;

  return (
    <div className={`rounded-xl border bg-card/50 p-4 sm:p-5 ${config.bgColor}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Current Version
          </p>
          <h2 className={`mt-1 text-lg font-semibold sm:text-xl ${config.color}`}>
            {versionLabel}
          </h2>
        </div>
        {patchStatus.patchEndTime && (
          <div className="rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-right">
            <p className="text-xs text-muted-foreground">Patch ends</p>
            <p className="text-sm font-medium text-foreground">
              {formatTime(patchStatus.patchEndTime)}
            </p>
            <p className={`mt-1 text-sm ${config.color}`}>
              <Countdown endDate={new Date(patchStatus.patchEndTime).toISOString()} />
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-border/50 bg-background/40 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Patch Window
          </p>
          <p className="mt-2 text-sm text-foreground">
            {patchStatus.patchStartTime
              ? formatTime(patchStatus.patchStartTime)
              : "Start unknown"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {patchStatus.patchEndTime
              ? `Until ${formatTime(patchStatus.patchEndTime)}`
              : "End date not published yet"}
          </p>
        </div>

        {patchStatus.currentPhase && (
          <MilestoneBlock
            title="Current Phase / Banner"
            milestone={patchStatus.currentPhase}
            accentClass={config.color}
          />
        )}

        {patchStatus.nextMilestone ? (
          <MilestoneBlock
            title="Next Phase"
            milestone={patchStatus.nextMilestone}
            accentClass={config.color}
            onPreview={onShowUpcoming}
          />
        ) : patchStatus.nextVersion ? (
          <div className="rounded-lg border border-border/50 bg-background/40 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Next Version
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {patchStatus.nextVersion.version
                ? `Version ${patchStatus.nextVersion.version}`
                : patchStatus.nextVersion.versionName ?? patchStatus.nextVersion.label}
            </p>
            {patchStatus.nextVersion.versionName &&
              patchStatus.nextVersion.version && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {patchStatus.nextVersion.versionName}
                </p>
              )}
            {patchStatus.nextVersion.startTime && (
              <p className="mt-2 text-xs text-muted-foreground">
                Starts: {formatTime(patchStatus.nextVersion.startTime)}
              </p>
            )}
            {patchStatus.nextVersion.startTime && (
              <p className={`mt-1 text-sm ${config.color}`}>
                <Countdown
                  endDate={new Date(patchStatus.nextVersion.startTime).toISOString()}
                />
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-border/50 bg-background/40 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Next Update
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              No future patch date published yet. Watch announcements below.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
