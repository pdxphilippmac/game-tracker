"use client";

import type { ReactNode } from "react";
import { Banner, GameId } from "@/lib/types";
import { gameAccentText, gameBadge } from "@/lib/game-config";
import { isRunningActivity, isUpcomingActivity, sortByEndTime, sortByStartTime } from "@/lib/activity-utils";
import { BannerCard } from "@/components/banner-card";
import { BannerPreviewCard } from "@/components/banner-preview-card";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type BannerSectionProps = {
  banners: Banner[];
  gameId: GameId;
  icon: ReactNode;
  tab: string;
  onTabChange: (tab: string) => void;
  phaseLabelsByStart?: Map<number, string>;
  onShowUpcoming?: () => void;
};

export function BannerSection({
  banners,
  gameId,
  icon,
  tab,
  onTabChange,
  phaseLabelsByStart,
  onShowUpcoming,
}: BannerSectionProps) {
  const runningBanners = sortByEndTime(banners.filter(isRunningActivity));
  const upcomingBanners = sortByStartTime(banners.filter(isUpcomingActivity));

  return (
    <section id="banners" className="scroll-mt-36">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <span className={gameAccentText}>{icon}</span>
          Banners
        </h2>
      </div>

      <Tabs value={tab} onValueChange={onTabChange}>
        <TabsList>
          <TabsTrigger value="active">
            Active
            {runningBanners.length > 0 && (
              <span className="ml-1 text-xs text-muted-foreground">
                ({runningBanners.length})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming
            {upcomingBanners.length > 0 && (
              <span className={`ml-1 text-xs ${gameAccentText}`}>
                ({upcomingBanners.length})
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4 animate-in fade-in duration-200 motion-reduce:animate-none">
          {runningBanners.length > 0 ? (
            <div className="flex flex-col gap-4">
              {runningBanners.map((banner, index) => (
                <BannerCard
                  key={String(banner.id)}
                  banner={banner}
                  gameId={gameId}
                  featured={runningBanners.length === 1}
                  priority={index === 0}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={icon}
              message="No banners are running right now"
              action={
                upcomingBanners.length > 0 && onShowUpcoming ? (
                  <button
                    type="button"
                    onClick={onShowUpcoming}
                    className={`text-sm font-medium ${gameAccentText} hover:underline`}
                  >
                    View {upcomingBanners.length} upcoming banner
                    {upcomingBanners.length === 1 ? "" : "s"} →
                  </button>
                ) : undefined
              }
            />
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="mt-4 animate-in fade-in duration-200 motion-reduce:animate-none">
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
            <EmptyState message="No upcoming banners in the data" />
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}
