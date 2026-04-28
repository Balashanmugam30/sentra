import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-foreground)_8%,transparent)]",
        "bg-[linear-gradient(110deg,rgba(255,255,255,0.05),rgba(255,255,255,0.12),rgba(255,255,255,0.05))] bg-[length:200%_100%]",
        className,
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card rounded-[var(--radius-large)] p-6">
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={`skeleton-row-${index}`}
          className="glass-card flex items-center gap-3 rounded-[var(--radius-large)] p-4"
        >
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="glass-card rounded-[var(--radius-large)] p-4">
      <Skeleton className="h-[360px] w-full rounded-[var(--radius-lg)]" />
    </div>
  );
}
