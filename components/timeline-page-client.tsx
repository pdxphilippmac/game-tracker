"use client";

import { TimelinePageHeader, TimelineView } from "@/components/timeline-view";
import { OverviewSkeleton } from "@/components/skeletons";
import { useAllGamesData } from "@/lib/use-all-games-data";

export function TimelinePageClient() {
  const { data, isLoading, isValidating, refresh } = useAllGamesData();

  return (
    <div className="game-themed-shell game-themed-bg flex min-h-screen flex-col">
      <main className="container mx-auto min-w-0 max-w-5xl flex-1 px-4 py-5 sm:py-8">
        <TimelinePageHeader className="mb-6" />

        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={isValidating}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/40 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-card/70 disabled:opacity-50"
          >
            {isValidating ? "Loading…" : "Refresh"}
          </button>
        </div>

        {isLoading ? (
          <OverviewSkeleton />
        ) : (
          <TimelineView allData={data} windowDays={14} showWindowSelector />
        )}
      </main>

      <footer className="mt-auto border-t border-border/40 bg-card/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 text-center text-xs text-muted-foreground">
          <p>
            Data from official sources and community APIs. Not affiliated with miHoYo,
            Kuro Games, Hypergryph, or Papergames.
          </p>
        </div>
      </footer>
    </div>
  );
}
