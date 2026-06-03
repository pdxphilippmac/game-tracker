"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GameContent } from "@/components/game-content";
import { GameIcon } from "@/components/game-icon";
import { GAME_CONFIG, GAME_IDS, gameAccentText, gameIconBox, gameTabActive, gameTabInactive } from "@/lib/game-config";
import type { GameHeaderMeta } from "@/lib/game-header-meta";
import { formatDateTime } from "@/lib/format";
import { GameId } from "@/lib/types";

export function Dashboard() {
  const [activeGame, setActiveGame] = useState<GameId>("hsr");
  const [headerMeta, setHeaderMeta] = useState<GameHeaderMeta | null>(null);
  const activeConfig = GAME_CONFIG[activeGame];

  useEffect(() => {
    setHeaderMeta(null);
  }, [activeGame]);

  const showHeaderActions = headerMeta?.gameId === activeGame;

  return (
    <div
      data-game-theme={activeGame}
      className="game-themed-shell game-themed-bg flex min-h-screen flex-col overflow-x-hidden transition-[background] duration-700 ease-out motion-reduce:transition-none"
    >
      <header className="game-themed-header sticky top-0 z-50 border-b backdrop-blur-md transition-[background,border-color] duration-700 motion-reduce:transition-none">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${gameIconBox} transition-colors duration-500 motion-reduce:transition-none`}
              >
                <GameIcon gameId={activeGame} className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold text-foreground sm:text-xl">
                  Gacha Tracker
                </h1>
                <p
                  className={`truncate text-xs transition-colors duration-500 motion-reduce:transition-none sm:text-sm ${gameAccentText}`}
                >
                  {showHeaderActions && headerMeta?.summary
                    ? headerMeta.summary
                    : activeConfig.name}
                </p>
              </div>
            </div>

            {showHeaderActions && (
              <div className="flex shrink-0 flex-col items-end gap-1">
                <button
                  type="button"
                  onClick={() => void headerMeta.onRefresh()}
                  disabled={headerMeta.isValidating}
                  aria-label="Refresh game data"
                  className={`inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/40 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-card/70 disabled:opacity-50 ${gameAccentText}`}
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
      </header>

      <main className="container mx-auto min-w-0 max-w-5xl flex-1 px-4 py-5 sm:py-6">
        <Tabs
          value={activeGame}
          onValueChange={(v) => setActiveGame(v as GameId)}
          className="min-w-0 space-y-5 sm:space-y-6"
        >
          <div className="relative min-w-0">
            <div className="overflow-x-auto overscroll-x-contain pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
              <TabsList
                variant="line"
                className="inline-flex !h-auto w-max flex-nowrap snap-x snap-mandatory items-center gap-2.5 rounded-none bg-transparent p-0 sm:flex sm:w-full sm:flex-wrap sm:justify-start sm:gap-2"
              >
                {GAME_IDS.map((gameId) => {
                  const isActive = activeGame === gameId;
                  return (
                    <TabsTrigger
                      key={gameId}
                      value={gameId}
                      className={`
                        !h-auto !flex-none min-h-[3.25rem] shrink-0 snap-start rounded-2xl border px-3.5 py-2.5
                        transition-all duration-300 motion-reduce:transition-none after:hidden
                        sm:min-h-[2.75rem] sm:rounded-xl sm:px-4 sm:py-2.5
                        ${isActive ? gameTabActive : gameTabInactive}
                      `}
                    >
                      <span className="flex items-center gap-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center sm:h-auto sm:w-auto">
                        <GameIcon gameId={gameId} className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]" />
                      </span>
                        <span className="text-xs font-semibold leading-snug sm:text-sm">
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

          {GAME_IDS.map((gameId) => (
            <TabsContent
              key={gameId}
              value={gameId}
              className="mt-4 animate-in fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none sm:mt-6"
            >
              <GameContent
                gameId={gameId}
                onHeaderMetaChange={gameId === activeGame ? setHeaderMeta : undefined}
              />
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <footer className="mt-auto border-t border-border/40 bg-card/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 text-center text-xs text-muted-foreground sm:text-sm">
          <p>
            Data from official sources and community APIs. Not affiliated with miHoYo,
            Kuro Games, Hypergryph, or Papergames.
          </p>
        </div>
      </footer>
    </div>
  );
}
