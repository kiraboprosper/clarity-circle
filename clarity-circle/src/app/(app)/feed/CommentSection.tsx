import { useState, useEffect, useCallback } from "react";
import { Send } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { getPostComments, addComment } from "@/lib/firebase/posts";
import { timeAgo } from "@/lib/utils/format";
import type { Comment } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { PostSkeleton } from "@/components/ui/Skeleton";

export function CommentSection({ postId, onCommentAdded }: { postId: string; onCommentAdded: () => void }) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedComments = await getPostComments(postId);
      setComments(fetchedComments);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  const handleAddComment = async () => {
    if (!user || !profile || !commentContent.trim()) return;

    setIsSubmitting(true);
    try {
      const authorData = { uid: user.uid, username: profile.username, displayName: profile.displayName, photoURL: profile.photoURL };
      const newComment = await addComment(postId, user.uid, authorData, commentContent.trim());

      // Optimistically add the new comment
      setComments((prev) => [...prev, newComment]);
      setCommentContent("");
      onCommentAdded(); // Notify parent to increment count
    } catch (error) {
      console.error("Failed to add comment:", error);
      // Optionally show an error to the user
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-4 mt-4 border-t" style={{ borderColor: "var(--border-default)" }}>
      {loading ? (
        <PostSkeleton />
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3">
              <Avatar src={comment.author.photoURL} name={comment.author.displayName} size="sm" />
              <div>
                <div className="bg-subtle rounded-2xl px-3 py-2">
                  <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{comment.author.displayName}</p>
                  <p className="text-sm" style={{ color: "var(--text-primary)" }}>{comment.content}</p>
                </div>
                <p className="text-xs mt-1 ml-2" style={{ color: "var(--text-muted)" }}>{timeAgo(comment.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {user && profile && (
        <div className="flex items-start gap-3 mt-4">
          <Avatar src={profile.photoURL} name={profile.displayName} size="sm" />
          <div className="flex-1">
            <Textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Write a comment..."
              rows={1}
              className="text-sm"
            />
            <div className="flex justify-end mt-2">
              <Button onClick={handleAddComment} loading={isSubmitting} disabled={!commentContent.trim()} size="sm" rightIcon={<Send className="w-3.5 h-3.5" />}>Post</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}