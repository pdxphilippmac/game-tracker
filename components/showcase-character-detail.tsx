import { RarityStars } from "@/components/rarity-stars";
import { gameAccentText, gameBadge } from "@/lib/game-config";
import type {
  HsrCharacterBuild,
  ShowcaseCharacter,
  ShowcaseGameId,
  ShowcaseSetBonus,
  ShowcaseStat,
  ZzzCharacterBuild,
} from "@/lib/showcase-types";
import { Badge } from "@/components/ui/badge";

type ShowcaseCharacterDetailProps = {
  character: ShowcaseCharacter;
  gameId: ShowcaseGameId;
};

const SPECIAL_LEVEL_LABEL: Record<ShowcaseGameId, string> = {
  hsr: "Eidolon",
  zzz: "Mindscape",
};

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function StatGrid({ stats, title }: { stats: ShowcaseStat[]; title: string }) {
  if (stats.length === 0) {
    return null;
  }

  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={`${stat.type}-${stat.label}`} className="min-w-0">
            <dt className="truncate text-[11px] text-muted-foreground">{stat.label}</dt>
            <dd className="text-sm font-semibold text-foreground">{stat.display}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SetBonusList({ bonuses }: { bonuses: ShowcaseSetBonus[] }) {
  if (bonuses.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {bonuses.map((bonus) => (
        <Badge key={bonus.setId} variant="outline" className={gameBadge}>
          {bonus.setName} ({bonus.count})
        </Badge>
      ))}
    </div>
  );
}

function HsrBuildPanel({ build }: { build: HsrCharacterBuild }) {
  return (
    <div className="space-y-5">
      <StatGrid stats={build.finalStats} title="Final Stats" />

      {build.lightCone && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Light Cone
          </h4>
          <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/30 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={build.lightCone.iconUrl}
              alt=""
              width={56}
              height={56}
              className="h-14 w-14 shrink-0 rounded-lg bg-muted/30 object-cover"
            />
            <div className="min-w-0">
              <p className="font-semibold text-foreground">{build.lightCone.name}</p>
              <RarityStars rarity={build.lightCone.rarity} />
              <p className="mt-1 text-xs text-muted-foreground">
                Lv. {build.lightCone.level}
                {build.lightCone.superimposition > 0 &&
                  ` · S${build.lightCone.superimposition}`}
                {build.lightCone.path && ` · ${build.lightCone.path}`}
              </p>
            </div>
          </div>
        </div>
      )}

      <SetBonusList bonuses={build.setBonuses} />

      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Relics
        </h4>
        <ul className="grid gap-3 sm:grid-cols-2">
          {build.relics.map((relic) => (
            <li
              key={`${relic.slot}-${relic.setId}`}
              className="rounded-lg border border-border/50 bg-background/30 p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{relic.slot}</p>
                <p className="text-xs text-muted-foreground">+{relic.level}</p>
              </div>
              <p className="mb-2 text-xs text-muted-foreground">{relic.setName}</p>
              {relic.mainStat && (
                <p className={`text-sm font-medium ${gameAccentText}`}>
                  {relic.mainStat.label}: {relic.mainStat.display}
                </p>
              )}
              {relic.substats.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {relic.substats.map((sub) => (
                    <li
                      key={`${sub.type}-${sub.label}`}
                      className="text-xs text-muted-foreground"
                    >
                      {sub.label}: {sub.display}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {build.skills.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Traces
          </h4>
          <div className="flex flex-wrap gap-2">
            {build.skills.map((skill) => (
              <Badge key={skill.label} variant="outline" className="text-xs">
                {skill.label} Lv.{skill.level}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ZzzBuildPanel({ build }: { build: ZzzCharacterBuild }) {
  return (
    <div className="space-y-5">
      {build.wEngine && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            W-Engine
          </h4>
          <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/30 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={build.wEngine.iconUrl}
              alt=""
              width={56}
              height={56}
              className="h-14 w-14 shrink-0 rounded-lg bg-muted/30 object-cover"
            />
            <div className="min-w-0">
              <p className="font-semibold text-foreground">{build.wEngine.name}</p>
              <RarityStars rarity={build.wEngine.rarity} />
              <p className="mt-1 text-xs text-muted-foreground">
                Lv. {build.wEngine.level}
                {build.wEngine.refinement > 0 && ` · Ref. ${build.wEngine.refinement}`}
              </p>
            </div>
          </div>
        </div>
      )}

      <SetBonusList bonuses={build.setBonuses} />

      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Drive Discs
        </h4>
        <ul className="grid gap-3 sm:grid-cols-2">
          {build.discs.map((disc) => (
            <li
              key={`${disc.slot}-${disc.suitId}`}
              className="rounded-lg border border-border/50 bg-background/30 p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{disc.slotLabel}</p>
                <p className="text-xs text-muted-foreground">+{disc.level}</p>
              </div>
              <p className="mb-2 text-xs text-muted-foreground">{disc.suitName}</p>
              <p className={`text-sm font-medium ${gameAccentText}`}>
                {disc.mainStat.label}: {disc.mainStat.display}
              </p>
              {disc.substats.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {disc.substats.map((sub) => (
                    <li
                      key={`${sub.type}-${sub.label}`}
                      className="text-xs text-muted-foreground"
                    >
                      {sub.label}: {sub.display}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      <StatGrid stats={build.stats} title="Disc Stats (combined)" />

      {build.skills.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {build.skills.map((skill) => (
              <Badge key={skill.label} variant="outline" className="text-xs">
                {skill.label} Lv.{skill.level}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ShowcaseCharacterDetail({
  character,
  gameId,
}: ShowcaseCharacterDetailProps) {
  const build = gameId === "hsr" ? character.hsrBuild : character.zzzBuild;

  return (
    <details className="group relative rounded-xl border border-border/50 bg-background/40 [&_summary::-webkit-details-marker]:hidden [&_summary::marker]:hidden">
      <summary className="flex w-full cursor-pointer list-none touch-manipulation items-center gap-3 p-3 text-left transition-colors hover:bg-background/60 active:bg-background/60 [-webkit-tap-highlight-color:transparent]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={character.iconUrl}
          alt=""
          width={56}
          height={56}
          className="pointer-events-none h-14 w-14 shrink-0 rounded-full bg-muted/30 object-cover"
        />
        <div className="pointer-events-none min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground">{character.name}</p>
            <RarityStars rarity={character.rarity} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Lv. {character.level}
            {character.specialLevel !== undefined &&
              character.specialLevel > 0 &&
              ` · ${SPECIAL_LEVEL_LABEL[gameId]} ${character.specialLevel}`}
            {(character.element || character.path) &&
              ` · ${[character.element, character.path].filter(Boolean).join(" · ")}`}
          </p>
          {gameId === "hsr" && character.hsrBuild && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              {character.hsrBuild.relics.length} relics · Tap for full build
            </p>
          )}
          {gameId === "zzz" && character.zzzBuild && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              {character.zzzBuild.discs.length} discs · Tap for full build
            </p>
          )}
        </div>
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center self-center rounded-lg text-muted-foreground transition-transform group-open:rotate-180"
          aria-hidden="true"
        >
          <ChevronDownIcon className="h-6 w-6" />
        </span>
      </summary>

      <div className="border-t border-border/40 p-4 pt-3">
        {build ? (
          <>
            {gameId === "hsr" && character.hsrBuild ? (
              <HsrBuildPanel build={character.hsrBuild} />
            ) : null}
            {gameId === "zzz" && character.zzzBuild ? (
              <ZzzBuildPanel build={character.zzzBuild} />
            ) : null}
            {gameId === "hsr" && (
              <p className="mt-4 text-[11px] text-muted-foreground">
                Final stats include character base, light cone, relics, traces, and
                static 2-piece set bonuses. Conditional 4-piece effects and
                eidolon bonuses may not be included.
              </p>
            )}
            {gameId === "zzz" && (
              <p className="mt-4 text-[11px] text-muted-foreground">
                Disc stats are summed from Enka showcase data. Final in-game totals
                include agent base stats, core skills, and set passives.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Build details are not available for this character.
          </p>
        )}
      </div>
    </details>
  );
}
