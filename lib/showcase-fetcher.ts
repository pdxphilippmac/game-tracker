import type {
  PlayerShowcase,
  ShowcaseErrorResponse,
  ShowcaseGameId,
} from "@/lib/showcase-types";

export async function fetchPlayerShowcaseClient(
  gameId: ShowcaseGameId,
  uid: string,
): Promise<PlayerShowcase> {
  const response = await fetch(
    `/api/showcase/${gameId}?uid=${encodeURIComponent(uid)}`,
    { cache: "no-store" },
  );

  const body = (await response.json()) as PlayerShowcase | ShowcaseErrorResponse;

  if (!response.ok) {
    const message =
      "error" in body && typeof body.error === "string"
        ? body.error
        : "Failed to load showcase";
    throw new Error(message);
  }

  return body as PlayerShowcase;
}
