import {
  getZzzPropertyMeta,
  resolveZzzDisc,
  resolveZzzWeapon,
} from "@/lib/showcase-metadata";
import {
  formatZzzProperty,
  sortZzzStats,
  ZZZ_DISC_SLOTS,
  ZZZ_SKILL_LABELS,
} from "@/lib/showcase-stat";
import type {
  ShowcaseSetBonus,
  ShowcaseSkill,
  ShowcaseStat,
  ZzzCharacterBuild,
} from "@/lib/showcase-types";

type ZzzPropertyRaw = {
  PropertyId: number;
  PropertyLevel?: number;
  PropertyValue: number;
};

type ZzzDiscRaw = {
  Slot: number;
  Equipment: {
    Id: number;
    Level: number;
    MainPropertyList: ZzzPropertyRaw[];
    RandomPropertyList: ZzzPropertyRaw[];
  };
};

type ZzzWeaponRaw = {
  Id: number;
  Level: number;
  UpgradeLevel?: number;
};

type ZzzAvatarRaw = {
  Id: number;
  Level: number;
  TalentLevel?: number;
  PromotionLevel?: number;
  Weapon?: ZzzWeaponRaw;
  EquippedList?: ZzzDiscRaw[];
  SkillLevelList?: Array<{ Level: number; Index: number }>;
};

async function mapZzzProperty(
  propertyId: number,
  value: number,
): Promise<ShowcaseStat> {
  const meta = await getZzzPropertyMeta(propertyId);
  return formatZzzProperty(propertyId, value, meta);
}

function countZzzSetBonuses(
  discs: ZzzCharacterBuild["discs"],
): ShowcaseSetBonus[] {
  const counts = new Map<number, { setName: string; count: number }>();

  for (const disc of discs) {
    const existing = counts.get(disc.suitId);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(disc.suitId, { setName: disc.suitName, count: 1 });
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

export async function parseZzzCharacterBuild(
  avatar: ZzzAvatarRaw,
): Promise<ZzzCharacterBuild> {
  const discs: ZzzCharacterBuild["discs"] = [];
  const statTotals = new Map<string, ShowcaseStat>();

  for (const slot of [...(avatar.EquippedList ?? [])].sort(
    (a, b) => a.Slot - b.Slot,
  )) {
    const equipment = slot.Equipment;
    const discMeta = await resolveZzzDisc(equipment.Id);
    const mainRaw = equipment.MainPropertyList[0];
    const mainStat = mainRaw
      ? await mapZzzProperty(mainRaw.PropertyId, mainRaw.PropertyValue)
      : { type: "0", label: "—", value: 0, display: "—" };

    const substats: ShowcaseStat[] = [];
    for (const sub of equipment.RandomPropertyList) {
      substats.push(await mapZzzProperty(sub.PropertyId, sub.PropertyValue));
    }

    for (const stat of [mainStat, ...substats]) {
      const key = stat.type;
      const existing = statTotals.get(key);
      if (existing) {
        existing.value += stat.value;
        existing.display = formatZzzProperty(
          key,
          existing.value,
          await getZzzPropertyMeta(key),
        ).display;
      } else {
        statTotals.set(key, { ...stat });
      }
    }

    discs.push({
      slot: slot.Slot,
      slotLabel: ZZZ_DISC_SLOTS[slot.Slot] ?? `Disc ${slot.Slot}`,
      level: equipment.Level,
      suitId: discMeta.suitId,
      suitName: discMeta.suitName,
      mainStat,
      substats,
    });
  }

  let wEngine = null;
  if (avatar.Weapon?.Id) {
    const weaponMeta = await resolveZzzWeapon(avatar.Weapon.Id);
    wEngine = {
      id: String(avatar.Weapon.Id),
      name: weaponMeta.name,
      iconUrl: weaponMeta.iconUrl,
      level: avatar.Weapon.Level,
      refinement: avatar.Weapon.UpgradeLevel ?? 0,
      rarity: weaponMeta.rarity,
    };
  }

  const skills: ShowcaseSkill[] = (avatar.SkillLevelList ?? [])
    .filter((skill) => skill.Level > 0)
    .sort((a, b) => a.Index - b.Index)
    .map((skill) => ({
      label: ZZZ_SKILL_LABELS[skill.Index] ?? `Skill ${skill.Index}`,
      level: skill.Level,
    }));

  return {
    wEngine,
    discs,
    setBonuses: countZzzSetBonuses(discs),
    stats: sortZzzStats([...statTotals.values()]),
    skills,
  };
}
