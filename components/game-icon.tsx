import type { ComponentType, SVGProps } from "react";
import type { GameId } from "@/lib/types";
import { cn } from "@/lib/utils";

type IconProps = SVGProps<SVGSVGElement>;

function HsrIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      {/* Tilted orbital ring — Trailblazer motif */}
      <ellipse
        cx="12"
        cy="12"
        rx="8.75"
        ry="3.85"
        transform="rotate(-32 12 12)"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      {/* 4-point star with concave sides */}
      <path
        d="M12 3.75Q14.2 9.8 20.25 12Q14.2 14.2 12 20.25Q9.8 14.2 3.75 12Q9.8 9.8 12 3.75Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ZzzIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="4.5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M8 8.5h8M8 15.5h8M15.5 8.5 8.5 15.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WuwaIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        d="M4 10c2.5-3 5-3 7.5 0s5 3 7.5 0"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M4 14c2.5-3 5-3 7.5 0s5 3 7.5 0"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M4 18c2.5-3 5-3 7.5 0s5 3 7.5 0"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EndfieldIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        d="M12 4 17 8.5v7L12 20 7 15.5v-7L12 4Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M12 8v8M9 10.5h6M9 13.5h6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function N2eIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        d="M7.5 8.5c0 3 1.5 5 4.5 5s4.5-2 4.5-5-1.5-5-4.5-5-4.5 2-4.5 5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 15.5c0 3 1.5 5 4.5 5s4.5-2 4.5-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

const GAME_ICONS: Record<GameId, ComponentType<IconProps>> = {
  hsr: HsrIcon,
  zzz: ZzzIcon,
  wuwa: WuwaIcon,
  endfield: EndfieldIcon,
  n2e: N2eIcon,
};

type GameIconProps = IconProps & {
  gameId: GameId;
};

export function GameIcon({ gameId, className, ...props }: GameIconProps) {
  const Icon = GAME_ICONS[gameId];
  return <Icon className={className} {...props} />;
}
