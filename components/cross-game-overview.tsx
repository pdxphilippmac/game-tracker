"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ActiveBannerGameFilter } from "@/components/active-banner-game-filter";
import { ActiveBannerOverviewCard } from "@/components/active-banner-overview-card";
import { CrossGameAlerts, TimelineView } from "@/components/timeline-view";
import { GameIcon } from "@/components/game-icon";
import { OverviewSkeleton } from "@/components/skeletons";
import {
  buildGameSnapshots,
  collectActiveBanners,
  collectAllRedeemCodes,
  collectCrossGameAlerts,
} from "@/lib/cross-game";
import {
  filterActiveBannersByGames,
  getBannerGameFilter,
  setBannerGameFilter,
} from "@/lib/banner-game-filter";
import { useAllGamesData } from "@/lib/use-all-games-data";
import { GAME_CONFIG, GAME_IDS, metaLabel, overviewSection, sectionCaption, sectionTitle, surfaceCard, toolbarButton } from "@/lib/game-config";
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
      className={`interactive-card ${surfaceCard} p-4 text-left`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <GameIcon gameId={snapshot.gameId} className="h-4 w-4 text-game-accent" />
          <span className="text-sm font-medium text-foreground">{snapshot.shortName}</span>
        </div>
        {pinned && (
          <span className="text-[10px] font-medium text-muted-foreground">Pinned</span>
        )}
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">{snapshot.name}</p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs tabular-nums text-muted-foreground">
        {snapshot.activeBanners > 0 && (
          <span>{snapshot.activeBanners} banner{snapshot.activeBanners === 1 ? "" : "s"}</span>
        )}
        {snapshot.activeEvents > 0 && (
          <span>{snapshot.activeEvents} event{snapshot.activeEvents === 1 ? "" : "s"}</span>
        )}
        {snapshot.activeCodes > 0 && (
          <span>{snapshot.activeCodes} code{snapshot.activeCodes === 1 ? "" : "s"}</span>
        )}
        {snapshot.patchVersion && <span>v{snapshot.patchVersion}</span>}
        {snapshot.hasError && <span className="text-amber-400/90">Partial data</span>}
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
  const [gameFilter, setGameFilter] = useState<GameId[] | null>(null);

  useEffect(() => {
    setGameFilter(getBannerGameFilter());
  }, []);

  const snapshots = buildGameSnapshots(data);
  const codes = collectAllRedeemCodes(data);
  const activeBanners = collectActiveBanners(data);
  const sortedActiveBanners = [...activeBanners].sort((a, b) => {
    if (pinnedGame === a.gameId && pinnedGame !== b.gameId) return -1;
    if (pinnedGame === b.gameId && pinnedGame !== a.gameId) return 1;
    return a.banner.endTime - b.banner.endTime;
  });

  const gamesWithBanners = useMemo(() => {
    const ids = new Set(sortedActiveBanners.map((entry) => entry.gameId));
    return GAME_IDS.filter((id) => ids.has(id));
  }, [sortedActiveBanners]);

  const bannerCountByGame = useMemo(() => {
    const counts = {} as Record<GameId, number>;
    for (const entry of sortedActiveBanners) {
      counts[entry.gameId] = (counts[entry.gameId] ?? 0) + 1;
    }
    return counts;
  }, [sortedActiveBanners]);

  const selectedGameIds = useMemo(() => {
    if (gameFilter === null) {
      return new Set(gamesWithBanners);
    }
    return new Set(gameFilter.filter((id) => gamesWithBanners.includes(id)));
  }, [gameFilter, gamesWithBanners]);

  const visibleActiveBanners = useMemo(
    () => filterActiveBannersByGames(sortedActiveBanners, gameFilter),
    [sortedActiveBanners, gameFilter],
  );

  const isFiltered =
    gameFilter !== null &&
    (gameFilter.length === 0 || gameFilter.length < gamesWithBanners.length);

  const toggleGameFilter = useCallback(
    (gameId: GameId) => {
      setGameFilter((prev) => {
        const current = prev ?? gamesWithBanners;
        const next = current.includes(gameId)
          ? current.filter((id) => id !== gameId)
          : [...current, gameId];

        if (next.length === gamesWithBanners.length) {
          setBannerGameFilter(null);
          return null;
        }

        setBannerGameFilter(next);
        return next;
      });
    },
    [gamesWithBanners],
  );

  const selectAllGames = useCallback(() => {
    setGameFilter(null);
    setBannerGameFilter(null);
  }, []);

  if (isLoading) {
    return <OverviewSkeleton />;
  }

  const sortedSnapshots = [...snapshots].sort((a, b) => {
    if (pinnedGame === a.gameId) return -1;
    if (pinnedGame === b.gameId) return 1;
    return 0;
  });

  return (
    <div className={cn("space-y-0", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3 pb-8">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Overview</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Active banners, alerts, and schedules across all games.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={isValidating}
            aria-label="Refresh all games"
            className={toolbarButton}
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
          <Link href="/timeline" className={toolbarButton}>
            Full timeline
          </Link>
        </div>
      </div>

      {sortedActiveBanners.length > 0 && (
        <section className={overviewSection}>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className={sectionTitle}>Active banners</h3>
              <p className={sectionCaption}>
                {isFiltered
                  ? `${visibleActiveBanners.length} of ${sortedActiveBanners.length} banners shown`
                  : `${sortedActiveBanners.length} running across all games`}
              </p>
            </div>
            {gamesWithBanners.length > 1 && (
              <ActiveBannerGameFilter
                gameIds={gamesWithBanners}
                selectedGameIds={selectedGameIds}
                bannerCountByGame={bannerCountByGame}
                onToggle={toggleGameFilter}
                onSelectAll={selectAllGames}
                className="sm:max-w-[70%] sm:justify-end"
              />
            )}
          </div>

          {visibleActiveBanners.length > 0 ? (
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
              {visibleActiveBanners.map((entry) => (
                <ActiveBannerOverviewCard
                  key={entry.id}
                  entry={entry}
                  onSelect={() => onSelectGame(entry.gameId)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No games selected. Pick one or more games above to show their banners.
            </p>
          )}
        </section>
      )}

      <section className={overviewSection}>
        <h3 className={cn(sectionTitle, "mb-4")}>Alerts</h3>
        <CrossGameAlerts allData={data} onSelectGame={onSelectGame} limit={12} />
        {collectCrossGameAlerts(data).length === 0 && (
          <p className="text-sm text-muted-foreground">All quiet — nothing urgent right now.</p>
        )}
      </section>

      {codes.length > 0 && (
        <section className={overviewSection}>
          <h3 className={cn(sectionTitle, "mb-4")}>Active codes ({codes.length})</h3>
          <div className="flex flex-wrap gap-2">
            {codes.map((code) => (
              <button
                key={`${code.gameId}-${code.code}`}
                type="button"
                onClick={() => onSelectGame(code.gameId)}
                data-game-theme={code.gameId}
                className={`interactive-card ${surfaceCard} px-3 py-2 text-left`}
              >
                <span className={metaLabel}>{GAME_CONFIG[code.gameId].shortName}</span>
                <p className="font-mono text-sm font-medium text-foreground">{code.code}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className={overviewSection}>
        <h3 className={cn(sectionTitle, "mb-4")}>Games</h3>
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

      <section className={overviewSection}>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className={sectionTitle}>Upcoming</h3>
          <Link href="/timeline" className="text-xs font-medium text-muted-foreground hover:text-foreground">
            View all
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
