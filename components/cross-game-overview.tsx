"use client";

import Link from "next/link";
import { CrossGameAlerts, TimelineView } from "@/components/timeline-view";
import { GameIcon } from "@/components/game-icon";
import { OverviewSkeleton } from "@/components/skeletons";
import { buildGameSnapshots, collectAllRedeemCodes, collectCrossGameAlerts } from "@/lib/cross-game";
import { useAllGamesData } from "@/lib/use-all-games-data";
import { GAME_CONFIG } from "@/lib/game-config";
import type { GameId } from "@/lib/types";
import { cn } from "@/lib/utils";

type CrossGameOverviewProps = {
  onSelectGame: (gameId: GameId) => void;
  pinnedGame: GameId | null;
  className?: string;
};

function GameSnapshotCard({
  snapshot,
  pinned,
  onSelect,
}: {
  snapshot: ReturnType<typeof buildGameSnapshots>[number];
  pinned: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      data-game-theme={snapshot.gameId}
      className="interactive-card rounded-xl border border-border/50 bg-card/40 p-4 text-left"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <GameIcon gameId={snapshot.gameId} className="h-5 w-5 text-game-accent" />
          <span className="font-semibold text-foreground">{snapshot.shortName}</span>
        </div>
        {pinned && (
          <span className="text-[10px] font-medium uppercase tracking-wide text-game-accent">
            Pinned
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{snapshot.name}</p>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {snapshot.activeBanners > 0 && (
          <span>{snapshot.activeBanners} banner{snapshot.activeBanners === 1 ? "" : "s"}</span>
        )}
        {snapshot.activeEvents > 0 && (
          <span>{snapshot.activeEvents} event{snapshot.activeEvents === 1 ? "" : "s"}</span>
        )}
        {snapshot.activeCodes > 0 && (
          <span className="text-game-accent">{snapshot.activeCodes} code{snapshot.activeCodes === 1 ? "" : "s"}</span>
        )}
        {snapshot.patchVersion && <span>Patch {snapshot.patchVersion}</span>}
        {snapshot.hasError && <span className="text-amber-300">Partial data</span>}
      </div>
    </button>
  );
}

export function CrossGameOverview({
  onSelectGame,
  pinnedGame,
  className,
}: CrossGameOverviewProps) {
  const { data, isLoading, isValidating, refresh } = useAllGamesData();

  if (isLoading) {
    return <OverviewSkeleton />;
  }

  const snapshots = buildGameSnapshots(data);
  const codes = collectAllRedeemCodes(data);
  const sortedSnapshots = [...snapshots].sort((a, b) => {
    if (pinnedGame === a.gameId) return -1;
    if (pinnedGame === b.gameId) return 1;
    return 0;
  });

  return (
    <div className={cn("space-y-8", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Overview</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            What&apos;s happening across all games this week.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={isValidating}
            aria-label="Refresh all games"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/40 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-card/70 disabled:opacity-50"
          >
            <svg
              className={cn("h-3.5 w-3.5", isValidating && "animate-spin motion-reduce:animate-none")}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isValidating ? "Loading…" : "Refresh all"}
          </button>
          <Link
            href="/timeline"
            className="rounded-lg border border-border/60 bg-card/40 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-card/70"
          >
            Full timeline →
          </Link>
        </div>
      </div>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Alerts
        </h3>
        <CrossGameAlerts allData={data} onSelectGame={onSelectGame} limit={12} />
        {collectCrossGameAlerts(data).length === 0 && (
          <p className="text-sm text-muted-foreground">All quiet — nothing urgent right now.</p>
        )}
      </section>

      {codes.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Active codes ({codes.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {codes.map((code) => (
              <button
                key={`${code.gameId}-${code.code}`}
                type="button"
                onClick={() => onSelectGame(code.gameId)}
                data-game-theme={code.gameId}
                className="rounded-lg border border-border/50 bg-card/40 px-3 py-1.5 text-left transition-colors hover:border-[color-mix(in_oklch,var(--game-accent)_35%,var(--border))]"
              >
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {GAME_CONFIG[code.gameId].shortName}
                </span>
                <p className="font-mono text-sm font-medium text-foreground">{code.code}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Games
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sortedSnapshots.map((snapshot) => (
            <GameSnapshotCard
              key={snapshot.gameId}
              snapshot={snapshot}
              pinned={pinnedGame === snapshot.gameId}
              onSelect={() => onSelectGame(snapshot.gameId)}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Upcoming
          </h3>
          <Link href="/timeline" className="text-xs font-medium text-primary hover:underline">
            View all →
          </Link>
        </div>
        <TimelineView
          allData={data}
          windowDays={7}
          showWindowSelector={false}
          compact
          onSelectGame={onSelectGame}
        />
      </section>
    </div>
  );
}
