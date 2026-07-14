"use client";

import {
  MessageCircle,
  Heart as HeartIcon,
  Repeat,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import type { Post } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function PostCard({ post, onToggleLike }: { post: Post, onToggleLike: (postId: string, liked: boolean) => void }) {
  const { user } = useAuth();
  const hasLiked = user ? post.likedBy.includes(user.uid) : false;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar src={post.author.photoURL} name={post.author.displayName} />
          <div>
            <p className="font-semibold text-sm">{post.author.displayName}</p>
            <p className="text-xs text-muted">@{post.author.username} · {new Date(post.createdAt.seconds * 1000).toLocaleDateString()}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="w-4 h-4 text-muted" />
        </Button>
      </div>
      <p className="text-sm mb-4 whitespace-pre-wrap">{post.content}</p>
      <div className="flex items-center gap-4 border-t pt-2">
        <Button variant="ghost" size="sm" className="flex items-center gap-1.5" onClick={() => onToggleLike(post.id, hasLiked)}>
          <HeartIcon className={`w-4 h-4 ${hasLiked ? 'text-red-500 fill-current' : 'text-muted'}`} />
          <span className="text-xs font-semibold">{post.likesCount}</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
          <MessageCircle className="w-4 h-4 text-muted" />
          <span className="text-xs font-semibold">{post.commentsCount}</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
          <Repeat className="w-4 h-4 text-muted" />
        </Button>
        <Button variant="ghost" size="sm" className="flex items-center gap-1.5 ml-auto">
          <Bookmark className="w-4 h-4 text-muted" />
        </Button>
      </div>
    </Card>
  );
}