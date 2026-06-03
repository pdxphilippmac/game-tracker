"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardMedia } from "@/components/card-media";
import { NewsItem, GameId, type AnnouncementKind } from "@/lib/types";
import { GAME_CONFIG } from "@/lib/game-config";
import { ANNOUNCEMENT_LABELS } from "@/lib/news-classify";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

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

const KIND_BORDER: Record<AnnouncementKind, string> = {
  patch: "border-l-violet-400",
  maintenance: "border-l-red-400",
  special_program: "border-l-cyan-400",
  banner_info: "border-l-amber-400",
  general: "border-l-border",
};

export function AnnouncementCard({ announcement, gameId }: AnnouncementCardProps) {
  const [expanded, setExpanded] = useState(false);
  const config = GAME_CONFIG[gameId];
  const kind = announcement.kind ?? "general";

  const externalLinkProps = {
    href: announcement.url,
    target: "_blank" as const,
    rel: "noopener noreferrer",
  };

  return (
    <Card
      className={cn(
        "interactive-card border-border/50 border-l-4 bg-card/50 backdrop-blur-sm",
        KIND_BORDER[kind],
      )}
    >
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {announcement.thumbnail && (
            <a {...externalLinkProps} className="block shrink-0">
              <CardMedia
                src={announcement.thumbnail}
                alt={announcement.title}
                variant="announcement"
              />
            </a>
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
                {formatDate(announcement.date)}
              </span>
            </div>

            <h3 className="mt-3 text-base font-semibold leading-snug text-foreground sm:text-lg">
              <a
                {...externalLinkProps}
                className="transition-colors hover:text-primary"
              >
                {announcement.title}
              </a>
            </h3>

            {announcement.description && (
              <>
                <p
                  className={cn(
                    "mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground",
                    !expanded && "line-clamp-3 md:line-clamp-none",
                  )}
                >
                  {announcement.description}
                </p>
                <button
                  type="button"
                  className="mt-2 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
                  aria-expanded={expanded}
                  onClick={() => setExpanded((prev) => !prev)}
                >
                  {expanded ? "Show less" : "Show more"}
                </button>
              </>
            )}

            <a
              {...externalLinkProps}
              className="mt-4 inline-block text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Open full announcement →
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
