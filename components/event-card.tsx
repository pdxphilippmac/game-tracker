"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActivityTimeBar } from "@/components/activity-time-bar";
import { CardMedia } from "@/components/card-media";
import { RewardGrid } from "@/components/reward-grid";
import { GameEvent, GameId } from "@/lib/types";
import { gameAccentText, gameBadge } from "@/lib/game-config";

interface EventCardProps {
  event: GameEvent;
  gameId: GameId;
}

export function EventCard({ event, gameId }: EventCardProps) {
  return (
    <Card className="interactive-card border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-0">
        <div className="flex flex-col items-stretch md:flex-row">
          {event.imageUrl && (
            <CardMedia src={event.imageUrl} alt={event.name} variant="event" />
          )}

          <div className="min-w-0 flex-1 p-4 sm:p-5">
            <div className="flex flex-wrap items-start gap-2">
              <h3 className="text-base font-semibold leading-snug text-foreground sm:text-lg">
                {event.name}
              </h3>
              <Badge
                variant="outline"
                className={gameBadge}
              >
                {event.type}
              </Badge>
            </div>

            {event.description && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {event.description}
              </p>
            )}

            {event.rewards && event.rewards.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Rewards
                </p>
                <RewardGrid rewards={event.rewards} />
              </div>
            )}

            <ActivityTimeBar
              startTime={event.startTime}
              endTime={event.endTime}
              accentClass={gameAccentText}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
