"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActivityTimeBar } from "@/components/activity-time-bar";
import { Challenge, GameId } from "@/lib/types";
import { GAME_CONFIG } from "@/lib/game-config";

interface ChallengeCardProps {
  challenge: Challenge;
  gameId: GameId;
}

export function ChallengeCard({ challenge, gameId }: ChallengeCardProps) {
  const config = GAME_CONFIG[gameId];

  return (
    <Card className="interactive-card border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start gap-2">
          <h3 className="text-base font-semibold leading-snug text-foreground sm:text-lg">
            {challenge.name}
          </h3>
          <Badge
            variant="outline"
            className={`border ${config.bgColor} ${config.color}`}
          >
            {challenge.type}
          </Badge>
        </div>

        <ActivityTimeBar
          startTime={challenge.startTime}
          endTime={challenge.endTime}
          accentClass={config.color}
        />
      </CardContent>
    </Card>
  );
}
