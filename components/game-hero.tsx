"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Countdown } from "@/components/countdown";
import { Badge } from "@/components/ui/badge";
import { RarityStars } from "@/components/rarity-stars";
import type { PatchStatus } from "@/lib/patch-types";
import type { Banner } from "@/lib/types";
import { gameAccentText, gameBadge, gameHeroPanel } from "@/lib/game-config";
import { cn } from "@/lib/utils";

type GameHeroProps = {
  patchStatus: PatchStatus | null;
  activeBanner: Banner | null;
  activeBannerCount: number;
  dataError?: string;
  officialUrl?: string;
  showDetails: boolean;
  onToggleDetails: () => void;
  onShowUpcoming: () => void;
  onScrollToBanners: () => void;
};

function getProgressPercent(startTime: number, endTime: number, now: number): number {
  const total = endTime - startTime;
  if (total <= 0) {
    return 0;
  }
  return Math.min(100, Math.max(0, ((now - startTime) / total) * 100));
}

function ProgressBar({ startTime, endTime }: { startTime: number; endTime: number }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const progress = getProgressPercent(startTime, endTime, now);

  return (
    <div
      className="h-1.5 overflow-hidden rounded-full bg-muted/60"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Patch progress"
    >
      <div
        className="h-full rounded-full bg-[var(--game-accent)] transition-[width] duration-500 motion-reduce:transition-none"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function FeaturedIcons({ banner }: { banner: Banner }) {
  const featured = [
    ...banner.characters.filter((c) => c.rarity >= 5),
    ...banner.weapons.filter((w) => w.rarity >= 5),
  ].slice(0, 4);

  if (featured.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {featured.map((item) => (
        <div
          key={String(item.id)}
          className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/50 px-2 py-1.5"
        >
          {"icon" in item && item.icon ? (
            <Image
              src={item.icon}
              alt={item.name}
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-md object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
              ?
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-foreground">{item.name}</p>
            <RarityStars rarity={item.rarity} />
          </div>
        </div>
      ))}
    </div>
  );
}

function BannerSpotlight({
  banner,
  activeBannerCount,
  onScrollToBanners,
}: {
  banner: Banner;
  activeBannerCount: number;
  onScrollToBanners: () => void;
}) {
  const featuredNames = [
    ...banner.characters.filter((c) => c.rarity >= 5),
    ...banner.weapons.filter((w) => w.rarity >= 5),
  ].map((item) => item.name);

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-background/30">
      {banner.imageUrl ? (
        <div className="relative aspect-[16/9] w-full lg:aspect-[21/9] lg:min-h-[12rem]">
          <Image
            src={banner.imageUrl}
            alt={banner.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover object-center"
            unoptimized
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <SpotlightContent
              banner={banner}
              featuredNames={featuredNames}
              activeBannerCount={activeBannerCount}
              onScrollToBanners={onScrollToBanners}
            />
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5">
          <FeaturedIcons banner={banner} />
          <div className="mt-4">
            <SpotlightContent
              banner={banner}
              featuredNames={featuredNames}
              activeBannerCount={activeBannerCount}
              onScrollToBanners={onScrollToBanners}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SpotlightContent({
  banner,
  featuredNames,
  activeBannerCount,
  onScrollToBanners,
}: {
  banner: Banner;
  featuredNames: string[];
  activeBannerCount: number;
  onScrollToBanners: () => void;
}) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className={gameBadge}>
          Active banner
        </Badge>
        {activeBannerCount > 1 && (
          <span className="text-xs text-muted-foreground">
            +{activeBannerCount - 1} more
          </span>
        )}
      </div>
      <h3 className="mt-2 text-lg font-semibold leading-snug text-foreground sm:text-xl">
        {banner.name}
      </h3>
      {featuredNames.length > 0 && (
        <p className="mt-1 text-sm text-foreground/80">{featuredNames.join(" · ")}</p>
      )}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className={`text-sm font-medium ${gameAccentText}`}>
          Ends in{" "}
          <Countdown endDate={new Date(banner.endTime).toISOString()} />
        </p>
        <button
          type="button"
          onClick={onScrollToBanners}
          className={`text-xs font-medium ${gameAccentText} hover:underline`}
        >
          View banner details ↓
        </button>
      </div>
    </>
  );
}

function StatsPanel({
  patchStatus,
  showDetails,
  onToggleDetails,
  onShowUpcoming,
}: {
  patchStatus: PatchStatus | null;
  showDetails: boolean;
  onToggleDetails: () => void;
  onShowUpcoming: () => void;
}) {
  const versionLabel = patchStatus
    ? patchStatus.currentVersionName
      ? `${patchStatus.currentVersion} · ${patchStatus.currentVersionName}`
      : patchStatus.currentVersion
    : null;

  const nextLabel =
    patchStatus?.nextMilestone?.label ??
    patchStatus?.nextMilestone?.featuredNames?.join(" · ") ??
    patchStatus?.nextVersion?.versionName ??
    patchStatus?.nextVersion?.label;

  const nextStartTime =
    patchStatus?.nextMilestone?.startTime ?? patchStatus?.nextVersion?.startTime;

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-border/50 bg-background/40 p-4">
        {versionLabel ? (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Current patch
            </p>
            <p className={`mt-1 text-lg font-semibold leading-snug ${gameAccentText}`}>
              {versionLabel}
            </p>
          </>
        ) : (
          <p className="text-sm font-medium text-foreground">Patch schedule unavailable</p>
        )}

        {patchStatus?.patchEndTime && patchStatus.patchStartTime && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Patch ends
              </p>
              <p className={`text-sm font-mono tabular-nums ${gameAccentText}`}>
                <Countdown endDate={new Date(patchStatus.patchEndTime).toISOString()} />
              </p>
            </div>
            <ProgressBar
              startTime={patchStatus.patchStartTime}
              endTime={patchStatus.patchEndTime}
            />
          </div>
        )}

        {patchStatus?.patchEndTime && !patchStatus.patchStartTime && (
          <p className={`mt-3 text-sm ${gameAccentText}`}>
            Ends in{" "}
            <Countdown endDate={new Date(patchStatus.patchEndTime).toISOString()} />
          </p>
        )}
      </div>

      {(nextLabel || nextStartTime) && (
        <button
          type="button"
          onClick={onShowUpcoming}
          className="rounded-xl border border-border/50 bg-background/40 p-4 text-left transition-colors hover:border-[color-mix(in_oklch,var(--game-accent)_35%,var(--border))] hover:bg-background/55"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Next phase
          </p>
          {nextLabel && (
            <p className="mt-1 text-sm font-medium leading-snug text-foreground">{nextLabel}</p>
          )}
          {nextStartTime && (
            <p className={`mt-2 text-sm ${gameAccentText}`}>
              Starts in{" "}
              <Countdown endDate={new Date(nextStartTime).toISOString()} />
            </p>
          )}
        </button>
      )}

      {patchStatus && (
        <button
          type="button"
          onClick={onToggleDetails}
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          aria-expanded={showDetails}
        >
          {showDetails ? "Hide full schedule ↑" : "Full patch schedule →"}
        </button>
      )}
    </div>
  );
}

export function GameHero({
  patchStatus,
  activeBanner,
  activeBannerCount,
  dataError,
  officialUrl,
  showDetails,
  onToggleDetails,
  onShowUpcoming,
  onScrollToBanners,
}: GameHeroProps) {
  if (!patchStatus && !activeBanner) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-5 sm:p-6">
        <p className="text-sm font-medium text-foreground">No live data yet</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {dataError ??
            "No active banners or patch schedule found. Check announcements and news below."}
        </p>
        {officialUrl && (
          <a
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm text-primary hover:underline"
          >
            Open official website →
          </a>
        )}
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-2xl border backdrop-blur-xl", gameHeroPanel)}>
      <div className="flex flex-col gap-4 p-4 sm:p-5 lg:grid lg:grid-cols-5 lg:gap-5 lg:p-6">
        <div className="order-1 lg:order-2 lg:col-span-2">
          <StatsPanel
            patchStatus={patchStatus}
            showDetails={showDetails}
            onToggleDetails={onToggleDetails}
            onShowUpcoming={onShowUpcoming}
          />
        </div>

        <div className="order-2 lg:order-1 lg:col-span-3">
          {activeBanner ? (
            <BannerSpotlight
              banner={activeBanner}
              activeBannerCount={activeBannerCount}
              onScrollToBanners={onScrollToBanners}
            />
          ) : (
            <div className="flex h-full min-h-[10rem] flex-col justify-center rounded-xl border border-dashed border-border/50 bg-background/30 p-5 text-center">
              <p className="text-sm font-medium text-foreground">No active banner</p>
              {patchStatus?.currentPhase?.label && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Current phase: {patchStatus.currentPhase.label}
                </p>
              )}
              <button
                type="button"
                onClick={onShowUpcoming}
                className={`mt-4 text-sm font-medium ${gameAccentText} hover:underline`}
              >
                View upcoming banners →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
