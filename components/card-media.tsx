import Image from "next/image";
import { cn } from "@/lib/utils";

type CardMediaVariant = "banner" | "event" | "announcement" | "news" | "banner-hero";

type CardMediaProps = {
  src: string;
  alt: string;
  variant?: CardMediaVariant;
  priority?: boolean;
};

const VARIANT_CLASSES: Record<CardMediaVariant, string> = {
  banner:
    "w-full border-b border-border/40 md:w-60 md:shrink-0 md:border-b-0 md:border-r lg:w-72",
  "banner-hero": "w-full border-b border-border/40",
  event:
    "w-full border-b border-border/40 md:w-52 md:shrink-0 md:border-b-0 md:border-r lg:w-56",
  announcement:
    "w-full border-b border-border/40 md:w-52 md:shrink-0 md:border-b-0 md:border-r lg:w-56",
  news: "w-full border-b border-border/40 sm:w-44 sm:shrink-0 sm:border-b-0 sm:border-r md:w-48",
};

const INNER_CLASSES: Record<CardMediaVariant, string> = {
  banner: "aspect-[16/9] md:aspect-[4/3] md:min-h-[11rem]",
  "banner-hero": "aspect-[21/9] min-h-[12rem] sm:min-h-[14rem]",
  event: "aspect-[16/9] md:aspect-[4/3] md:min-h-[10rem]",
  announcement: "aspect-[16/9] md:aspect-[4/3] md:min-h-[10rem]",
  news: "aspect-[16/9] sm:aspect-[4/3] sm:min-h-[9rem]",
};

export function CardMedia({
  src,
  alt,
  variant = "event",
  priority = false,
}: CardMediaProps) {
  return (
    <div className={cn("overflow-hidden bg-muted/30", VARIANT_CLASSES[variant])}>
      <div className={cn("relative w-full", INNER_CLASSES[variant])}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={
            variant === "banner-hero"
              ? "100vw"
              : variant === "banner"
                ? "(max-width: 768px) 100vw, 288px"
                : "(max-width: 640px) 100vw, 224px"
          }
          className="object-cover object-center"
          loading={priority ? "eager" : "lazy"}
          priority={priority}
          unoptimized
        />
        {variant === "banner-hero" && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
        )}
      </div>
    </div>
  );
}
