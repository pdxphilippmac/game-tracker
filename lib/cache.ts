import { DATA_CACHE_TTL_MS } from "@/lib/fetch-config";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs?: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = DATA_CACHE_TTL_MS;

export function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;

  const ttl = entry.ttlMs ?? CACHE_TTL;
  const isExpired = Date.now() - entry.timestamp > ttl;
  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

export function setInCache<T>(key: string, data: T, ttlMs?: number): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttlMs,
  });
}

export function clearCache(): void {
  cache.clear();
}
