"use client";

import { GameIcon } from "@/components/game-icon";
import { filterChip, GAME_CONFIG } from "@/lib/game-config";
import type { GameId } from "@/lib/types";
import { cn } from "@/lib/utils";

type ActiveBannerGameFilterProps = {
  gameIds: GameId[];
  selectedGameIds: Set<GameId>;
  bannerCountByGame: Record<GameId, number>;
  onToggle: (gameId: GameId) => void;
  onSelectAll: () => void;
  className?: string;
};

export function ActiveBannerGameFilter({
  gameIds,
  selectedGameIds,
  bannerCountByGame,
  onToggle,
  onSelectAll,
  className,
}: ActiveBannerGameFilterProps) {
  const allSelected = gameIds.every((id) => selectedGameIds.has(id));
  const noneSelected = gameIds.every((id) => !selectedGameIds.has(id));

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <button
        type="button"
        onClick={onSelectAll}
        aria-pressed={allSelected}
        className={filterChip}
      >
        All
      </button>

      {gameIds.map((gameId) => {
        const selected = selectedGameIds.has(gameId);
        const count = bannerCountByGame[gameId] ?? 0;

        return (
          <button
            key={gameId}
            type="button"
            onClick={() => onToggle(gameId)}
            data-game-theme={gameId}
            aria-pressed={selected}
            aria-label={`${selected ? "Hide" : "Show"} ${GAME_CONFIG[gameId].name} banners`}
            className={filterChip}
          >
            <GameIcon gameId={gameId} className="h-3.5 w-3.5 text-game-accent" />
            <span>{GAME_CONFIG[gameId].shortName}</span>
            {count > 1 && (
              <span className="text-[10px] tabular-nums text-muted-foreground">({count})</span>
            )}
          </button>
        );
      })}

      {noneSelected && (
        <span className="text-xs text-muted-foreground">Select at least one game</span>
      )}
    </div>
  );
}
