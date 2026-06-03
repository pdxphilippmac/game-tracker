type RarityStarsProps = {
  rarity: number;
};

export function RarityStars({ rarity }: RarityStarsProps) {
  return (
    <span className="text-[11px] tracking-tight text-amber-400" aria-label={`${rarity} stars`}>
      {"★".repeat(rarity)}
    </span>
  );
}
