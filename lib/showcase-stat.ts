import type { ShowcaseStat } from "@/lib/showcase-types";

const HSR_STAT_LABELS: Record<string, string> = {
  BaseHP: "Base HP",
  BaseAttack: "Base ATK",
  BaseDefence: "Base DEF",
  HPDelta: "HP",
  AttackDelta: "ATK",
  DefenceDelta: "DEF",
  HPAddedRatio: "HP%",
  AttackAddedRatio: "ATK%",
  DefenceAddedRatio: "DEF%",
  SpeedDelta: "SPD",
  CriticalChance: "CRIT Rate",
  CriticalChanceBase: "CRIT Rate",
  CriticalDamage: "CRIT DMG",
  CriticalDamageBase: "CRIT DMG",
  StatusProbability: "Effect Hit Rate",
  StatusProbabilityBase: "Effect Hit Rate",
  StatusResistance: "Effect RES",
  StatusResistanceBase: "Effect RES",
  HealRatio: "Outgoing Healing",
  HealRatioBase: "Outgoing Healing",
  PhysicalAddedRatio: "Physical DMG",
  FireAddedRatio: "Fire DMG",
  IceAddedRatio: "Ice DMG",
  ThunderAddedRatio: "Lightning DMG",
  WindAddedRatio: "Wind DMG",
  QuantumAddedRatio: "Quantum DMG",
  ImaginaryAddedRatio: "Imaginary DMG",
  BreakDamageAddedRatio: "Break Effect",
  BreakDamageAddedRatioBase: "Break Effect",
};

const HSR_PERCENT_TYPES = new Set([
  "HPAddedRatio",
  "AttackAddedRatio",
  "DefenceAddedRatio",
  "CriticalChance",
  "CriticalChanceBase",
  "CriticalDamage",
  "CriticalDamageBase",
  "StatusProbability",
  "StatusProbabilityBase",
  "StatusResistance",
  "StatusResistanceBase",
  "HealRatio",
  "HealRatioBase",
  "PhysicalAddedRatio",
  "FireAddedRatio",
  "IceAddedRatio",
  "ThunderAddedRatio",
  "WindAddedRatio",
  "QuantumAddedRatio",
  "ImaginaryAddedRatio",
  "BreakDamageAddedRatio",
  "BreakDamageAddedRatioBase",
]);

const HSR_STAT_ORDER = [
  "AttackAddedRatio",
  "CriticalChance",
  "CriticalChanceBase",
  "CriticalDamage",
  "CriticalDamageBase",
  "SpeedDelta",
  "HPAddedRatio",
  "StatusProbability",
  "StatusProbabilityBase",
  "BreakDamageAddedRatio",
  "BreakDamageAddedRatioBase",
  "HPDelta",
  "AttackDelta",
  "DefenceDelta",
  "BaseAttack",
  "BaseHP",
  "BaseDefence",
];

export function formatHsrStat(type: string, value: number): ShowcaseStat {
  const label = HSR_STAT_LABELS[type] ?? type;
  let display: string;

  if (HSR_PERCENT_TYPES.has(type)) {
    display = `${(value * 100).toFixed(1)}%`;
  } else if (type === "SpeedDelta") {
    display = value.toFixed(0);
  } else {
    display = Math.round(value).toLocaleString();
  }

  return { type, label, value, display };
}

export function sortHsrStats(stats: ShowcaseStat[]): ShowcaseStat[] {
  return [...stats].sort((a, b) => {
    const ai = HSR_STAT_ORDER.indexOf(a.type);
    const bi = HSR_STAT_ORDER.indexOf(b.type);
    const aRank = ai === -1 ? 999 : ai;
    const bRank = bi === -1 ? 999 : bi;
    return aRank - bRank || a.label.localeCompare(b.label);
  });
}

export function aggregateHsrProps(
  propsList: Array<Array<{ type: string; value: number }>>,
): ShowcaseStat[] {
  const totals = new Map<string, number>();

  for (const props of propsList) {
    for (const prop of props) {
      totals.set(prop.type, (totals.get(prop.type) ?? 0) + prop.value);
    }
  }

  return sortHsrStats(
    [...totals.entries()].map(([type, value]) => formatHsrStat(type, value)),
  );
}

type ZzzPropertyMeta = {
  Name: string;
  Format: string;
};

export function formatZzzProperty(
  propertyId: number | string,
  value: number,
  meta?: ZzzPropertyMeta | null,
): ShowcaseStat {
  const type = String(propertyId);
  const label = meta?.Name ?? `Prop ${type}`;
  const format = meta?.Format ?? "{0:0}";
  let display: string;

  if (format.includes("%")) {
    display = `${(value / 100).toFixed(1)}%`;
  } else {
    display = Math.round(value).toLocaleString();
  }

  return { type, label, value, display };
}

export function sortZzzStats(stats: ShowcaseStat[]): ShowcaseStat[] {
  const order = ["Atk", "HpMax", "Def", "CritRate", "CritDmg", "PenRatio", "PenDelta"];
  return [...stats].sort((a, b) => {
    const ai = order.indexOf(a.label);
    const bi = order.indexOf(b.label);
    const aRank = ai === -1 ? 999 : ai;
    const bRank = bi === -1 ? 999 : bi;
    return aRank - bRank || a.label.localeCompare(b.label);
  });
}

export const HSR_RELIC_SLOTS: Record<number, string> = {
  1: "Head",
  2: "Hands",
  3: "Body",
  4: "Feet",
  5: "Planar Sphere",
  6: "Link Rope",
};

export const ZZZ_DISC_SLOTS: Record<number, string> = {
  1: "Disc 1",
  2: "Disc 2",
  3: "Disc 3",
  4: "Disc 4",
  5: "Disc 5",
  6: "Disc 6",
};

export const ZZZ_SKILL_LABELS: Record<number, string> = {
  0: "Basic Attack",
  1: "Dodge",
  2: "Special Attack",
  3: "EX Special",
  5: "Assist",
  6: "Chain Attack",
};
