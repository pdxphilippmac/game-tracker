import { fetchEnneadNewsGameData } from "@/lib/fetchers/ennead-news-game";

export async function fetchThemisData() {
  return fetchEnneadNewsGameData({
    gameId: "themis",
    enneadSlug: "themis",
    prefix: "themis",
  });
}
