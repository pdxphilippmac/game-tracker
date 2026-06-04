import type { ShowcaseStat } from "@/lib/showcase-types";
import { formatHsrStat } from "@/lib/showcase-stat";

type PropBag = Map<string, number>;

type PromotionValues = {
  hp: { base: number; step: number };
  atk: { base: number; step: number };
  def: { base: number; step: number };
  spd: { base: number; step: number };
  crit_rate: { base: number; step: number };
  crit_dmg: { base: number; step: number };
};

type SkillTreeNode = {
  levels?: Array<{
    level?: number;
    properties?: Array<{ type: string; value: number }>;
  }>;
};

type RelicSetBonusProp = {
  type: string;
  value: number;
};

export type HsrStatCalcInput = {
  avatarId: number;
  level: number;
  promotion: number;
  element?: string;
  relicList: Array<{
    _flat?: { setID?: number; props?: Array<{ type: string; value: number }> };
  }>;
  equipment?: {
    _flat?: { props?: Array<{ type: string; value: number }> };
  };
  skillTreeList?: Array<{ pointId: number; level: number }>;
};

export type HsrCalcMetadata = {
  characterPromotions: Record<string, { values: PromotionValues[] }>;
  skillTrees: Record<string, SkillTreeNode>;
  relicSets: Record<
    string,
    { properties?: RelicSetBonusProp[][] }
  >;
};

function addProp(bag: PropBag, type: string, value: number): void {
  if (!Number.isFinite(value)) {
    return;
  }
  bag.set(type, (bag.get(type) ?? 0) + value);
}

function addProps(
  bag: PropBag,
  props: Array<{ type: string; value: number }> | undefined,
): void {
  for (const prop of props ?? []) {
    addProp(bag, prop.type, prop.value);
  }
}

function getCharacterBaseStats(
  metadata: HsrCalcMetadata,
  avatarId: number,
  level: number,
  promotion: number,
): PropBag {
  const bag: PropBag = new Map();
  const promotionData = metadata.characterPromotions[String(avatarId)];
  const tier = promotionData?.values[promotion];

  if (!tier) {
    return bag;
  }

  const levelSteps = Math.max(level - 1, 0);
  addProp(bag, "BaseHP", tier.hp.base + tier.hp.step * levelSteps);
  addProp(bag, "BaseAttack", tier.atk.base + tier.atk.step * levelSteps);
  addProp(bag, "BaseDefence", tier.def.base + tier.def.step * levelSteps);
  addProp(bag, "BaseSpeed", tier.spd.base);
  addProp(bag, "CriticalChanceBase", tier.crit_rate.base);
  addProp(bag, "CriticalDamageBase", tier.crit_dmg.base);

  return bag;
}

function getTraceStats(
  metadata: HsrCalcMetadata,
  skillTreeList: HsrStatCalcInput["skillTreeList"],
): PropBag {
  const bag: PropBag = new Map();

  for (const node of skillTreeList ?? []) {
    if (node.level <= 0) {
      continue;
    }

    const treeNode = metadata.skillTrees[String(node.pointId)];
    if (!treeNode?.levels) {
      continue;
    }

    for (const levelEntry of treeNode.levels) {
      if (!levelEntry.properties?.length) {
        continue;
      }
      if (node.level >= (levelEntry.level ?? 0)) {
        addProps(bag, levelEntry.properties);
      }
    }
  }

  return bag;
}

function getSetBonusStats(
  metadata: HsrCalcMetadata,
  relicList: HsrStatCalcInput["relicList"],
): PropBag {
  const bag: PropBag = new Map();
  const counts = new Map<number, number>();

  for (const relic of relicList) {
    const setId = relic._flat?.setID;
    if (setId === undefined) {
      continue;
    }
    counts.set(setId, (counts.get(setId) ?? 0) + 1);
  }

  for (const [setId, count] of counts) {
    const set = metadata.relicSets[String(setId)];
    const bonuses = set?.properties;
    if (!bonuses) {
      continue;
    }

    if (count >= 2 && bonuses[0]?.length) {
      addProps(bag, bonuses[0]);
    }
    if (count >= 4 && bonuses[1]?.length) {
      addProps(bag, bonuses[1]);
    }
  }

  return bag;
}

function getGearStats(input: HsrStatCalcInput): PropBag {
  const bag: PropBag = new Map();

  for (const relic of input.relicList) {
    addProps(bag, relic._flat?.props);
  }

  addProps(bag, input.equipment?._flat?.props);
  return bag;
}

function mergeBags(...bags: PropBag[]): PropBag {
  const merged: PropBag = new Map();

  for (const bag of bags) {
    for (const [type, value] of bag) {
      addProp(merged, type, value);
    }
  }

  return merged;
}

function getValue(bag: PropBag, type: string): number {
  return bag.get(type) ?? 0;
}

function sumTypes(bag: PropBag, types: string[]): number {
  return types.reduce((total, type) => total + getValue(bag, type), 0);
}

const ELEMENT_DMG_TYPE: Record<string, string> = {
  Physical: "PhysicalAddedRatio",
  Fire: "FireAddedRatio",
  Ice: "IceAddedRatio",
  Thunder: "ThunderAddedRatio",
  Lightning: "ThunderAddedRatio",
  Wind: "WindAddedRatio",
  Quantum: "QuantumAddedRatio",
  Imaginary: "ImaginaryAddedRatio",
};

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatFlat(value: number): string {
  return Math.round(value).toLocaleString();
}

export function calculateHsrFinalStats(
  input: HsrStatCalcInput,
  metadata: HsrCalcMetadata,
): ShowcaseStat[] {
  const combined = mergeBags(
    getCharacterBaseStats(
      metadata,
      input.avatarId,
      input.level,
      input.promotion,
    ),
    getGearStats(input),
    getTraceStats(metadata, input.skillTreeList),
    getSetBonusStats(metadata, input.relicList),
  );

  const maxHp =
    getValue(combined, "BaseHP") * (1 + getValue(combined, "HPAddedRatio")) +
    getValue(combined, "HPDelta");
  const attack =
    getValue(combined, "BaseAttack") *
      (1 + getValue(combined, "AttackAddedRatio")) +
    getValue(combined, "AttackDelta");
  const defense =
    getValue(combined, "BaseDefence") *
      (1 + getValue(combined, "DefenceAddedRatio")) +
    getValue(combined, "DefenceDelta");
  const speed =
    getValue(combined, "BaseSpeed") *
      (1 + getValue(combined, "SpeedAddedRatio")) +
    getValue(combined, "SpeedDelta");
  const critRate = sumTypes(combined, [
    "CriticalChanceBase",
    "CriticalChance",
  ]);
  const critDmg = sumTypes(combined, [
    "CriticalDamageBase",
    "CriticalDamage",
  ]);
  const effectHit = sumTypes(combined, [
    "StatusProbabilityBase",
    "StatusProbability",
  ]);
  const effectRes = sumTypes(combined, [
    "StatusResistanceBase",
    "StatusResistance",
  ]);
  const breakEffect = sumTypes(combined, [
    "BreakDamageAddedRatioBase",
    "BreakDamageAddedRatio",
  ]);
  const outgoingHealing = sumTypes(combined, ["HealRatioBase", "HealRatio"]);

  const stats: ShowcaseStat[] = [
    {
      type: "MaxHP",
      label: "HP",
      value: maxHp,
      display: formatFlat(maxHp),
    },
    {
      type: "Attack",
      label: "ATK",
      value: attack,
      display: formatFlat(attack),
    },
    {
      type: "Defence",
      label: "DEF",
      value: defense,
      display: formatFlat(defense),
    },
    {
      type: "Speed",
      label: "SPD",
      value: speed,
      display: formatFlat(speed),
    },
    {
      type: "CriticalChance",
      label: "CRIT Rate",
      value: critRate,
      display: formatPercent(critRate),
    },
    {
      type: "CriticalDamage",
      label: "CRIT DMG",
      value: critDmg,
      display: formatPercent(critDmg),
    },
    {
      type: "StatusProbability",
      label: "Effect Hit Rate",
      value: effectHit,
      display: formatPercent(effectHit),
    },
    {
      type: "StatusResistance",
      label: "Effect RES",
      value: effectRes,
      display: formatPercent(effectRes),
    },
    {
      type: "BreakDamageAddedRatio",
      label: "Break Effect",
      value: breakEffect,
      display: formatPercent(breakEffect),
    },
  ];

  if (outgoingHealing > 0) {
    stats.push({
      type: "HealRatio",
      label: "Outgoing Healing",
      value: outgoingHealing,
      display: formatPercent(outgoingHealing),
    });
  }

  const elementType = input.element
    ? ELEMENT_DMG_TYPE[input.element]
    : undefined;
  if (elementType) {
    const elementBonus = getValue(combined, elementType);
    if (elementBonus > 0) {
      stats.push(formatHsrStat(elementType, elementBonus));
    }
  }

  return stats;
}
