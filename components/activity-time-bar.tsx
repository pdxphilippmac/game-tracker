"use client";

import { useEffect, useState } from "react";
import { Countdown } from "@/components/countdown";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type ActivityTimeBarProps = {
  startTime: number;
  endTime: number;
  accentClass?: string;
};

function getProgressPercent(startTime: number, endTime: number, now: number): number {
  const total = endTime - startTime;
  if (total <= 0) {
    return 0;
  }
  const elapsed = now - startTime;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

export function ActivityTimeBar({
  startTime,
  endTime,
  accentClass = "text-foreground",
}: ActivityTimeBarProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const progress = getProgressPercent(startTime, endTime, now);
  const isActive = now >= startTime && now < endTime;

  return (
    <div className="mt-4 space-y-4 border-t border-border/40 pt-4">
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span className={cn(isActive && accentClass)}>{Math.round(progress)}%</span>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-muted/60"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Activity progress"
        >
          <div
            className="h-full rounded-full bg-[var(--game-accent)] transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Start
          </p>
          <p className="mt-1 text-sm leading-snug text-foreground">
            {formatDateTime(startTime)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            End
          </p>
          <p className="mt-1 text-sm leading-snug text-foreground">
            {formatDateTime(endTime)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Remaining
          </p>
          <p className={cn("mt-1 text-sm", accentClass)}>
            <Countdown endDate={new Date(endTime).toISOString()} />
          </p>
        </div>
      </div>
    </div>
  );
}
