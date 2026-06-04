"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Countdown } from "@/components/countdown";
import { GameIcon } from "@/components/game-icon";
import type { ActiveBannerEntry } from "@/lib/cross-game";
import { surfaceCard } from "@/lib/game-config";
type ActiveBannerOverviewCardProps = {
  entry: ActiveBannerEntry;
  onSelect: () => void;
};

function getProgressPercent(startTime: number, endTime: number, now: number): number {
  const total = endTime - startTime;
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, ((now - startTime) / total) * 100));
}

function MiniProgressBar({ startTime, endTime }: { startTime: number; endTime: number }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const progress = getProgressPercent(startTime, endTime, now);

  return (
    <div
      className="h-1 overflow-hidden rounded-full bg-secondary"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Banner progress"
    >
      <div
        className="h-full rounded-full bg-[var(--game-accent)] transition-[width] duration-500 motion-reduce:transition-none"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function FeaturedAvatars({ entry }: { entry: ActiveBannerEntry }) {
  const featured = [
    ...entry.banner.characters.filter((c) => c.rarity >= 5),
    ...entry.banner.weapons.filter((w) => w.rarity >= 5),
  ].slice(0, 3);

  if (featured.length === 0) return null;

  return (
    <div className="flex -space-x-1.5">
      {featured.map((item) =>
        "icon" in item && item.icon ? (
          <Image
            key={String(item.id)}
            src={item.icon}
            alt={item.name}
            width={28}
            height={28}
            className="h-7 w-7 shrink-0 rounded-md border border-background object-cover"
            unoptimized
          />
        ) : (
          <div
            key={String(item.id)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-background bg-muted text-[10px] text-muted-foreground"
          >
            ?
          </div>
        ),
      )}
    </div>
  );
}

export function ActiveBannerOverviewCard({ entry, onSelect }: ActiveBannerOverviewCardProps) {
  const { banner, gameId, shortName, featuredNames } = entry;
  const hasFeatured = featuredNames.length > 0;
  const title = hasFeatured ? featuredNames.join(" · ") : banner.name;
  const showSubtitle = hasFeatured && banner.name !== title;

  return (
    <button
      type="button"
      onClick={onSelect}
      data-game-theme={gameId}
      className={`interactive-card ${surfaceCard} group flex w-[min(100%,16rem)] shrink-0 flex-col p-3.5 text-left sm:min-w-[11rem] sm:max-w-[14rem] sm:flex-1`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <GameIcon gameId={gameId} className="h-3.5 w-3.5 shrink-0 text-game-accent" />
          <span className="truncate text-xs font-medium text-foreground">{shortName}</span>
        </div>
        <FeaturedAvatars entry={entry} />
      </div>

      <p className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-foreground">
        {title}
      </p>

      {showSubtitle && (
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{banner.name}</p>
      )}

      <div className="mt-auto space-y-1.5 pt-3">
        <MiniProgressBar startTime={banner.startTime} endTime={banner.endTime} />
        <p className="text-xs text-muted-foreground">
          Ends in{" "}
          <Countdown
            endDate={new Date(banner.endTime).toISOString()}
            className="font-medium text-foreground"
          />
        </p>
      </div>
    </button>
  );
}
