import { getFromCache, setInCache } from "@/lib/cache";

const ENKA_UI = "https://enka.network";
const SR_RES =
  "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/index_new/en";
const ENKA_STORE =
  "https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store";

const BUILD_METADATA_KEY = "showcase-build-metadata";
const BUILD_METADATA_TTL_MS = 24 * 60 * 60 * 1000;

type MainAffixEntry = Record<
  string,
  { Property: string; BaseValue: number; LevelAdd?: number; StepValue?: number }
>;

type BuildMetadata = {
  hsrLightCones: Record<
    string,
    { name: string; rarity: number; path: string; iconUrl: string }
  >;
  hsrRelicSets: Record<
    string,
    {
      name: string;
      desc: string[];
      properties?: Array<Array<{ type: string; value: number }>>;
    }
  >;
  hsrCharacterPromotions: Record<
    string,
    {
      values: Array<{
        hp: { base: number; step: number };
        atk: { base: number; step: number };
        def: { base: number; step: number };
        spd: { base: number; step: number };
        crit_rate: { base: number; step: number };
        crit_dmg: { base: number; step: number };
      }>;
    }
  >;
  hsrSkillTrees: Record<
    string,
    {
      levels?: Array<{
        level?: number;
        properties?: Array<{ type: string; value: number }>;
      }>;
    }
  >;
  hsrHonkerRelics: Record<
    string,
    { MainAffixGroup: number; SubAffixGroup: number; SetID: number; Type: string }
  >;
  hsrMainAffixes: Record<string, MainAffixEntry>;
  hsrSubAffixes: Record<string, MainAffixEntry>;
  zzzProperties: Record<string, { Name: string; Format: string }>;
  zzzLocs: Record<string, string>;
  zzzWeapons: Record<
    string,
    { rarity: number; iconUrl: string; nameKey: string }
  >;
  zzzEquipmentItems: Record<string, { Rarity: number; SuitId: number }>;
  zzzSuits: Record<string, { Name: string; Icon: string }>;
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

async function loadBuildMetadata(): Promise<BuildMetadata> {
  const cached = getFromCache<BuildMetadata>(BUILD_METADATA_KEY);
  if (cached && Date.now() - cached.loadedAt < BUILD_METADATA_TTL_MS) {
    return cached;
  }

  const [
    lightCones,
    relicSets,
    characterPromotions,
    skillTrees,
    honkerRelics,
    affixes,
    zzzProperties,
    zzzLocsRoot,
    zzzWeapons,
    zzzEquipments,
  ] = await Promise.all([
    fetchJson<
      Record<
        string,
        { name: string; rarity: number; path: string; icon: string }
      >
    >(`${SR_RES}/light_cones.json`),
    fetchJson<
      Record<
        string,
        {
          name: string;
          desc: string[];
          properties?: Array<Array<{ type: string; value: number }>>;
        }
      >
    >(`${SR_RES}/relic_sets.json`),
    fetchJson<BuildMetadata["hsrCharacterPromotions"]>(
      `${SR_RES}/character_promotions.json`,
    ),
    fetchJson<BuildMetadata["hsrSkillTrees"]>(
      `${SR_RES}/character_skill_trees.json`,
    ),
    fetchJson<
      Record<
        string,
        {
          MainAffixGroup: number;
          SubAffixGroup: number;
          SetID: number;
          Type: string;
        }
      >
    >(`${ENKA_STORE}/hsr/honker_relics.json`),
    fetchJson<{
      MainAffix: Record<string, MainAffixEntry>;
      SubAffix: Record<string, MainAffixEntry>;
    }>(`${ENKA_STORE}/hsr/affixes.json`),
    fetchJson<Record<string, { Name: string; Format: string }>>(
      `${ENKA_STORE}/zzz/property.json`,
    ),
    fetchJson<{ en: Record<string, string> }>(`${ENKA_STORE}/zzz/locs.json`),
    fetchJson<
      Record<
        string,
        {
          ItemName: string;
          Rarity: number;
          ImagePath: string;
        }
      >
    >(`${ENKA_STORE}/zzz/weapons.json`),
    fetchJson<{
      Items: Record<string, { Rarity: number; SuitId: number }>;
      Suits: Record<string, { Name: string; Icon: string }>;
    }>(`${ENKA_STORE}/zzz/equipments.json`),
  ]);

  const hsrLightCones: BuildMetadata["hsrLightCones"] = {};
  for (const [id, cone] of Object.entries(lightCones)) {
    hsrLightCones[id] = {
      name: cone.name,
      rarity: cone.rarity,
      path: cone.path,
      iconUrl: `${ENKA_UI}/ui/hsr/SpriteOutput/LightConeFigures/${id}.png`,
    };
  }

  const hsrRelicSets: BuildMetadata["hsrRelicSets"] = {};
  for (const [id, set] of Object.entries(relicSets)) {
    hsrRelicSets[id] = {
      name: set.name,
      desc: set.desc,
      properties: set.properties,
    };
  }

  const zzzWeaponsMapped: BuildMetadata["zzzWeapons"] = {};
  for (const [id, weapon] of Object.entries(zzzWeapons)) {
    zzzWeaponsMapped[id] = {
      rarity: weapon.Rarity,
      iconUrl: `${ENKA_UI}${weapon.ImagePath}`,
      nameKey: weapon.ItemName,
    };
  }

  const metadata: BuildMetadata = {
    hsrLightCones,
    hsrRelicSets,
    hsrCharacterPromotions: characterPromotions,
    hsrSkillTrees: skillTrees,
    hsrHonkerRelics: honkerRelics,
    hsrMainAffixes: affixes.MainAffix,
    hsrSubAffixes: affixes.SubAffix,
    zzzProperties,
    zzzLocs: zzzLocsRoot.en,
    zzzWeapons: zzzWeaponsMapped,
    zzzEquipmentItems: zzzEquipments.Items,
    zzzSuits: zzzEquipments.Suits,
    loadedAt: Date.now(),
  };

  setInCache(BUILD_METADATA_KEY, metadata, BUILD_METADATA_TTL_MS);
  return metadata;
}

export async function resolveHsrLightCone(tid: number | string) {
  const metadata = await loadBuildMetadata();
  const id = String(tid);
  const known = metadata.hsrLightCones[id];

  if (known) {
    return known;
  }

  return {
    name: `Light Cone ${id}`,
    rarity: 5,
    path: "",
    iconUrl: `${ENKA_UI}/ui/hsr/SpriteOutput/LightConeFigures/${id}.png`,
  };
}

export async function resolveHsrRelicSet(setId: number | string) {
  const metadata = await loadBuildMetadata();
  const id = String(setId);
  const known = metadata.hsrRelicSets[id];

  return known?.name ?? `Set ${id}`;
}

export async function getHsrBuildMetadata() {
  const metadata = await loadBuildMetadata();
  return {
    characterPromotions: metadata.hsrCharacterPromotions,
    skillTrees: metadata.hsrSkillTrees,
    relicSets: metadata.hsrRelicSets,
    ...metadata,
  };
}

export async function resolveZzzWeapon(weaponId: number | string) {
  const metadata = await loadBuildMetadata();
  const id = String(weaponId);
  const known = metadata.zzzWeapons[id];

  if (!known) {
    return {
      name: `W-Engine ${id}`,
      rarity: 4,
      iconUrl: `${ENKA_UI}/ui/zzz/Weapon_A00.png`,
    };
  }

  return {
    name: metadata.zzzLocs[known.nameKey] ?? known.nameKey,
    rarity: known.rarity,
    iconUrl: known.iconUrl,
  };
}

export async function resolveZzzDisc(discId: number | string) {
  const metadata = await loadBuildMetadata();
  const item = metadata.zzzEquipmentItems[String(discId)];
  if (!item) {
    return { suitId: 0, suitName: "Unknown", rarity: 4 };
  }

  const suit = metadata.zzzSuits[String(item.SuitId)];
  const suitName = suit
    ? (metadata.zzzLocs[suit.Name] ?? suit.Name)
    : `Suit ${item.SuitId}`;

  return { suitId: item.SuitId, suitName, rarity: item.Rarity };
}

export async function getZzzPropertyMeta(propertyId: number | string) {
  const metadata = await loadBuildMetadata();
  return metadata.zzzProperties[String(propertyId)] ?? null;
}

export async function getZzzBuildMetadata() {
  return loadBuildMetadata();
}
