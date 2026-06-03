"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActivityTimeBar } from "@/components/activity-time-bar";
import { CardMedia } from "@/components/card-media";
import { GameEvent, GameId } from "@/lib/types";
import { GAME_CONFIG } from "@/lib/game-config";

interface EventCardProps {
  event: GameEvent;
  gameId: GameId;
}

export function EventCard({ event, gameId }: EventCardProps) {
  const config = GAME_CONFIG[gameId];

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
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
                className={`border ${config.bgColor} ${config.color}`}
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
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {event.rewards.map((reward) => (
                    <div
                      key={String(reward.id)}
                      className="flex items-start gap-2 rounded-lg border border-border/40 bg-background/40 p-2.5"
                    >
                      {reward.icon && (
                        <img
                          src={reward.icon}
                          alt=""
                          className="mt-0.5 h-8 w-8 shrink-0 rounded-sm object-cover"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm leading-snug text-foreground">{reward.name}</p>
                        {reward.amount > 0 && (
                          <p className="text-xs text-muted-foreground">×{reward.amount}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <ActivityTimeBar
              startTime={event.startTime}
              endTime={event.endTime}
              accentClass={config.color}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
