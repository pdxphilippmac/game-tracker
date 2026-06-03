import { cn } from "@/lib/utils";

type CardMediaVariant = "banner" | "event" | "announcement" | "news" | "banner-hero";

type CardMediaProps = {
  src: string;
  alt: string;
  variant?: CardMediaVariant;
  priority?: boolean;
  className?: string;
};

const VARIANT_CLASSES: Record<CardMediaVariant, string> = {
  banner:
    "w-full md:w-60 md:shrink-0 lg:w-72 md:border-r md:border-border/40 max-md:border-b max-md:border-border/40",
  "banner-hero": "w-full border-b border-border/40",
  event:
    "w-full md:w-52 md:shrink-0 lg:w-56 md:border-r md:border-border/40 max-md:border-b max-md:border-border/40",
  announcement:
    "w-full md:w-52 md:shrink-0 lg:w-56 md:border-r md:border-border/40 max-md:border-b max-md:border-border/40",
  news: "w-full sm:w-44 sm:shrink-0 md:w-48 sm:border-r sm:border-border/40 max-md:border-b max-md:border-border/40",
};

const FRAME_CLASSES: Record<CardMediaVariant, string> = {
  banner: "aspect-video md:aspect-auto md:min-h-[11rem]",
  "banner-hero": "aspect-[21/9] min-h-[12rem] sm:min-h-[14rem]",
  event: "aspect-video md:aspect-auto md:min-h-[10rem]",
  announcement: "aspect-video md:aspect-auto md:min-h-[10rem]",
  news: "aspect-video sm:aspect-auto sm:min-h-[9rem]",
};

const OBJECT_POSITION: Record<CardMediaVariant, string> = {
  banner: "object-top",
  "banner-hero": "object-center",
  event: "object-top",
  announcement: "object-top",
  news: "object-top",
};

export function CardMedia({
  src,
  alt,
  variant = "event",
  priority = false,
  className,
}: CardMediaProps) {
  const isSideMedia = variant !== "banner-hero";

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden",
        VARIANT_CLASSES[variant],
        FRAME_CLASSES[variant],
        isSideMedia && "md:h-full md:self-stretch",
        className,
      )}
    >
      {/* Native img — external CDN URLs, avoids Next/Image fill wrapper gaps */}
      <img
        src={src}
        alt={alt}
        decoding="async"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        className={cn(
          "absolute inset-0 block size-full max-w-none object-cover",
          OBJECT_POSITION[variant],
        )}
      />
      {variant === "banner-hero" && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
      )}
    </div>
  );
}
