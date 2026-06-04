import { getHsrBuildMetadata, resolveHsrLightCone, resolveHsrRelicSet } from "@/lib/showcase-metadata";
import { calculateHsrFinalStats } from "@/lib/hsr-stat-calculator";
import { resolveHsrCharacter } from "@/lib/enka-metadata";
import {
  formatHsrStat,
  HSR_RELIC_SLOTS,
} from "@/lib/showcase-stat";
import type {
  HsrCharacterBuild,
  ShowcaseRelic,
  ShowcaseSetBonus,
  ShowcaseSkill,
  ShowcaseStat,
} from "@/lib/showcase-types";

type HsrProp = { type: string; value: number };

type HsrRelicRaw = {
  mainAffixId: number;
  subAffixList?: Array<{ affixId: number; cnt?: number; step?: number }>;
  tid: number;
  type: number;
  level: number;
  _flat?: {
    setID: number;
    props?: HsrProp[];
  };
};

type HsrEquipmentRaw = {
  tid: number;
  level: number;
  rank?: number;
  promotion?: number;
  _flat?: {
    props?: HsrProp[];
  };
};

type HsrAvatarRaw = {
  avatarId: number;
  level: number;
  rank?: number | null;
  promotion?: number;
  relicList?: HsrRelicRaw[];
  equipment?: HsrEquipmentRaw;
  skillTreeList?: Array<{ pointId: number; level: number }>;
};

function resolveMainStatType(
  mainAffixGroup: number,
  mainAffixId: number,
  mainAffixes: Record<string, Record<string, { Property: string }>>,
): string | null {
  const group = mainAffixes[String(mainAffixGroup)];
  const affix = group?.[String(mainAffixId)];
  return affix?.Property ?? null;
}

function splitRelicStats(
  props: HsrProp[],
  mainType: string | null,
): { mainStat: ShowcaseStat | null; substats: ShowcaseStat[] } {
  if (props.length === 0) {
    return { mainStat: null, substats: [] };
  }

  if (!mainType) {
    return {
      mainStat: formatHsrStat(props[0].type, props[0].value),
      substats: props.slice(1).map((prop) => formatHsrStat(prop.type, prop.value)),
    };
  }

  let mainStat: ShowcaseStat | null = null;
  const substats: ShowcaseStat[] = [];

  for (const prop of props) {
    if (!mainStat && prop.type === mainType) {
      mainStat = formatHsrStat(prop.type, prop.value);
    } else {
      substats.push(formatHsrStat(prop.type, prop.value));
    }
  }

  if (!mainStat) {
    mainStat = formatHsrStat(props[0].type, props[0].value);
    return { mainStat, substats: props.slice(1).map((p) => formatHsrStat(p.type, p.value)) };
  }

  return { mainStat, substats };
}

function countSetBonuses(relics: ShowcaseRelic[]): ShowcaseSetBonus[] {
  const counts = new Map<number, { setName: string; count: number }>();

  for (const relic of relics) {
    const existing = counts.get(relic.setId);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(relic.setId, { setName: relic.setName, count: 1 });
    }
  }

  return [...counts.entries()]
    .map(([setId, value]) => ({
      setId,
      setName: value.setName,
      count: value.count,
    }))
    .sort((a, b) => b.count - a.count);
}

export async function parseHsrCharacterBuild(
  avatar: HsrAvatarRaw,
): Promise<HsrCharacterBuild> {
  const metadata = await getHsrBuildMetadata();
  const characterMeta = await resolveHsrCharacter(avatar.avatarId);
  const relics: ShowcaseRelic[] = [];

  for (const relic of [...(avatar.relicList ?? [])].sort(
    (a, b) => a.type - b.type,
  )) {
    const flat = relic._flat;
    const props = flat?.props ?? [];
    const setId = flat?.setID ?? 0;
    const relicMeta = metadata.hsrHonkerRelics[String(relic.tid)];
    const mainType = relicMeta
      ? resolveMainStatType(
          relicMeta.MainAffixGroup,
          relic.mainAffixId,
          metadata.hsrMainAffixes,
        )
      : null;
    const { mainStat, substats } = splitRelicStats(props, mainType);

    relics.push({
      slot: HSR_RELIC_SLOTS[relic.type] ?? `Slot ${relic.type}`,
      level: relic.level,
      setId,
      setName: await resolveHsrRelicSet(setId),
      mainStat,
      substats,
    });
  }

  let lightCone = null;
  if (avatar.equipment?.tid) {
    const coneMeta = await resolveHsrLightCone(avatar.equipment.tid);
    lightCone = {
      id: String(avatar.equipment.tid),
      name: coneMeta.name,
      iconUrl: coneMeta.iconUrl,
      level: avatar.equipment.level,
      superimposition: avatar.equipment.rank ?? 0,
      rarity: coneMeta.rarity,
      path: coneMeta.path,
    };
  }

  const finalStats = calculateHsrFinalStats(
    {
      avatarId: avatar.avatarId,
      level: avatar.level,
      promotion: avatar.promotion ?? 0,
      element: characterMeta.element,
      relicList: avatar.relicList ?? [],
      equipment: avatar.equipment,
      skillTreeList: avatar.skillTreeList,
    },
    {
      characterPromotions: metadata.hsrCharacterPromotions,
      skillTrees: metadata.hsrSkillTrees,
      relicSets: metadata.hsrRelicSets,
    },
  );

  const skills: ShowcaseSkill[] = (avatar.skillTreeList ?? [])
    .filter((node) => node.level > 0)
    .sort((a, b) => b.level - a.level || a.pointId - b.pointId)
    .slice(0, 12)
    .map((node) => ({
      label: `Trace ${node.pointId}`,
      level: node.level,
    }));

  return {
    lightCone,
    relics,
    setBonuses: countSetBonuses(relics),
    finalStats,
    skills,
  };
}