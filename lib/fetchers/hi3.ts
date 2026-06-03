import { fetchEnneadNewsGameData } from "@/lib/fetchers/ennead-news-game";

export async function fetchHI3Data() {
  return fetchEnneadNewsGameData({
    gameId: "hi3",
    enneadSlug: "honkai",
    prefix: "hi3",
  });
}
