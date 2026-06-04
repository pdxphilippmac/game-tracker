"use client";

import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShowcaseCharacterDetail } from "@/components/showcase-character-detail";
import { fetchPlayerShowcaseClient } from "@/lib/showcase-fetcher";
import { gameAccentText, gamePanel } from "@/lib/game-config";
import {
  getStoredShowcaseUid,
  isValidShowcaseUid,
  normalizeShowcaseUid,
  setStoredShowcaseUid,
} from "@/lib/showcase-uid";
import type { ShowcaseGameId } from "@/lib/showcase-types";
import { cn } from "@/lib/utils";

type ShowcaseSectionProps = {
  gameId: ShowcaseGameId;
};

function userIcon() {
  return (
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
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

export function ShowcaseSection({ gameId }: ShowcaseSectionProps) {
  const [inputUid, setInputUid] = useState("");
  const [activeUid, setActiveUid] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredShowcaseUid(gameId);
    if (stored) {
      setInputUid(stored);
      setActiveUid(stored);
    } else {
      setInputUid("");
      setActiveUid(null);
    }
    setFormError(null);
  }, [gameId]);

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    activeUid ? [`showcase`, gameId, activeUid] : null,
    () => fetchPlayerShowcaseClient(gameId, activeUid!),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30_000,
    },
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const uid = normalizeShowcaseUid(inputUid);

      if (!isValidShowcaseUid(uid)) {
        setFormError("UID must be 8–12 digits.");
        return;
      }

      setFormError(null);
      setStoredShowcaseUid(gameId, uid);
      setActiveUid(uid);
    },
    [gameId, inputUid],
  );

  const handleClear = useCallback(() => {
    setStoredShowcaseUid(gameId, null);
    setInputUid("");
    setActiveUid(null);
    setFormError(null);
    void mutate(undefined, { revalidate: false });
  }, [gameId, mutate]);

  const loadError = error instanceof Error ? error.message : null;

  return (
    <section id="showcase" className="scroll-mt-36">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
        <span className={gameAccentText}>{userIcon()}</span>
        Character Showcase
      </h2>

      <Card className={cn("border-border/50 bg-card/50 backdrop-blur-sm", gamePanel)}>
        <CardContent className="space-y-4 p-4 sm:p-5">
          <p className="text-sm text-muted-foreground">
            Enter your in-game UID. Data comes from{" "}
            <a
              href="https://enka.network"
              className="underline underline-offset-2 hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enka.Network
            </a>
            . Your Character Showcase must be enabled in-game.
          </p>

          <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleSubmit}>
            <div className="min-w-0 flex-1">
              <label
                htmlFor={`showcase-uid-${gameId}`}
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                UID
              </label>
              <input
                id={`showcase-uid-${gameId}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                placeholder={gameId === "zzz" ? "e.g. 1504787828" : "e.g. 717141410"}
                value={inputUid}
                onChange={(event) => setInputUid(event.target.value.replace(/\D/g, ""))}
                className="w-full rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              {formError && (
                <p className="mt-1.5 text-xs text-destructive" role="alert">
                  {formError}
                </p>
              )}
            </div>

            <div className="flex shrink-0 gap-2">
              <Button type="submit" disabled={isLoading || isValidating}>
                {isLoading || isValidating ? "Loading…" : "Load"}
              </Button>
              {activeUid && (
                <Button type="button" variant="outline" onClick={handleClear}>
                  Clear
                </Button>
              )}
            </div>
          </form>

          {loadError && (
            <div
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {loadError}
            </div>
          )}

          {data && !loadError && (
            <div className="space-y-4 border-t border-border/40 pt-4">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="text-lg font-semibold text-foreground">{data.nickname}</p>
                <p className="text-sm text-muted-foreground">
                  UID {data.uid}
                  {data.level > 0 && ` · Lv. ${data.level}`}
                  {data.worldLevel !== undefined && ` · WL ${data.worldLevel}`}
                </p>
              </div>

              {data.signature && (
                <p className="text-sm italic text-muted-foreground">
                  &ldquo;{data.signature}&rdquo;
                </p>
              )}

              {data.showcaseEmpty ? (
                <p className="text-sm text-amber-200/90">
                  No characters in showcase. Enable Character Showcase in game settings
                  and add characters to your display slots.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {data.characters.map((character) => (
                    <li key={character.id}>
                      <ShowcaseCharacterDetail
                        character={character}
                        gameId={gameId}
                      />
                    </li>
                  ))}
                </ul>
              )}

              <p className="text-[11px] text-muted-foreground">
                Cached up to {data.ttl}s per Enka. Last fetched{" "}
                {new Date(data.fetchedAt).toLocaleString()}.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
