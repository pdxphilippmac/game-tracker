type CardMediaVariant = "banner" | "event" | "announcement" | "news";

type CardMediaProps = {
  src: string;
  alt: string;
  variant?: CardMediaVariant;
};

const VARIANT_CLASSES: Record<CardMediaVariant, string> = {
  banner:
    "w-full border-b border-border/40 md:w-60 md:shrink-0 md:border-b-0 md:border-r lg:w-72",
  event:
    "w-full border-b border-border/40 md:w-52 md:shrink-0 md:border-b-0 md:border-r lg:w-56",
  announcement:
    "w-full border-b border-border/40 md:w-52 md:shrink-0 md:border-b-0 md:border-r lg:w-56",
  news: "w-full border-b border-border/40 sm:w-44 sm:shrink-0 sm:border-b-0 sm:border-r md:w-48",
};

const INNER_CLASSES: Record<CardMediaVariant, string> = {
  banner: "aspect-[16/9] md:aspect-[4/3] md:min-h-[11rem]",
  event: "aspect-[16/9] md:aspect-[4/3] md:min-h-[10rem]",
  announcement: "aspect-[16/9] md:aspect-[4/3] md:min-h-[10rem]",
  news: "aspect-[16/9] sm:aspect-[4/3] sm:min-h-[9rem]",
};

export function CardMedia({
  src,
  alt,
  variant = "event",
}: CardMediaProps) {
  return (
    <div className={`overflow-hidden bg-muted/30 ${VARIANT_CLASSES[variant]}`}>
      <div className={`relative w-full ${INNER_CLASSES[variant]}`}>
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      </div>
    </div>
  );
}
