import type { GameData } from "@/lib/types";
import { emptyGameData } from "@/lib/fetchers/empty-game-data";

const NEWS_URL = "https://nte.perfectworld.com/en/";

export async function fetchN2EData(): Promise<GameData> {
  return {
    ...emptyGameData(
      "n2e",
      "NTE ist vorerst nicht angebunden — keine öffentliche Banner-/Patch-API wie bei HSR/ZZZ."
    ),
    news: [
      {
        id: "n2e-stub",
        title: "Neverness to Everness — bald verfügbar",
        category: "Info",
        kind: "general",
        date: new Date().toISOString(),
        url: NEWS_URL,
        description:
          "Dieses Spiel kommt später. Aktuell tracken wir HSR, ZZZ, WuWa und Arknights: Endfield.",
      },
    ],
  };
}
