"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Countdown } from "@/components/countdown";
import { GameIcon } from "@/components/game-icon";
import {
  buildCrossGameTimeline,
  CROSS_GAME_ALERT_LABELS,
  collectCrossGameAlerts,
  getTimelineWindow,
  type CrossGameTimelineEntry,
} from "@/lib/cross-game";
import { GAME_CONFIG, GAME_IDS, metaLabel, surfaceCard, toolbarButton } from "@/lib/game-config";
import { formatDate, formatDateTime } from "@/lib/format";
import type { GameData, GameId } from "@/lib/types";
import { cn } from "@/lib/utils";

type TimelineViewProps = {
  allData: GameData[];
  windowDays?: number;
  showWindowSelector?: boolean;
  compact?: boolean;
  onSelectGame?: (gameId: GameId) => void;
  className?: string;
};

const WINDOW_OPTIONS = [7, 14, 30] as const;

const STATUS_BAR: Record<CrossGameTimelineEntry["status"], string> = {
  past: "bg-muted-foreground/30",
  active: "bg-[var(--game-accent)]",
  upcoming: "bg-muted-foreground/50",
};

const CATEGORY_LABELS: Record<CrossGameTimelineEntry["category"], string> = {
  banner: "Banner",
  event: "Event",
  challenge: "Challenge",
  patch: "Patch",
  special_program: "Special Program",
};

function getBarStyle(
  entry: CrossGameTimelineEntry,
  windowStart: number,
  windowEnd: number,
): { left: string; width: string } {
  const total = windowEnd - windowStart;
  if (total <= 0) return { left: "0%", width: "0%" };

  const clampedStart = Math.max(entry.startTime, windowStart);
  const clampedEnd = Math.min(entry.endTime, windowEnd);
  const left = ((clampedStart - windowStart) / total) * 100;
  const width = Math.max(((clampedEnd - clampedStart) / total) * 100, 0.8);

  return { left: `${left}%`, width: `${width}%` };
}

function TimelineListItem({
  entry,
  onSelectGame,
}: {
  entry: CrossGameTimelineEntry;
  onSelectGame?: (gameId: GameId) => void;
}) {
  const config = GAME_CONFIG[entry.gameId];
  const content = (
    <>
      <div className="flex min-w-0 items-start gap-3">
        <div
          data-game-theme={entry.gameId}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-secondary"
        >
          <GameIcon gameId={entry.gameId} className="h-4 w-4 text-game-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={metaLabel}>
              {config.shortName} · {CATEGORY_LABELS[entry.category]}
            </span>
            <span className={metaLabel}>{entry.status}</span>
          </div>
          <p className="mt-0.5 text-sm font-medium leading-snug text-foreground">{entry.label}</p>
          {entry.sublabel && (
            <p className="mt-0.5 text-xs text-muted-foreground">{entry.sublabel}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDateTime(entry.startTime)}
            {entry.endTime !== entry.startTime && ` – ${formatDateTime(entry.endTime)}`}
          </p>
        </div>
      </div>
    </>
  );

  if (onSelectGame) {
    return (
      <button
        type="button"
        onClick={() => onSelectGame(entry.gameId)}
        className={`interactive-card w-full ${surfaceCard} p-3 text-left`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={`${surfaceCard} p-3`}>
      {content}
    </div>
  );
}

function TimelineGantt({
  entries,
  windowStart,
  windowEnd,
}: {
  entries: CrossGameTimelineEntry[];
  windowStart: number;
  windowEnd: number;
}) {
  const gamesWithEntries = GAME_IDS.filter((gameId) =>
    entries.some((e) => e.gameId === gameId),
  );

  if (gamesWithEntries.length === 0) {
    return null;
  }

  return (
    <div className={`hidden overflow-x-auto ${surfaceCard} p-4 lg:block`}>
      <div className="mb-3 flex justify-between text-xs text-muted-foreground">
        <span>{formatDate(windowStart)}</span>
        <span>Today</span>
        <span>{formatDate(windowEnd)}</span>
      </div>
      <div className="min-w-[640px] space-y-3">
        {gamesWithEntries.map((gameId) => {
          const gameEntries = entries.filter((e) => e.gameId === gameId);
          return (
            <div key={gameId} data-game-theme={gameId} className="flex items-center gap-3">
              <div className="flex w-16 shrink-0 items-center gap-1.5">
                <GameIcon gameId={gameId} className="h-4 w-4 text-game-accent" />
                <span className="text-xs font-semibold text-foreground">
                  {GAME_CONFIG[gameId].shortName}
                </span>
              </div>
              <div className="relative h-8 flex-1 rounded-md bg-muted/20">
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 border-l border-dashed border-foreground/20"
                  style={{
                    left: `${((Date.now() - windowStart) / (windowEnd - windowStart)) * 100}%`,
                  }}
                />
                {gameEntries.map((entry) => {
                  const bar = getBarStyle(entry, windowStart, windowEnd);
                  return (
                    <div
                      key={entry.id}
                      title={`${entry.label} (${entry.status})`}
                      className={cn(
                        "absolute top-1 h-6 rounded-sm opacity-90",
                        STATUS_BAR[entry.status],
                      )}
                      style={{ left: bar.left, width: bar.width }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TimelineView({
  allData,
  windowDays: initialWindowDays = 14,
  showWindowSelector = true,
  compact = false,
  onSelectGame,
  className,
}: TimelineViewProps) {
  const [windowDays, setWindowDays] = useState(initialWindowDays);
  const { start: windowStart, end: windowEnd } = getTimelineWindow(windowDays);

  const entries = useMemo(
    () => buildCrossGameTimeline(allData, windowDays),
    [allData, windowDays],
  );

  const visibleEntries = compact
    ? entries.filter((e) => e.status !== "past").slice(0, 8)
    : entries.filter((e) => e.status !== "past" || e.endTime >= windowStart);

  if (allData.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {showWindowSelector && !compact && (
        <div className="flex flex-wrap items-center gap-2">
          {WINDOW_OPTIONS.map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setWindowDays(days)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                windowDays === days
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-border/50 text-muted-foreground hover:text-foreground",
              )}
            >
              {days} days
            </button>
          ))}
        </div>
      )}

      {!compact && (
        <TimelineGantt
          entries={entries}
          windowStart={windowStart}
          windowEnd={windowEnd}
        />
      )}

      <div className="space-y-2">
        {visibleEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing scheduled in this window.</p>
        ) : (
          visibleEntries.map((entry) => (
            <TimelineListItem key={entry.id} entry={entry} onSelectGame={onSelectGame} />
          ))
        )}
      </div>
    </div>
  );
}

type CrossGameAlertsProps = {
  allData: GameData[];
  onSelectGame?: (gameId: GameId) => void;
  limit?: number;
};

export function CrossGameAlerts({ allData, onSelectGame, limit }: CrossGameAlertsProps) {
  const alerts = collectCrossGameAlerts(allData);
  const visible = limit ? alerts.slice(0, limit) : alerts;

  if (visible.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {visible.map((alert) => {
        const label = CROSS_GAME_ALERT_LABELS[alert.kind];
        const timeLabel =
          alert.timeType === "end"
            ? "Ends"
            : alert.timeType === "start"
              ? "Starts"
              : alert.kind === "code"
                ? "Active"
                : "Airs";

        const inner = (
          <>
            <div
              data-game-theme={alert.gameId}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-secondary"
            >
              <GameIcon gameId={alert.gameId} className="h-3.5 w-3.5 text-game-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <p className={metaLabel}>
                {GAME_CONFIG[alert.gameId].shortName} · {label}
              </p>
              <p className="truncate text-sm font-medium text-foreground">{alert.name}</p>
            </div>
            <span className="shrink-0 text-xs font-mono tabular-nums text-muted-foreground">
              {alert.kind === "code" ? (
                "now"
              ) : (
                <>
                  {timeLabel}{" "}
                  <Countdown
                    endDate={new Date(alert.time).toISOString()}
                    className="text-foreground"
                  />
                </>
              )}
            </span>
          </>
        );

        if (alert.url) {
          return (
            <a
              key={alert.id}
              href={alert.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`interactive-card flex items-center gap-3 ${surfaceCard} px-3 py-2.5`}
            >
              {inner}
            </a>
          );
        }

        if (onSelectGame) {
          return (
            <button
              key={alert.id}
              type="button"
              onClick={() => onSelectGame(alert.gameId)}
              className={`interactive-card flex w-full items-center gap-3 ${surfaceCard} px-3 py-2.5 text-left`}
            >
              {inner}
            </button>
          );
        }

        return (
          <div
            key={alert.id}
            className={`flex items-center gap-3 ${surfaceCard} px-3 py-2.5`}
          >
            {inner}
          </div>
        );
      })}
    </div>
  );
}

export function TimelinePageHeader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">Cross-game timeline</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Banners, events, and milestones across all tracked games.
        </p>
      </div>
      <Link
        href="/"
        className={`shrink-0 ${toolbarButton}`}
      >
        ← Dashboard
      </Link>
    </div>
  );
}
