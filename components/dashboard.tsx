"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GameContent } from "@/components/game-content";
import { GAME_CONFIG, GAME_IDS } from "@/lib/game-config";
import { GameId } from "@/lib/types";

export function Dashboard() {
  const [activeGame, setActiveGame] = useState<GameId>("hsr");
  const activeConfig = GAME_CONFIG[activeGame];

  return (
    <div
      data-game-theme={activeGame}
      className="game-themed-shell game-themed-bg min-h-screen overflow-x-hidden transition-[background] duration-700 ease-out"
    >
      <header className="game-themed-header sticky top-0 z-50 border-b backdrop-blur-md transition-[background,border-color] duration-700">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${activeConfig.bgColor} ${activeConfig.color} text-lg transition-colors duration-500`}
            >
              {activeConfig.icon}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-foreground sm:text-xl">
                Gacha Tracker
              </h1>
              <p
                className={`truncate text-xs transition-colors duration-500 sm:text-sm ${activeConfig.color}`}
              >
                {activeConfig.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto min-w-0 max-w-5xl px-4 py-5 sm:py-6">
        <Tabs
          value={activeGame}
          onValueChange={(v) => setActiveGame(v as GameId)}
          className="min-w-0 space-y-5 sm:space-y-6"
        >
          <div className="min-w-0">
            <div className="overflow-x-auto overscroll-x-contain pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
              <TabsList
                variant="line"
                className="inline-flex !h-auto w-max flex-nowrap snap-x snap-mandatory items-center gap-2.5 rounded-none bg-transparent p-0 sm:flex sm:w-full sm:flex-wrap sm:justify-start sm:gap-2"
              >
                {GAME_IDS.map((gameId) => {
                const config = GAME_CONFIG[gameId];
                const isActive = activeGame === gameId;
                return (
                  <TabsTrigger
                    key={gameId}
                    value={gameId}
                    className={`
                      !h-auto !flex-none min-h-[3.25rem] shrink-0 snap-start rounded-2xl border px-3.5 py-2.5
                      transition-all duration-300 after:hidden
                      sm:min-h-[2.75rem] sm:rounded-xl sm:px-4 sm:py-2.5
                      ${isActive ? config.tabActive : config.tabInactive}
                    `}
                  >
                    <span className="flex items-center gap-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center text-lg leading-none sm:h-auto sm:w-auto sm:text-xl">
                        {config.icon}
                      </span>
                      <span className="text-xs font-semibold leading-snug sm:text-sm">
                        {config.shortName}
                      </span>
                    </span>
                  </TabsTrigger>
                );
                })}
              </TabsList>
            </div>
          </div>

          {GAME_IDS.map((gameId) => (
            <TabsContent key={gameId} value={gameId} className="mt-4 sm:mt-6">
              <div className="mb-5 sm:mb-6">
                <h2 className={`text-xl font-bold sm:text-2xl ${GAME_CONFIG[gameId].color}`}>
                  {GAME_CONFIG[gameId].name}
                </h2>
              </div>
              <GameContent gameId={gameId} />
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <footer className="mt-auto border-t border-border/40 bg-card/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 text-center text-xs text-muted-foreground sm:text-sm">
          <p>
            Daten von offiziellen Quellen &amp; Community-APIs. Keine Verbindung zu miHoYo,
            Kuro Games, Hypergryph oder Papergames.
          </p>
        </div>
      </footer>
    </div>
  );
}
