"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardMedia } from "@/components/card-media";
import { NewsItem, GameId } from "@/lib/types";
import { gameBadge } from "@/lib/game-config";
import { formatDate } from "@/lib/format";

interface NewsCardProps {
  news: NewsItem;
  gameId: GameId;
}

export function NewsCard({ news, gameId }: NewsCardProps) {
  return (
    <Card className="interactive-card group border-border/50 bg-card/40 backdrop-blur-sm">
      <a href={news.url} target="_blank" rel="noopener noreferrer" className="block">
        <CardContent className="p-0">
          <div className="flex flex-col items-stretch sm:flex-row">
            {news.thumbnail && (
              <CardMedia
                src={news.thumbnail}
                alt={news.title}
                variant="news"
                className="sm:h-full sm:min-h-full"
              />
            )}

            <div className="min-w-0 flex-1 p-3 sm:p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={`${gameBadge} text-xs`}
                >
                  {news.category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDate(news.date)}
                </span>
              </div>

              <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-base">
                {news.title}
              </h3>
            </div>
          </div>
        </CardContent>
      </a>
    </Card>
  );
}
