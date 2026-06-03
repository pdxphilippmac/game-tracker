import type { GameId } from "@/lib/types";

export type GameHeaderMeta = {
  gameId: GameId;
  summary?: string;
  lastUpdated: string | number;
  isValidating: boolean;
  onRefresh: () => void;
};
