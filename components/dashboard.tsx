"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GameContent } from "@/components/game-content";
import { GAME_CONFIG, GAME_IDS } from "@/lib/game-config";
import { GameId } from "@/lib/types";

export function Dashboard() {
  const [activeGame, setActiveGame] = useState<GameId>("hsr");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Gacha Tracker</h1>
              <p className="text-sm text-muted-foreground">
                Banner &amp; News Dashboard
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-5xl px-4 py-6">
        <Tabs
          value={activeGame}
          onValueChange={(v) => setActiveGame(v as GameId)}
          className="space-y-6"
        >
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
            {GAME_IDS.map((gameId) => {
              const config = GAME_CONFIG[gameId];
              return (
                <TabsTrigger
                  key={gameId}
                  value={gameId}
                  className={`
                    flex items-center gap-2 rounded-lg border px-4 py-2.5
                    data-[state=inactive]:border-border/50 data-[state=inactive]:bg-card/30
                    data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-card/50
                    data-[state=active]:${config.bgColor} data-[state=active]:${config.color}
                    data-[state=active]:border transition-all
                  `}
                >
                  <span className="text-lg">{config.icon}</span>
                  <span className="hidden sm:inline">{config.shortName}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {GAME_IDS.map((gameId) => (
            <TabsContent key={gameId} value={gameId} className="mt-6">
              <div className="mb-6">
                <h2 className={`text-2xl font-bold ${GAME_CONFIG[gameId].color}`}>
                  {GAME_CONFIG[gameId].name}
                </h2>
              </div>
              <GameContent gameId={gameId} />
            </TabsContent>
          ))}
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          <p>
            Data fetched from official sources and community APIs. Not affiliated
            with miHoYo, Kuro Games, Hypergryph, or Papergames.
          </p>
        </div>
      </footer>
    </div>
  );
}
