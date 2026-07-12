import { Card } from '@/components/ui/Card';
import type { Post } from '@/lib/types';

interface PostGridProps {
  posts: Post[];
}

export function PostGrid({ posts }: PostGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {posts.map((post) => (
        <Card key={post.id} className="p-4">
          <p className="text-sm text-muted-foreground">{post.content}</p>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>{post.likesCount} likes</span>
            <span>{post.commentsCount} comments</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
