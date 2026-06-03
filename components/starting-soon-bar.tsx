"use client";

import { Countdown } from "@/components/countdown";
import {
  collectStartingSoonItems,
  STARTING_SOON_KIND_LABELS,
  type StartingSoonItem,
} from "@/lib/starting-soon";
import { gameAccentText } from "@/lib/game-config";
import type { Challenge, GameEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

type StartingSoonBarProps = {
  events: GameEvent[];
  challenges: Challenge[];
  className?: string;
};

function scrollToSection(targetId: string) {
  document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function StartingSoonChip({ item }: { item: StartingSoonItem }) {
  return (
    <button
      type="button"
      onClick={() => scrollToSection(item.scrollTargetId)}
      className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-sky-400/25 bg-sky-400/5 px-3 py-1.5 text-left transition-colors hover:border-sky-400/40 hover:bg-sky-400/10"
    >
      <span className="text-[10px] font-medium uppercase tracking-wide text-sky-300/80">
        {STARTING_SOON_KIND_LABELS[item.kind]}
      </span>
      <span className="max-w-[10rem] truncate text-xs font-medium text-foreground sm:max-w-none">
        {item.name}
      </span>
      <span className={`text-xs font-mono tabular-nums ${gameAccentText}`}>
        in <Countdown endDate={new Date(item.startTime).toISOString()} />
      </span>
    </button>
  );
}

export function StartingSoonBar({ events, challenges, className }: StartingSoonBarProps) {
  const items = collectStartingSoonItems(events, challenges);

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-sky-400/20 bg-sky-400/5 px-4 py-3",
        className,
      )}
    >
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-sky-300/90">
        Starting soon
      </p>
      <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <StartingSoonChip key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
