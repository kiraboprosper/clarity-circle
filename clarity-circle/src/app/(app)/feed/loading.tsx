import { PostSkeleton } from "@/components/ui/Skeleton";

export default function FeedLoading() {
  return (
    <div className="section-container py-5 max-w-3xl mx-auto space-y-6">
      {[1, 2, 3].map((i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}
