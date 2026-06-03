import Image from "next/image";
import type { EventReward } from "@/lib/types";

type RewardGridProps = {
  rewards: EventReward[];
  compact?: boolean;
};

export function RewardGrid({ rewards, compact = false }: RewardGridProps) {
  if (rewards.length === 0) {
    return null;
  }

  return (
    <div
      className={
        compact
          ? "flex flex-wrap gap-2"
          : "grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
      }
    >
      {rewards.map((reward) => (
        <div
          key={String(reward.id)}
          className={
            compact
              ? "flex items-center gap-1.5 rounded-md border border-border/40 bg-background/40 px-2 py-1"
              : "flex items-start gap-2 rounded-lg border border-border/40 bg-background/40 p-2.5"
          }
        >
          {reward.icon && (
            <Image
              src={reward.icon}
              alt=""
              width={compact ? 24 : 32}
              height={compact ? 24 : 32}
              className={
                compact
                  ? "h-6 w-6 shrink-0 rounded-sm object-cover"
                  : "mt-0.5 h-8 w-8 shrink-0 rounded-sm object-cover"
              }
              unoptimized
            />
          )}
          <div className="min-w-0">
            <p className={compact ? "text-xs text-foreground" : "text-sm leading-snug text-foreground"}>
              {reward.name}
            </p>
            {reward.amount > 0 && (
              <p className="text-xs text-muted-foreground">×{reward.amount}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
