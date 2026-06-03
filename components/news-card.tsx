"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardMedia } from "@/components/card-media";
import { NewsItem, GameId } from "@/lib/types";
import { GAME_CONFIG } from "@/lib/game-config";

interface NewsCardProps {
  news: NewsItem;
  gameId: GameId;
}

export function NewsCard({ news, gameId }: NewsCardProps) {
  const config = GAME_CONFIG[gameId];

  return (
    <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-colors hover:border-border">
      <a href={news.url} target="_blank" rel="noopener noreferrer" className="block">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            {news.thumbnail && (
              <CardMedia src={news.thumbnail} alt={news.title} variant="news" />
            )}

            <div className="min-w-0 flex-1 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={`border ${config.bgColor} ${config.color} text-xs`}
                >
                  {news.category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(news.date).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </div>

              <h3 className="mt-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-base">
                {news.title}
              </h3>

              {news.description && (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {news.description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </a>
    </Card>
  );
}
