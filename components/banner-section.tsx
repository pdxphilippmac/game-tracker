"use client";

import type { ReactNode } from "react";
import { Banner, GameId } from "@/lib/types";
import { GAME_CONFIG } from "@/lib/game-config";
import { isRunningActivity, isUpcomingActivity, sortByEndTime, sortByStartTime } from "@/lib/activity-utils";
import { BannerCard } from "@/components/banner-card";
import { BannerPreviewCard } from "@/components/banner-preview-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type BannerSectionProps = {
  banners: Banner[];
  gameId: GameId;
  icon: ReactNode;
  tab: string;
  onTabChange: (tab: string) => void;
  phaseLabelsByStart?: Map<number, string>;
};

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border/50 bg-card/30 p-8 text-center">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

export function BannerSection({
  banners,
  gameId,
  icon,
  tab,
  onTabChange,
  phaseLabelsByStart,
}: BannerSectionProps) {
  const config = GAME_CONFIG[gameId];
  const runningBanners = sortByEndTime(banners.filter(isRunningActivity));
  const upcomingBanners = sortByStartTime(banners.filter(isUpcomingActivity));

  return (
    <section id="banners">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <span className={config.color}>{icon}</span>
          Banners
        </h2>
      </div>

      <Tabs value={tab} onValueChange={onTabChange}>
        <TabsList>
          <TabsTrigger value="active">
            Aktiv
            {runningBanners.length > 0 && (
              <span className="ml-1 text-xs text-muted-foreground">
                ({runningBanners.length})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming
            {upcomingBanners.length > 0 && (
              <span className={`ml-1 text-xs ${config.color}`}>
                ({upcomingBanners.length})
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {runningBanners.length > 0 ? (
            <div className="flex flex-col gap-4">
              {runningBanners.map((banner) => (
                <BannerCard key={String(banner.id)} banner={banner} gameId={gameId} />
              ))}
            </div>
          ) : (
            <EmptyState message="Gerade läuft kein Banner" />
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="mt-4">
          {upcomingBanners.length > 0 ? (
            <div className="flex flex-col gap-3">
              {upcomingBanners.map((banner) => (
                <BannerPreviewCard
                  key={String(banner.id)}
                  banner={banner}
                  gameId={gameId}
                  phaseLabel={phaseLabelsByStart?.get(banner.startTime)}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="Keine kommenden Banner in den Daten" />
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}
