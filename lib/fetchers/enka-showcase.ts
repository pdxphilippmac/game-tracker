import { resolveHsrCharacter, resolveZzzCharacter } from "@/lib/enka-metadata";
import { parseHsrCharacterBuild } from "@/lib/fetchers/parse-hsr-build";
import { parseZzzCharacterBuild } from "@/lib/fetchers/parse-zzz-build";
import type {
  PlayerShowcase,
  ShowcaseCharacter,
  ShowcaseErrorCode,
  ShowcaseGameId,
} from "@/lib/showcase-types";
import { isValidShowcaseUid, normalizeShowcaseUid, SHOWCASE_UID_MAX_LENGTH, SHOWCASE_UID_MIN_LENGTH } from "@/lib/showcase-uid";

const ENKA_API = "https://enka.network/api";
const USER_AGENT = "GachaTracker/1.0 (game-news-app)";

type EnkaFetchResult =
  | { ok: true; data: unknown; ttl: number }
  | { ok: false; code: ShowcaseErrorCode; message: string; status: number };

function mapEnkaStatus(status: number): ShowcaseErrorCode {
  if (status === 400) {
    return "invalid_uid";
  }
  if (status === 404) {
    return "not_found";
  }
  if (status === 424) {
    return "maintenance";
  }
  if (status === 429) {
    return "rate_limited";
  }
  return "upstream_error";
}

async function fetchEnkaJson(url: string): Promise<EnkaFetchResult> {
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    cache: "no-store",
  });

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof (body as { message: unknown }).message === "string"
        ? (body as { message: string }).message
        : `Enka returned ${response.status}`;

    return {
      ok: false,
      code: mapEnkaStatus(response.status),
      message,
      status: response.status,
    };
  }

  if (
    typeof body === "object" &&
    body !== null &&
    "message" in body &&
    typeof (body as { message: unknown }).message === "string"
  ) {
    const message = (body as { message: string }).message;
    const lower = message.toLowerCase();

    if (lower.includes("does not exist")) {
      return { ok: false, code: "not_found", message, status: 404 };
    }
    if (lower.includes("rate")) {
      return { ok: false, code: "rate_limited", message, status: 429 };
    }
    if (lower.includes("empty") || lower.includes("showcase")) {
      return { ok: false, code: "showcase_closed", message, status: 200 };
    }

    return { ok: false, code: "upstream_error", message, status: 502 };
  }

  const ttl =
    typeof body === "object" &&
    body !== null &&
    "ttl" in body &&
    typeof (body as { ttl: unknown }).ttl === "number"
      ? (body as { ttl: number }).ttl
      : 60;

  return { ok: true, data: body, ttl };
}

function enkaUrl(gameId: ShowcaseGameId, uid: string): string {
  if (gameId === "hsr") {
    return `${ENKA_API}/hsr/uid/${uid}`;
  }
  return `${ENKA_API}/zzz/uid/${uid}`;
}

type HsrDetailInfo = {
  nickname?: string;
  signature?: string;
  level?: number;
  worldLevel?: number;
  avatarDetailList?: Parameters<typeof parseHsrCharacterBuild>[0][];
};

type HsrEnkaResponse = {
  detailInfo?: HsrDetailInfo;
};

type ZzzEnkaResponse = {
  PlayerInfo?: {
    SocialDetail?: {
      ProfileDetail?: {
        Nickname?: string;
        Level?: number;
      };
      Desc?: string;
    };
    ShowcaseDetail?: {
      AvatarList?: Parameters<typeof parseZzzCharacterBuild>[0][];
    };
  };
};

async function parseHsrShowcase(
  uid: string,
  raw: HsrEnkaResponse,
  ttl: number,
): Promise<PlayerShowcase> {
  const detail = raw.detailInfo ?? {};
  const avatars = detail.avatarDetailList ?? [];
  const characters: ShowcaseCharacter[] = [];

  for (const avatar of avatars) {
    const meta = await resolveHsrCharacter(avatar.avatarId);
    characters.push({
      id: String(avatar.avatarId),
      name: meta.name,
      iconUrl: meta.iconUrl,
      level: avatar.level,
      rarity: meta.rarity,
      element: meta.element,
      path: meta.path,
      specialLevel: avatar.rank ?? 0,
      promotion: avatar.promotion,
      hsrBuild: await parseHsrCharacterBuild(avatar),
    });
  }

  return {
    uid,
    gameId: "hsr",
    nickname: detail.nickname ?? "Trailblazer",
    signature: detail.signature,
    level: detail.level ?? 0,
    worldLevel: detail.worldLevel,
    characters,
    ttl,
    fetchedAt: new Date().toISOString(),
    showcaseEmpty: characters.length === 0,
  };
}

async function parseZzzShowcase(
  uid: string,
  raw: ZzzEnkaResponse,
  ttl: number,
): Promise<PlayerShowcase> {
  const player = raw.PlayerInfo ?? {};
  const profile = player.SocialDetail?.ProfileDetail ?? {};
  const avatars = player.ShowcaseDetail?.AvatarList ?? [];
  const characters: ShowcaseCharacter[] = [];

  for (const avatar of avatars) {
    const meta = await resolveZzzCharacter(avatar.Id);
    characters.push({
      id: String(avatar.Id),
      name: meta.name,
      iconUrl: meta.iconUrl,
      level: avatar.Level,
      rarity: meta.rarity,
      specialLevel: avatar.TalentLevel ?? 0,
      promotion: avatar.PromotionLevel,
      zzzBuild: await parseZzzCharacterBuild(avatar),
    });
  }

  return {
    uid,
    gameId: "zzz",
    nickname: profile.Nickname ?? "Proxy",
    signature: player.SocialDetail?.Desc,
    level: profile.Level ?? 0,
    characters,
    ttl,
    fetchedAt: new Date().toISOString(),
    showcaseEmpty: characters.length === 0,
  };
}

export class ShowcaseFetchError extends Error {
  code: ShowcaseErrorCode;
  status: number;

  constructor(message: string, code: ShowcaseErrorCode, status: number) {
    super(message);
    this.name = "ShowcaseFetchError";
    this.code = code;
    this.status = status;
  }
}

export async function fetchPlayerShowcase(
  gameId: ShowcaseGameId,
  rawUid: string,
): Promise<PlayerShowcase> {
  const uid = normalizeShowcaseUid(rawUid);

  if (!isValidShowcaseUid(uid)) {
    throw new ShowcaseFetchError(
      `UID must be ${SHOWCASE_UID_MIN_LENGTH}–${SHOWCASE_UID_MAX_LENGTH} digits.`,
      "invalid_uid",
      400,
    );
  }

  const result = await fetchEnkaJson(enkaUrl(gameId, uid));

  if (!result.ok) {
    throw new ShowcaseFetchError(result.message, result.code, result.status);
  }

  if (gameId === "hsr") {
    return parseHsrShowcase(uid, result.data as HsrEnkaResponse, result.ttl);
  }

  return parseZzzShowcase(uid, result.data as ZzzEnkaResponse, result.ttl);
}
