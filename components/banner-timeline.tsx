"use client";

import { buildBannerTimeline, type TimelineEntry } from "@/lib/banner-timeline";
import type { Banner } from "@/lib/types";
import type { PatchStatus } from "@/lib/patch-types";
import { gameAccentText } from "@/lib/game-config";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type BannerTimelineProps = {
  patchStatus: PatchStatus | null;
  banners: Banner[];
  className?: string;
};

const STATUS_STYLES: Record<TimelineEntry["status"], string> = {
  past: "border-border/40 bg-muted/20 text-muted-foreground",
  active: "border-[color-mix(in_oklch,var(--game-accent)_40%,var(--border))] bg-[color-mix(in_oklch,var(--game-accent)_10%,transparent)]",
  upcoming: "border-border/50 bg-background/30 text-foreground",
};

const STATUS_DOT: Record<TimelineEntry["status"], string> = {
  past: "bg-muted-foreground/40",
  active: "bg-[var(--game-accent)]",
  upcoming: "bg-muted-foreground/60",
};

function TimelineStep({ entry, isLast }: { entry: TimelineEntry; isLast: boolean }) {
  return (
    <div className="relative flex gap-3 pb-4 last:pb-0">
      {!isLast && (
        <div
          aria-hidden="true"
          className="absolute left-[7px] top-4 h-[calc(100%-4px)] w-px bg-border/60"
        />
      )}
      <div
        className={cn("relative z-10 mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full", STATUS_DOT[entry.status])}
        aria-hidden="true"
      />
      <div className={cn("min-w-0 flex-1 rounded-lg border px-3 py-2.5", STATUS_STYLES[entry.status])}>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium leading-snug">{entry.label}</p>
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {entry.status}
          </span>
        </div>
        {entry.featuredNames && entry.featuredNames.length > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">{entry.featuredNames.join(" · ")}</p>
        )}
        <p className={`mt-1.5 text-xs ${entry.status === "active" ? gameAccentText : "text-muted-foreground"}`}>
          {formatDate(entry.startTime)}
          {entry.endTime ? ` – ${formatDate(entry.endTime)}` : ""}
        </p>
      </div>
    </div>
  );
}

export function BannerTimeline({ patchStatus, banners, className }: BannerTimelineProps) {
  const entries = buildBannerTimeline(patchStatus, banners);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className={cn("rounded-xl border border-border/50 bg-background/20 p-4", className)}>
      <h3 className="mb-3 text-sm font-semibold text-foreground">Banner schedule</h3>
      <div>
        {entries.map((entry, index) => (
          <TimelineStep key={entry.id} entry={entry} isLast={index === entries.length - 1} />
        ))}
      </div>
    </div>
  );
}
