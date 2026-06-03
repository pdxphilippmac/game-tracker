"use client";

import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { gameAccentText, gameBadge } from "@/lib/game-config";
import type { RedeemCode } from "@/lib/types";
import { cn } from "@/lib/utils";

type RedeemCodesSectionProps = {
  codes: RedeemCode[];
  className?: string;
};

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard may be unavailable
    }
  }, [code]);

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className={`shrink-0 rounded-md border border-border/60 bg-background/50 px-2.5 py-1 text-xs font-medium transition-colors hover:bg-background/80 ${gameAccentText}`}
      aria-label={copied ? "Code copied" : `Copy code ${code}`}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function RedeemCodeCard({ entry }: { entry: RedeemCode }) {
  return (
    <div className="rounded-xl border border-border/50 bg-background/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-base font-semibold tracking-wide text-foreground">
            {entry.code}
          </p>
          {!entry.active && (
            <Badge variant="outline" className="mt-2 border-border/50 text-muted-foreground">
              Expired
            </Badge>
          )}
        </div>
        {entry.active && <CopyButton code={entry.code} />}
      </div>
      {entry.rewards.length > 0 && (
        <ul className="mt-3 space-y-1">
          {entry.rewards.map((reward) => (
            <li key={reward} className="text-sm text-muted-foreground">
              {reward}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function RedeemCodesSection({ codes, className }: RedeemCodesSectionProps) {
  const activeCodes = codes.filter((code) => code.active);

  if (activeCodes.length === 0) {
    return null;
  }

  return (
    <section id="redeem-codes" className={cn("scroll-mt-36", className)}>
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
        <span className={gameAccentText}>
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
              d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
            />
          </svg>
        </span>
        Active redeem codes
        <Badge variant="outline" className={`ml-1 ${gameBadge}`}>
          {activeCodes.length}
        </Badge>
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Redeem in-game via Settings → Account → Redeem Code.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {activeCodes.map((entry) => (
          <RedeemCodeCard key={entry.code} entry={entry} />
        ))}
      </div>
    </section>
  );
}
