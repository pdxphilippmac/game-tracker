/** Shared upstream + server cache window (seconds / ms). */
export const DATA_REVALIDATE_SECONDS = 5 * 60;
export const DATA_CACHE_TTL_MS = DATA_REVALIDATE_SECONDS * 1000;

export const upstreamFetchInit: RequestInit = {
  next: { revalidate: DATA_REVALIDATE_SECONDS },
};
