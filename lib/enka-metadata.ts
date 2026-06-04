import { getFromCache, setInCache } from "@/lib/cache";
const ENKA_UI = "https://enka.network";
const METADATA_CACHE_KEY = "enka-metadata";
const METADATA_TTL_MS = 24 * 60 * 60 * 1000;

type HsrCharacterMeta = {
  name: string;
  rarity: number;
  element: string;
  path: string;
  iconUrl: string;
};

type ZzzCharacterMeta = {
  name: string;
  rarity: number;
  iconUrl: string;
};

type EnkaMetadata = {
  hsr: Record<string, HsrCharacterMeta>;
  zzz: Record<string, ZzzCharacterMeta>;
  loadedAt: number;
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { "User-Agent": "GachaTracker/1.0" },
    next: { revalidate: 86_400 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function loadMetadata(): Promise<EnkaMetadata> {
  const cached = getFromCache<EnkaMetadata>(METADATA_CACHE_KEY);
  if (cached && Date.now() - cached.loadedAt < METADATA_TTL_MS) {
    return cached;
  }

  const [hsrCharacters, zzzAvatars] = await Promise.all([
    fetchJson<
      Record<
        string,
        {
          name: string;
          rarity: number;
          element: string;
          path: string;
        }
      >
    >(
      "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/index_new/en/characters.json",
    ),
    fetchJson<
      Record<
        string,
        {
          Name: string;
          Rarity: number;
          CircleIcon: string;
        }
      >
    >(
      "https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/zzz/avatars.json",
    ),
  ]);

  const hsr: Record<string, HsrCharacterMeta> = {};
  for (const [id, character] of Object.entries(hsrCharacters)) {
    hsr[id] = {
      name: character.name,
      rarity: character.rarity,
      element: character.element,
      path: character.path,
      iconUrl: `${ENKA_UI}/ui/hsr/SpriteOutput/AvatarRoundIcon/${id}.png`,
    };
  }

  const zzz: Record<string, ZzzCharacterMeta> = {};
  for (const [id, avatar] of Object.entries(zzzAvatars)) {
    const iconPath = avatar.CircleIcon.startsWith("/")
      ? avatar.CircleIcon
      : `/ui/zzz/${avatar.CircleIcon}`;
    const nameParts = avatar.Name.replace(/^Avatar_/, "").split("_");
    const displayName = nameParts[nameParts.length - 1] ?? avatar.Name;
    zzz[id] = {
      name: displayName,
      rarity: avatar.Rarity,
      iconUrl: `${ENKA_UI}${iconPath}`,
    };
  }

  const metadata: EnkaMetadata = { hsr, zzz, loadedAt: Date.now() };
  setInCache(METADATA_CACHE_KEY, metadata);
  return metadata;
}

export async function resolveHsrCharacter(
  avatarId: number | string,
): Promise<HsrCharacterMeta> {
  const id = String(avatarId);
  const metadata = await loadMetadata();
  const known = metadata.hsr[id];

  if (known) {
    return known;
  }

  return {
    name: `Character ${id}`,
    rarity: 5,
    element: "",
    path: "",
    iconUrl: `${ENKA_UI}/ui/hsr/SpriteOutput/AvatarRoundIcon/${id}.png`,
  };
}

export async function resolveZzzCharacter(
  agentId: number | string,
): Promise<ZzzCharacterMeta> {
  const id = String(agentId);
  const metadata = await loadMetadata();
  const known = metadata.zzz[id];

  if (known) {
    return known;
  }

  return {
    name: `Agent ${id}`,
    rarity: 4,
    iconUrl: `${ENKA_UI}/ui/zzz/IconRoleCircle01.png`,
  };
}
