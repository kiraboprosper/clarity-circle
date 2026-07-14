"use client";

import { useState, useEffect } from "react";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "@/lib/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { createPost, getFeedPosts, toggleLike } from "@/lib/firebase/posts";
import type { Post } from "@/lib/types";
import type { DocumentSnapshot } from "firebase/firestore";
import { CreatePost } from "./CreatePost";
import { PostCard } from "./PostCard";
import { DashboardModules } from "./DashboardModules";

import type { User } from "firebase/auth";
import type { UserProfile } from "@/lib/types";

export default function FeedPage() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (isInitial = false) => {
    if (loading || (!isInitial && !hasMore)) return;
    setLoading(true);
    const { posts: newPosts, lastDoc: newLastDoc } = await getFeedPosts(isInitial ? undefined : lastDoc, 10);
    setPosts(prev => isInitial ? newPosts : [...prev, ...newPosts]);
    setLastDoc(newLastDoc);
    setHasMore(!!newLastDoc);
    setLoading(false);
  };

  useEffect(() => {
    void fetchPosts(true);
  }, []);

  const handleCreatePost = async (content: string, mediaURLs: string[] = []) => {
    if (!user || !profile) return;
    const authorData: Post["author"] = { uid: user.uid, displayName: profile.displayName, username: profile.username, isVerified: profile.isVerified, photoURL: profile.photoURL };

    // Optimistic update
    const tempId = `temp_${Date.now()}`;
    const newPost: Post = {
      id: tempId,
      authorId: user.uid,
      author: authorData,
      type: mediaURLs.length ? "image" : "text",
      content,
      mediaURLs,
      likesCount: 0,
      commentsCount: 0,
      likedBy: [],
      tags: [],
      challengeRef: null,
      habitRef: null,
      isReported: false,
      isHidden: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    setPosts(prev => [newPost, ...prev]);

    // Actual creation and refresh
    await createPost(user.uid, authorData, content, mediaURLs);
    await fetchPosts(true);
  };

  const handleToggleLike = async (postId: string, liked: boolean) => {
    if (!user) return;
    await toggleLike(postId, user.uid, liked);
    setPosts(posts.map(p => p.id === postId ? { ...p, likedBy: liked ? p.likedBy.filter(uid => uid !== user.uid) : [...p.likedBy, user.uid], likesCount: liked ? p.likesCount - 1 : p.likesCount + 1 } : p));
  };

  return (
    <div className="section-container py-5 max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Feed</h1>
        <p className="text-md mt-1" style={{ color: "var(--text-muted)" }}>Your personal space for reflections and growth.</p>
      </header>

      {user && profile && <CreatePost user={user} profile={profile} onCreatePost={handleCreatePost} />}

      <div className="space-y-5">
        {posts.map(post => (
          <PostCard key={post.id} post={post} onToggleLike={handleToggleLike} />
        ))}
      </div>

      {loading && <p className="text-center text-sm text-muted">Loading more posts...</p>}
      {!loading && hasMore && (
        <div className="text-center">
          <Button variant="secondary" onClick={() => fetchPosts()}>Load More</Button>
        </div>
      )}
      {!hasMore && <p className="text-center text-sm text-muted">You've reached the end.</p>}

      <DashboardModules />
    </div>
  );
}