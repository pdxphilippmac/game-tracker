"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import useSWR from "swr";
import { GameId, GameData, GAMES } from "@/lib/types";
import { GAME_CONFIG } from "@/lib/game-config";
import { gameAccentText } from "@/lib/game-config";
import { isRunningActivity, sortByEndTime } from "@/lib/activity-utils";
import { fetchGameData } from "@/lib/game-data-fetcher";
import { DATA_REVALIDATE_SECONDS } from "@/lib/fetch-config";
import type { GameHeaderMeta } from "@/lib/game-header-meta";
import { GameHero } from "@/components/game-hero";
import { GameIcon } from "@/components/game-icon";
import { PatchStatusBanner } from "@/components/patch-status-banner";
import { BannerSection } from "@/components/banner-section";
import { EventCard } from "@/components/event-card";
import { ChallengeCard } from "@/components/challenge-card";
import { AnnouncementCard } from "@/components/announcement-card";
import { NewsCard } from "@/components/news-card";
import { EmptyState } from "@/components/empty-state";
import { SectionNav, type SectionNavItem } from "@/components/section-nav";
import { GameContentSkeleton } from "@/components/skeletons";

interface GameContentProps {
  gameId: GameId;
  onHeaderMetaChange?: (meta: GameHeaderMeta | null) => void;
}

function SectionHeading({
  icon,
  title,
  count,
}: {
  icon: ReactNode;
  title: string;
  count?: number;
}) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
      <span className={gameAccentText}>{icon}</span>
      {title}
      {count !== undefined && count > 0 && (
        <span className="text-sm font-normal text-muted-foreground">({count})</span>
      )}
    </h2>
  );
}

export function GameContent({ gameId, onHeaderMetaChange }: GameContentProps) {
  const [bannerTab, setBannerTab] = useState("active");
  const [patchDetailsOpen, setPatchDetailsOpen] = useState(false);

  useEffect(() => {
    setBannerTab("active");
    setPatchDetailsOpen(false);
  }, [gameId]);

  const { data, error, isLoading, isValidating, mutate } = useSWR<GameData>(
    `/api/games/${gameId}`,
    () => fetchGameData(gameId),
    {
      refreshInterval: DATA_REVALIDATE_SECONDS * 1000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 15_000,
    },
  );

  const handleRefresh = useCallback(async () => {
    const fresh = await fetchGameData(gameId, { forceRefresh: true });
    await mutate(fresh, { revalidate: false });
  }, [gameId, mutate]);

  const config = GAME_CONFIG[gameId];

  const activeBannerCount = useMemo(() => {
    if (!data) return 0;
    return data.banners.filter(isRunningActivity).length;
  }, [data]);

  useEffect(() => {
    if (!onHeaderMetaChange) {
      return;
    }

    if (!data) {
      onHeaderMetaChange(null);
      return;
    }

    const summaryParts: string[] = [];
    if (activeBannerCount > 0) {
      summaryParts.push(
        `${activeBannerCount} active banner${activeBannerCount === 1 ? "" : "s"}`,
      );
    }
    if (data.patchStatus?.currentVersion) {
      summaryParts.push(`Patch ${data.patchStatus.currentVersion}`);
    }

    onHeaderMetaChange({
      gameId,
      summary: summaryParts.length > 0 ? summaryParts.join(" · ") : config.name,
      lastUpdated: data.lastUpdated,
      isValidating,
      onRefresh: () => {
        void handleRefresh();
      },
    });

    return () => onHeaderMetaChange(null);
  }, [data, gameId, activeBannerCount, isValidating, onHeaderMetaChange, config.name, handleRefresh]);

  if (isLoading) {
    return <GameContentSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className={`mb-4 ${gameAccentText}`}>
          <GameIcon gameId={gameId} className="mx-auto h-10 w-10" />
        </div>
        <h3 className="mb-2 text-lg font-medium text-foreground">
          Failed to load {config.name}
        </h3>
        <p className="max-w-md text-sm text-muted-foreground">
          Could not fetch data. This might be due to the game&apos;s servers being
          unavailable or rate limiting. Please try again later.
        </p>
      </div>
    );
  }

  const activeEvents = sortByEndTime(
    data.events.filter((event) => {
      const now = Date.now();
      return event.endTime > now && event.startTime <= now;
    }),
  );
  const activeChallenges = sortByEndTime(
    data.challenges.filter((challenge) => {
      const now = Date.now();
      return challenge.endTime > now && challenge.startTime <= now;
    }),
  );
  const announcements = data.announcements ?? [];
  const news = data.news ?? [];

  const phaseLabelsByStart = new Map<number, string>();
  if (data.patchStatus?.currentPhase?.startTime) {
    phaseLabelsByStart.set(
      data.patchStatus.currentPhase.startTime,
      data.patchStatus.currentPhase.label,
    );
  }
  if (data.patchStatus?.nextMilestone?.startTime) {
    phaseLabelsByStart.set(
      data.patchStatus.nextMilestone.startTime,
      data.patchStatus.nextMilestone.label,
    );
  }

  const activeBanners = sortByEndTime(data.banners.filter(isRunningActivity));
  const primaryBanner = activeBanners[0] ?? null;

  function showUpcomingBanners() {
    setBannerTab("upcoming");
    requestAnimationFrame(() => {
      document.getElementById("banners")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function scrollToBanners() {
    document.getElementById("banners")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const navSections: SectionNavItem[] = [
    { id: "patch-status", label: "Overview" },
    { id: "banners", label: "Banners" },
    { id: "events", label: "Events" },
  ];
  if (activeChallenges.length > 0) {
    navSections.push({ id: "challenges", label: "Challenges" });
  }
  navSections.push(
    { id: "announcements", label: "Announcements" },
    { id: "news", label: "News" },
  );

  const starIcon = (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  );

  const eventIcon = (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );

  const megaphoneIcon = (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
      />
    </svg>
  );

  const newsIcon = (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
      />
    </svg>
  );

  return (
    <div className="space-y-8">
      <section id="patch-status" className="scroll-mt-36 space-y-4">
        <GameHero
          patchStatus={data.patchStatus}
          activeBanner={primaryBanner}
          activeBannerCount={activeBanners.length}
          dataError={data.error}
          officialUrl={GAMES[gameId].website}
          showDetails={patchDetailsOpen}
          onToggleDetails={() => setPatchDetailsOpen((open) => !open)}
          onShowUpcoming={showUpcomingBanners}
          onScrollToBanners={scrollToBanners}
        />

        {patchDetailsOpen && (
          <PatchStatusBanner
            patchStatus={data.patchStatus}
            gameId={gameId}
            dataError={data.error}
            officialUrl={GAMES[gameId].website}
            onShowUpcoming={showUpcomingBanners}
            compact
          />
        )}
      </section>

      <SectionNav sections={navSections} />

      {data.error && data.banners.length + data.events.length + data.news.length > 0 && (
        <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          Partial data: {data.error}
        </div>
      )}

      <BannerSection
        banners={data.banners}
        gameId={gameId}
        icon={starIcon}
        tab={bannerTab}
        onTabChange={setBannerTab}
        phaseLabelsByStart={phaseLabelsByStart}
        onShowUpcoming={showUpcomingBanners}
      />

      <section id="events" className="scroll-mt-36">
        <SectionHeading
          icon={eventIcon}
          title="Active In-Game Events"
          count={activeEvents.length}
        />
        {activeEvents.length > 0 ? (
          <div className="flex flex-col gap-4">
            {activeEvents.map((event) => (
              <EventCard key={String(event.id)} event={event} gameId={gameId} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={eventIcon}
            message="No active in-game events right now"
          />
        )}
      </section>

      {activeChallenges.length > 0 && (
        <section id="challenges" className="scroll-mt-36">
          <SectionHeading
            icon={eventIcon}
            title="Active Challenges"
            count={activeChallenges.length}
          />
          <div className="flex flex-col gap-4">
            {activeChallenges.map((challenge) => (
              <ChallengeCard
                key={String(challenge.id)}
                challenge={challenge}
                gameId={gameId}
              />
            ))}
          </div>
        </section>
      )}

      <section id="announcements" className="scroll-mt-36">
        <SectionHeading
          icon={megaphoneIcon}
          title="Announcements"
          count={announcements.length}
        />
        {announcements.length > 0 ? (
          <div className="flex flex-col gap-4">
            {announcements.map((item) => (
              <AnnouncementCard
                key={item.id}
                announcement={item}
                gameId={gameId}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={megaphoneIcon}
            message="No patch or maintenance announcements available"
          />
        )}
      </section>

      <section id="news" className="scroll-mt-36">
        <SectionHeading
          icon={newsIcon}
          title="Latest News"
          count={news.length}
        />
        {news.length > 0 ? (
          <div className="flex flex-col gap-2">
            {news.map((item) => (
              <NewsCard key={item.id} news={item} gameId={gameId} />
            ))}
          </div>
        ) : (
          <EmptyState icon={newsIcon} message="No news available" />
        )}
      </section>

      <p className="text-center text-xs text-muted-foreground">
        Auto-refreshes every {Math.round(DATA_REVALIDATE_SECONDS / 60)} min
      </p>
    </div>
  );
}
