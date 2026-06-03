"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardMedia } from "@/components/card-media";
import { NewsItem, GameId, type AnnouncementKind } from "@/lib/types";
import { GAME_CONFIG } from "@/lib/game-config";
import { ANNOUNCEMENT_LABELS } from "@/lib/news-classify";

interface AnnouncementCardProps {
  announcement: NewsItem;
  gameId: GameId;
}

const KIND_STYLES: Record<AnnouncementKind, string> = {
  patch: "border-violet-400/30 bg-violet-400/10 text-violet-300",
  maintenance: "border-red-400/30 bg-red-400/10 text-red-300",
  special_program: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
  banner_info: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  general: "border-border/50 bg-card/30 text-muted-foreground",
};

export function AnnouncementCard({ announcement, gameId }: AnnouncementCardProps) {
  const config = GAME_CONFIG[gameId];
  const kind = announcement.kind ?? "general";

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm transition-colors hover:border-border">
      <a
        href={announcement.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {announcement.thumbnail && (
              <CardMedia src={announcement.thumbnail} alt="" variant="announcement" />
            )}

            <div className="min-w-0 flex-1 p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={`border ${KIND_STYLES[kind]}`}>
                  {ANNOUNCEMENT_LABELS[kind]}
                </Badge>
                <Badge
                  variant="outline"
                  className={`border ${config.bgColor} ${config.color}`}
                >
                  {announcement.category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(announcement.date).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </div>

              <h3 className="mt-3 text-base font-semibold leading-snug text-foreground sm:text-lg">
                {announcement.title}
              </h3>

              {announcement.description && (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {announcement.description}
                </p>
              )}

              <p className="mt-4 text-xs text-muted-foreground">
                Open full announcement →
              </p>
            </div>
          </div>
        </CardContent>
      </a>
    </Card>
  );
}
