import { GameId } from "@/lib/types";

export const GAME_CONFIG: Record<
  GameId,
  { name: string; shortName: string; color: string; bgColor: string; icon: string }
> = {
  hsr: {
    name: "Honkai: Star Rail",
    shortName: "HSR",
    color: "text-amber-400",
    bgColor: "bg-amber-400/10 hover:bg-amber-400/20 border-amber-400/30",
    icon: "✦",
  },
  zzz: {
    name: "Zenless Zone Zero",
    shortName: "ZZZ",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10 hover:bg-orange-400/20 border-orange-400/30",
    icon: "◈",
  },
  wuwa: {
    name: "Wuthering Waves",
    shortName: "WuWa",
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10 hover:bg-cyan-400/20 border-cyan-400/30",
    icon: "◇",
  },
  endfield: {
    name: "Arknights: Endfield",
    shortName: "Endfield",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10 hover:bg-blue-400/20 border-blue-400/30",
    icon: "◆",
  },
  n2e: {
    name: "Neverness to Everness",
    shortName: "N2E",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10 hover:bg-purple-400/20 border-purple-400/30",
    icon: "❖",
  },
};

export const GAME_IDS: GameId[] = ["hsr", "zzz", "wuwa", "endfield", "n2e"];
