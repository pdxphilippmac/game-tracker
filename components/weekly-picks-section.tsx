"use client";

import { Countdown } from "@/components/countdown";
import { RewardGrid } from "@/components/reward-grid";
import { Badge } from "@/components/ui/badge";
import { collectWeeklyPicks, type WeeklyPick } from "@/lib/weekly-picks";
import { gameAccentText, gameBadge } from "@/lib/game-config";
import type { Challenge, GameEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

type WeeklyPicksSectionProps = {
  events: GameEvent[];
  challenges: Challenge[];
  className?: string;
};

function WeeklyPickCard({ pick }: { pick: WeeklyPick }) {
  return (
    <div className="rounded-xl border border-border/50 bg-background/30 p-4">
      <div className="flex flex-wrap items-start gap-2">
        <h3 className="text-sm font-semibold leading-snug text-foreground sm:text-base">
          {pick.name}
        </h3>
        <Badge variant="outline" className={gameBadge}>
          {pick.type}
        </Badge>
      </div>

      <p className={`mt-2 text-xs ${gameAccentText}`}>
        Ends in <Countdown endDate={new Date(pick.endTime).toISOString()} />
      </p>

      <div className="mt-3 space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Rewards
        </p>
        <RewardGrid rewards={pick.rewards} compact />
      </div>
    </div>
  );
}

export function WeeklyPicksSection({ events, challenges, className }: WeeklyPicksSectionProps) {
  const picks = collectWeeklyPicks(events, challenges);

  if (picks.length === 0) {
    return null;
  }

  return (
    <section id="weekly-picks" className={cn("scroll-mt-36", className)}>
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
        <span className={gameAccentText}>
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
            />
          </svg>
        </span>
        Worth it this week
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {picks.map((pick) => (
          <WeeklyPickCard key={pick.id} pick={pick} />
        ))}
      </div>
    </section>
  );
}
