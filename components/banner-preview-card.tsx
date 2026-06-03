"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Countdown } from "@/components/countdown";
import { RarityStars } from "@/components/rarity-stars";
import { Banner, GameId } from "@/lib/types";
import { gameAccentText, gameBadge } from "@/lib/game-config";
import { formatDateTime } from "@/lib/format";

type BannerPreviewCardProps = {
  banner: Banner;
  gameId: GameId;
  phaseLabel?: string;
};

export function BannerPreviewCard({
  banner,
  gameId,
  phaseLabel,
}: BannerPreviewCardProps) {
  const featuredCharacters = banner.characters.filter((char) => char.rarity >= 5);
  const featuredWeapons = banner.weapons.filter((weapon) => weapon.rarity >= 5);
  const featured = [...featuredCharacters, ...featuredWeapons];

  return (
    <div className="interactive-card rounded-xl border border-dashed border-border/60 bg-card/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {phaseLabel && (
              <Badge variant="outline" className={gameBadge}>
                {phaseLabel}
              </Badge>
            )}
            <Badge variant="outline" className="border-border/60 text-muted-foreground">
              {banner.type}
            </Badge>
            {banner.version && (
              <span className="text-xs text-muted-foreground">v{banner.version}</span>
            )}
          </div>
          <h3 className="mt-2 text-base font-semibold leading-snug text-foreground">
            {banner.name}
          </h3>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>Start: {formatDateTime(banner.startTime)}</p>
          <p className={`mt-1 text-sm ${gameAccentText}`}>
            <Countdown endDate={new Date(banner.startTime).toISOString()} />
          </p>
        </div>
      </div>

      {featured.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {featured.map((item) => (
            <div
              key={String(item.id)}
              className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/50 px-2.5 py-1.5"
            >
              {"icon" in item && item.icon ? (
                <Image
                  src={item.icon}
                  alt={item.name}
                  width={36}
                  height={36}
                  className="h-9 w-9 shrink-0 rounded-md object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                  ?
                </div>
              )}
              <div>
                <p className="text-sm font-medium leading-snug text-foreground">{item.name}</p>
                <RarityStars rarity={item.rarity} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
