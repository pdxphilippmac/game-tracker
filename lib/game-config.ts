import { GameId } from "@/lib/types";

export type GameThemeConfig = {
  name: string;
  shortName: string;
  color: string;
  bgColor: string;
  /** Full Tailwind classes for active tab state (must be static strings). */
  tabActive: string;
  tabInactive: string;
};

export const GAME_CONFIG: Record<GameId, GameThemeConfig> = {
  hsr: {
    name: "Honkai: Star Rail",
    shortName: "HSR",
    color: "text-amber-400",
    bgColor: "bg-amber-400/10 hover:bg-amber-400/20 border-amber-400/30",
    tabActive:
      "border-amber-400/50 !bg-amber-400/15 !text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.15)]",
    tabInactive:
      "border-border/50 bg-card/30 text-muted-foreground hover:border-amber-400/25 hover:bg-amber-400/5",
  },
  zzz: {
    name: "Zenless Zone Zero",
    shortName: "ZZZ",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10 hover:bg-orange-400/20 border-orange-400/30",
    tabActive:
      "border-orange-400/50 !bg-orange-400/15 !text-orange-300 shadow-[0_0_20px_rgba(251,146,60,0.15)]",
    tabInactive:
      "border-border/50 bg-card/30 text-muted-foreground hover:border-orange-400/25 hover:bg-orange-400/5",
  },
  wuwa: {
    name: "Wuthering Waves",
    shortName: "WuWa",
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10 hover:bg-cyan-400/20 border-cyan-400/30",
    tabActive:
      "border-cyan-400/50 !bg-cyan-400/15 !text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.15)]",
    tabInactive:
      "border-border/50 bg-card/30 text-muted-foreground hover:border-cyan-400/25 hover:bg-cyan-400/5",
  },
  endfield: {
    name: "Arknights: Endfield",
    shortName: "Endfield",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10 hover:bg-blue-400/20 border-blue-400/30",
    tabActive:
      "border-blue-400/50 !bg-blue-400/15 !text-blue-300 shadow-[0_0_20px_rgba(96,165,250,0.15)]",
    tabInactive:
      "border-border/50 bg-card/30 text-muted-foreground hover:border-blue-400/25 hover:bg-blue-400/5",
  },
  n2e: {
    name: "Neverness to Everness",
    shortName: "NTE",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10 hover:bg-purple-400/20 border-purple-400/30",
    tabActive:
      "border-purple-400/50 !bg-purple-400/15 !text-purple-300 shadow-[0_0_20px_rgba(192,132,252,0.15)]",
    tabInactive:
      "border-border/50 bg-card/30 text-muted-foreground hover:border-purple-400/25 hover:bg-purple-400/5",
  },
};

export const GAME_IDS: GameId[] = ["hsr", "zzz", "wuwa", "endfield", "n2e"];
