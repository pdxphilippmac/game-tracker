"use client";

import { Countdown } from "@/components/countdown";

const DATE_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

type ActivityTimeBarProps = {
  startTime: number;
  endTime: number;
  accentClass?: string;
};

export function ActivityTimeBar({
  startTime,
  endTime,
  accentClass = "text-foreground",
}: ActivityTimeBarProps) {
  return (
    <div className="grid gap-4 border-t border-border/40 pt-4 sm:grid-cols-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Start
        </p>
        <p className="mt-1 text-sm leading-snug text-foreground">
          {new Date(startTime).toLocaleString("de-DE", DATE_TIME_FORMAT)}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          End
        </p>
        <p className="mt-1 text-sm leading-snug text-foreground">
          {new Date(endTime).toLocaleString("de-DE", DATE_TIME_FORMAT)}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Remaining
        </p>
        <p className={`mt-1 text-sm ${accentClass}`}>
          <Countdown endDate={new Date(endTime).toISOString()} />
        </p>
      </div>
    </div>
  );
}
