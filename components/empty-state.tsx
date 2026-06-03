import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  message: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ message, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-border/50 bg-card/30 px-6 py-10 text-center",
        className,
      )}
    >
      {icon && (
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 text-lg text-muted-foreground">
          {icon}
        </div>
      )}
      <p className="text-sm leading-relaxed text-muted-foreground">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
