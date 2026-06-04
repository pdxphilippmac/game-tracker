"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActivityTimeBar } from "@/components/activity-time-bar";
import { CardMedia } from "@/components/card-media";
import { RarityStars } from "@/components/rarity-stars";
import { Banner, BannerCharacter, BannerWeapon, GameId } from "@/lib/types";
import { gameAccentText, gameBadge } from "@/lib/game-config";
import { cn } from "@/lib/utils";

interface BannerCardProps {
  banner: Banner;
  gameId: GameId;
  featured?: boolean;
  priority?: boolean;
}

function CharacterTile({ character }: { character: BannerCharacter }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-background/40 p-3">
      {character.icon ? (
        <Image
          src={character.icon}
          alt={character.name}
          width={56}
          height={56}
          className="h-14 w-14 shrink-0 rounded-md object-cover"
          unoptimized
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
          ?
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug text-foreground">{character.name}</p>
        <RarityStars rarity={character.rarity} />
        {(character.element || character.path) && (
          <p className="mt-1 text-xs leading-snug text-muted-foreground">
            {[character.element, character.path].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}

function WeaponTile({ weapon }: { weapon: BannerWeapon }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-background/40 p-3">
      {weapon.icon ? (
        <Image
          src={weapon.icon}
          alt={weapon.name}
          width={56}
          height={56}
          className="h-14 w-14 shrink-0 rounded-md object-cover"
          unoptimized
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
          ?
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug text-foreground">{weapon.name}</p>
        <RarityStars rarity={weapon.rarity} />
      </div>
    </div>
  );
}

export function BannerCard({ banner, gameId, featured = false, priority = false }: BannerCardProps) {
  const featuredCharacters = banner.characters.filter((char) => char.rarity >= 5);
  const rateUpCharacters = banner.characters.filter((char) => char.rarity < 5);
  const featuredWeapons = banner.weapons.filter((weapon) => weapon.rarity >= 5);
  const rateUpWeapons = banner.weapons.filter((weapon) => weapon.rarity < 5);
  const rateUpItems = [...rateUpCharacters, ...rateUpWeapons];

  return (
    <Card
      className={cn(
        "interactive-card border-border bg-card/50 backdrop-blur-sm",
        featured && "ring-1 ring-border",
      )}
    >
      <CardContent className="p-0">
        <div className={cn("flex flex-col items-stretch", !featured && "md:flex-row")}>
          {banner.imageUrl && (
            <CardMedia
              src={banner.imageUrl}
              alt={banner.name}
              variant={featured ? "banner-hero" : "banner"}
              priority={priority}
            />
          )}

          <div className="min-w-0 flex-1 p-4 sm:p-5">
            <div className="flex flex-wrap items-start gap-2">
              <h3 className={cn("font-semibold leading-snug text-foreground", featured ? "text-lg sm:text-xl" : "text-base sm:text-lg")}>
                {banner.name}
              </h3>
              {banner.version && (
                <span className="text-sm text-muted-foreground">Version {banner.version}</span>
              )}
              <Badge
                variant="outline"
                className={gameBadge}
              >
                {banner.type}
              </Badge>
            </div>

            {(featuredCharacters.length > 0 || featuredWeapons.length > 0) && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Featured
                </p>
                <div className={cn("grid gap-3", featured ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 xl:grid-cols-3")}>
                  {featuredCharacters.map((character) => (
                    <CharacterTile key={String(character.id)} character={character} />
                  ))}
                  {featuredWeapons.map((weapon) => (
                    <WeaponTile key={String(weapon.id)} weapon={weapon} />
                  ))}
                </div>
              </div>
            )}

            {rateUpItems.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Rate-up
                </p>
                <div className="flex flex-wrap gap-2">
                  {rateUpItems.map((item) => (
                    <Badge
                      key={String(item.id)}
                      variant="outline"
                      className="h-auto max-w-full whitespace-normal border-border/60 px-2.5 py-1 text-xs leading-snug"
                    >
                      {item.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <ActivityTimeBar
              startTime={banner.startTime}
              endTime={banner.endTime}
              accentClass={gameAccentText}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
