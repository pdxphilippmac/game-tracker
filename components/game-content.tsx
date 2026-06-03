"use client";

import type { ReactNode } from "react";
import useSWR from "swr";
import { GameId, GameData, GAMES } from "@/lib/types";
import { GAME_CONFIG } from "@/lib/game-config";
import { isActiveActivity, sortByEndTime } from "@/lib/activity-utils";
import { PatchStatusBanner } from "@/components/patch-status-banner";
import { BannerCard } from "@/components/banner-card";
import { EventCard } from "@/components/event-card";
import { ChallengeCard } from "@/components/challenge-card";
import { AnnouncementCard } from "@/components/announcement-card";
import { NewsCard } from "@/components/news-card";
import { GameContentSkeleton } from "@/components/skeletons";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface GameContentProps {
  gameId: GameId;
}

function SectionHeading({
  icon,
  title,
  count,
  color,
}: {
  icon: ReactNode;
  title: string;
  count?: number;
  color: string;
}) {
  return (
    <h2 className={`mb-4 flex items-center gap-2 text-xl font-semibold text-foreground`}>
      <span className={color}>{icon}</span>
      {title}
      {count !== undefined && count > 0 && (
        <span className="text-sm font-normal text-muted-foreground">({count})</span>
      )}
    </h2>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border/50 bg-card/30 p-8 text-center">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

export function GameContent({ gameId }: GameContentProps) {
  const { data, error, isLoading } = useSWR<GameData>(
    `/api/games/${gameId}`,
    fetcher,
    {
      refreshInterval: 5 * 60 * 1000,
      revalidateOnFocus: false,
    }
  );

  const config = GAME_CONFIG[gameId];

  if (isLoading) {
    return <GameContentSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className={`mb-4 text-4xl ${config.color}`}>{config.icon}</div>
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

  const activeBanners = sortByEndTime(data.banners.filter(isActiveActivity));
  const activeEvents = sortByEndTime(data.events.filter(isActiveActivity));
  const activeChallenges = sortByEndTime(data.challenges.filter(isActiveActivity));
  const announcements = data.announcements ?? [];
  const news = data.news ?? [];

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
      <PatchStatusBanner
        patchStatus={data.patchStatus}
        gameId={gameId}
        dataError={data.error}
        officialUrl={GAMES[gameId].website}
      />

      {data.error && data.banners.length + data.events.length + data.news.length > 0 && (
        <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          Partial data: {data.error}
        </div>
      )}

      <section>
        <SectionHeading
          icon={starIcon}
          title="Active Banners"
          count={activeBanners.length}
          color={config.color}
        />
        {activeBanners.length > 0 ? (
          <div className="flex flex-col gap-4">
            {activeBanners.map((banner) => (
              <BannerCard key={String(banner.id)} banner={banner} gameId={gameId} />
            ))}
          </div>
        ) : (
          <EmptyState message="No active banners at the moment" />
        )}
      </section>

      <section>
        <SectionHeading
          icon={eventIcon}
          title="Active In-Game Events"
          count={activeEvents.length}
          color={config.color}
        />
        {activeEvents.length > 0 ? (
          <div className="flex flex-col gap-4">
            {activeEvents.map((event) => (
              <EventCard key={String(event.id)} event={event} gameId={gameId} />
            ))}
          </div>
        ) : (
          <EmptyState message="No active in-game events right now" />
        )}
      </section>

      {activeChallenges.length > 0 && (
        <section>
          <SectionHeading
            icon={eventIcon}
            title="Active Challenges"
            count={activeChallenges.length}
            color={config.color}
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

      <section>
        <SectionHeading
          icon={megaphoneIcon}
          title="Announcements"
          count={announcements.length}
          color={config.color}
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
          <EmptyState message="No patch or maintenance announcements available" />
        )}
      </section>

      <section>
        <SectionHeading
          icon={newsIcon}
          title="Latest News"
          count={news.length}
          color={config.color}
        />
        {news.length > 0 ? (
          <div className="flex flex-col gap-3">
            {news.map((item) => (
              <NewsCard key={item.id} news={item} gameId={gameId} />
            ))}
          </div>
        ) : (
          <EmptyState message="No news available" />
        )}
      </section>

      <p className="text-xs text-muted-foreground">
        Last updated:{" "}
        {new Date(data.lastUpdated).toLocaleString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  );
}
