import { Skeleton } from '@/components/ui/Skeleton';

export function ProfileSkeleton() {
  return (
    <div className="space-y-4 p-6 rounded-3xl border bg-card">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-1/2 rounded-full" />
          <Skeleton className="h-4 w-1/3 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-4 w-full rounded-full" />
      <Skeleton className="h-4 w-5/6 rounded-full" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-16 rounded-3xl" />
        <Skeleton className="h-16 rounded-3xl" />
        <Skeleton className="h-16 rounded-3xl" />
      </div>
    </div>
  );
}
