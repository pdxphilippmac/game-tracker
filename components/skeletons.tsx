import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

function GameHeroSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-4 sm:p-5 lg:p-6">
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-5 lg:gap-5">
        <div className="order-1 space-y-3 lg:order-2 lg:col-span-2">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
        <Skeleton className="order-2 aspect-[16/9] w-full rounded-xl lg:order-1 lg:col-span-3 lg:aspect-[21/9] lg:min-h-[12rem]" />
      </div>
    </div>
  );
}

function ListItemSkeleton() {
  return (
    <Card className="border-border/50 bg-card/50">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <Skeleton className="h-40 w-full md:h-auto md:w-56 md:min-h-[220px] md:shrink-0" />
          <div className="flex-1 space-y-4 p-4 sm:p-5">
            <Skeleton className="h-6 w-2/3" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NewsRowSkeleton() {
  return (
    <Card className="border-border/50 bg-card/50">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <Skeleton className="h-24 w-full sm:h-auto sm:w-40 sm:min-h-[96px] sm:shrink-0" />
          <div className="flex-1 space-y-2 p-3 sm:p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function GameContentSkeleton() {
  return (
    <div className="space-y-8">
      <GameHeroSkeleton />
      <Skeleton className="h-10 w-full rounded-xl" />
      <section>
        <Skeleton className="mb-4 h-7 w-40" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <ListItemSkeleton key={`banner-${index}`} />
          ))}
        </div>
      </section>
      <section>
        <Skeleton className="mb-4 h-7 w-48" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <ListItemSkeleton key={`event-${index}`} />
          ))}
        </div>
      </section>
      <section>
        <Skeleton className="mb-4 h-7 w-36" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <NewsRowSkeleton key={`news-${index}`} />
          ))}
        </div>
      </section>
    </div>
  );
}

export function OverviewSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={`alert-${index}`} className="h-16 w-full rounded-xl" />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={`game-${index}`} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
