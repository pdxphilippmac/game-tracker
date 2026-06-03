"use client";

import { Countdown } from "@/components/countdown";
import {
  collectEndingSoonItems,
  ENDING_SOON_KIND_LABELS,
  type EndingSoonItem,
} from "@/lib/ending-soon";
import { gameAccentText } from "@/lib/game-config";
import type { GameData } from "@/lib/types";
import { cn } from "@/lib/utils";

type EndingSoonBarProps = {
  data: GameData;
  className?: string;
};

function scrollToSection(targetId: string) {
  document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function EndingSoonChip({ item }: { item: EndingSoonItem }) {
  return (
    <button
      type="button"
      onClick={() => scrollToSection(item.scrollTargetId)}
      className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-amber-400/25 bg-amber-400/5 px-3 py-1.5 text-left transition-colors hover:border-amber-400/40 hover:bg-amber-400/10"
    >
      <span className="text-[10px] font-medium uppercase tracking-wide text-amber-300/80">
        {ENDING_SOON_KIND_LABELS[item.kind]}
      </span>
      <span className="max-w-[10rem] truncate text-xs font-medium text-foreground sm:max-w-none">
        {item.name}
      </span>
      <span className={`text-xs font-mono tabular-nums ${gameAccentText}`}>
        <Countdown endDate={new Date(item.endTime).toISOString()} />
      </span>
    </button>
  );
}

export function EndingSoonBar({ data, className }: EndingSoonBarProps) {
  const items = collectEndingSoonItems(data);

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3",
        className,
      )}
    >
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-amber-300/90">
        Ending soon
      </p>
      <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <EndingSoonChip key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
