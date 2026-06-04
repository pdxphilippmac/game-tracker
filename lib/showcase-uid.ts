import type { ShowcaseGameId } from "@/lib/showcase-types";

const STORAGE_KEY = "gacha-tracker-showcase-uids";

type StoredUids = Partial<Record<ShowcaseGameId, string>>;

export function isValidShowcaseUid(uid: string): boolean {
  return /^\d{8,12}$/.test(uid.trim());
}

export function normalizeShowcaseUid(uid: string): string {
  return uid.trim();
}

export function getStoredShowcaseUid(gameId: ShowcaseGameId): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as StoredUids;
    const value = parsed[gameId];
    return value && isValidShowcaseUid(value) ? normalizeShowcaseUid(value) : null;
  } catch {
    return null;
  }
}

export function setStoredShowcaseUid(
  gameId: ShowcaseGameId,
  uid: string | null,
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: StoredUids = raw ? (JSON.parse(raw) as StoredUids) : {};

    if (uid && isValidShowcaseUid(uid)) {
      parsed[gameId] = normalizeShowcaseUid(uid);
    } else {
      delete parsed[gameId];
    }

    if (Object.keys(parsed).length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch {
    // ignore quota / private mode
  }
}
