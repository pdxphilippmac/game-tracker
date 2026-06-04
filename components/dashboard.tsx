"use client";

import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GameContent } from "@/components/game-content";
import { CrossGameOverview } from "@/components/cross-game-overview";
import { BackToTop } from "@/components/back-to-top";
import { GameIcon } from "@/components/game-icon";
import {
  GAME_CONFIG,
  GAME_IDS,
  gameIconBox,
  gameTabActive,
  gameTabInactive,
  toolbarButton,
} from "@/lib/game-config";
import { getPinnedGame, setPinnedGame, sortGameIds } from "@/lib/pinned-game";
import type { GameHeaderMeta } from "@/lib/game-header-meta";
import { formatDateTime } from "@/lib/format";
import { GameId } from "@/lib/types";
import { cn } from "@/lib/utils";

type DashboardTab = GameId | "overview";

function OverviewTabIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  );
}

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [pinnedGame, setPinnedGameState] = useState<GameId | null>(null);
  const [headerMeta, setHeaderMeta] = useState<GameHeaderMeta | null>(null);

  useEffect(() => {
    setPinnedGameState(getPinnedGame());
  }, []);

  const sortedGameIds = useMemo(
    () => sortGameIds(GAME_IDS, pinnedGame),
    [pinnedGame],
  );

  const themeGame: GameId =
    activeTab === "overview" ? (pinnedGame ?? "hsr") : activeTab;

  const activeConfig =
    activeTab === "overview"
      ? { name: "All games", shortName: "Overview" }
      : GAME_CONFIG[activeTab];

  useEffect(() => {
    if (activeTab === "overview") {
      setHeaderMeta(null);
    }
  }, [activeTab]);

  const togglePin = useCallback(
    (gameId: GameId, event: MouseEvent) => {
      event.stopPropagation();
      const next = pinnedGame === gameId ? null : gameId;
      setPinnedGame(next);
      setPinnedGameState(next);
    },
    [pinnedGame],
  );

  const showHeaderActions =
    activeTab !== "overview" && headerMeta?.gameId === activeTab;

  const handleSelectGame = useCallback((gameId: GameId) => {
    setActiveTab(gameId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div
      data-game-theme={themeGame}
      className="game-themed-shell game-themed-bg flex min-h-screen flex-col"
    >
      <header className="game-themed-header sticky top-0 z-50 border-b backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${gameIconBox}`}
              >
                {activeTab === "overview" ? (
                  <OverviewTabIcon className="h-5 w-5" />
                ) : (
                  <GameIcon gameId={activeTab} className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">
                  Gacha Tracker
                </h1>
                <p className="truncate text-xs text-muted-foreground sm:text-sm">
                  {showHeaderActions && headerMeta?.summary
                    ? headerMeta.summary
                    : activeConfig.name}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <a
                href="https://ko-fi.com/philipp87710"
                target="_blank"
                rel="noopener noreferrer"
                className={`${toolbarButton} kofi-btn`}
                aria-label="Support on Ko-fi (opens in new tab)"
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M6.5 3C4.57 3 3 4.57 3 6.5v11C3 19.43 4.57 21 6.5 21h11c1.93 0 3.5-1.57 3.5-3.5v-11C21 4.57 19.43 3 17.5 3h-11Zm0 1.5h11c1.1 0 2 .9 2 2v7.8c-.6-.4-1.3-.6-2.1-.6-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4h.1c.3 0 .6-.1.9-.2.5 1.1 1.6 1.9 2.9 1.9 1.8 0 3.2-1.4 3.2-3.2 0-1.3-.8-2.4-1.9-2.9.1-.3.2-.6.2-.9V6.5c0-1.1-.9-2-2-2h-11Zm8.5 10.5c1.4 0 2.5 1.1 2.5 2.5S16.4 20 15 20s-2.5-1.1-2.5-2.5 1.1-2.5 2.5-2.5Z" />
                </svg>
                Ko-fi
              </a>

              <Link href="/timeline" className={`hidden sm:inline-flex ${toolbarButton}`}>
                Timeline
              </Link>

              {activeTab !== "overview" && (
                <button
                  type="button"
                  onClick={(event) => togglePin(activeTab, event)}
                  aria-label={pinnedGame === activeTab ? "Unpin game" : "Pin game"}
                  aria-pressed={pinnedGame === activeTab}
                  className={cn(
                    toolbarButton,
                    "p-2",
                    pinnedGame === activeTab && "border-[color-mix(in_oklch,var(--game-accent)_25%,var(--border))] text-game-accent",
                  )}
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill={pinnedGame === activeTab ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 5h14v14l-7-3.5L5 19V5z"
                    />
                  </svg>
                </button>
              )}

              {showHeaderActions && (
                <div className="flex flex-col items-end gap-1">
                  <button
                    type="button"
                    onClick={() => void headerMeta.onRefresh()}
                    disabled={headerMeta.isValidating}
                    aria-label="Refresh game data"
                    className={`${toolbarButton} disabled:opacity-50`}
                  >
                    <svg
                      className={`h-3.5 w-3.5 ${headerMeta.isValidating ? "animate-spin motion-reduce:animate-none" : ""}`}
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
                    {headerMeta.isValidating ? "Loading…" : "Refresh"}
                  </button>
                  <span className="hidden text-[10px] text-muted-foreground sm:block">
                    Updated {formatDateTime(headerMeta.lastUpdated)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto min-w-0 max-w-5xl flex-1 px-4 py-5 sm:py-6 xl:max-w-[76rem]">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as DashboardTab)}
          className="min-w-0 space-y-5 sm:space-y-6"
        >
          <div className="relative min-w-0">
            <div className="overflow-x-auto overscroll-x-contain pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
              <TabsList
                variant="line"
                className="inline-flex !h-auto w-max flex-nowrap snap-x snap-mandatory items-center gap-1 rounded-none bg-transparent p-0 sm:flex sm:w-full sm:flex-wrap sm:justify-start"
              >
                <TabsTrigger
                  value="overview"
                  className={`
                    !h-auto !flex-none min-h-[2.5rem] shrink-0 snap-start rounded-lg border px-3 py-2
                    transition-colors duration-150 motion-reduce:transition-none after:hidden
                    sm:min-h-[2.25rem] sm:px-3.5
                    ${activeTab === "overview" ? gameTabActive : gameTabInactive}
                  `}
                >
                  <span className="flex items-center gap-2">
                    <OverviewTabIcon className="h-5 w-5 shrink-0" />
                    <span className="text-xs font-medium leading-snug sm:text-sm">Overview</span>
                  </span>
                </TabsTrigger>

                {sortedGameIds.map((gameId) => {
                  const isActive = activeTab === gameId;
                  const isPinned = pinnedGame === gameId;
                  return (
                    <TabsTrigger
                      key={gameId}
                      value={gameId}
                      className={`
                        relative !h-auto !flex-none min-h-[2.5rem] shrink-0 snap-start rounded-lg border px-3 py-2
                        transition-colors duration-150 motion-reduce:transition-none after:hidden
                        sm:min-h-[2.25rem] sm:px-3.5
                        ${isActive ? gameTabActive : gameTabInactive}
                      `}
                    >
                      <span className="flex items-center gap-2">
                        <span className="relative flex h-8 w-8 shrink-0 items-center justify-center sm:h-auto sm:w-auto">
                          <GameIcon
                            gameId={gameId}
                            className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]"
                          />
                          {isPinned && (
                            <span
                              aria-hidden="true"
                              className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[var(--game-accent)] sm:hidden"
                            />
                          )}
                        </span>
                        <span className="text-xs font-medium leading-snug sm:text-sm">
                          {GAME_CONFIG[gameId].shortName}
                        </span>
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent sm:hidden"
            />
          </div>

          <TabsContent
            value="overview"
            className="mt-4 animate-in fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none sm:mt-6"
          >
            <CrossGameOverview
              onSelectGame={handleSelectGame}
              pinnedGame={pinnedGame}
            />
          </TabsContent>

          {GAME_IDS.map((gameId) => (
            <TabsContent
              key={gameId}
              value={gameId}
              className="mt-4 animate-in fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none sm:mt-6"
            >
              <GameContent
                gameId={gameId}
                onHeaderMetaChange={gameId === activeTab ? setHeaderMeta : undefined}
              />
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <footer className="mt-auto border-t border-border bg-background">
        <div className="container mx-auto px-4 py-5 text-center text-xs text-muted-foreground">
          <p>
            Data from official sources and Enka.Network (showcase). Not affiliated with miHoYo,
            Kuro Games, Hypergryph, or Papergames.
          </p>
        </div>
      </footer>

      <BackToTop />
    </div>
  );
}
