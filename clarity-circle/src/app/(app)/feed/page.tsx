"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";
import {
  CheckCircle2,
  Star,
  Trophy,
  MessageCircle,
  Heart as HeartIcon,
  Repeat,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";
import { createPost, getFeedPosts, toggleLike } from "@/lib/firebase/posts";
import { getUserHabits } from "@/lib/firebase/habits";
import type { Post, Habit } from "@/lib/types";
import type { DocumentSnapshot } from "firebase/firestore";

const challenges = ["Browse active challenges", "Track daily progress", "Celebrate completions"];

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

  const handleCreatePost = async (content: string) => {
    if (!user || !profile) return;
    const authorData = { uid: user.uid, displayName: profile.displayName, username: profile.username, isVerified: profile.isVerified, photoURL: profile.photoURL };
    await createPost(user.uid, authorData, content);
    await fetchPosts(true); // Refresh feed
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

function CreatePost({ user, profile, onCreatePost }: { user: any, profile: any, onCreatePost: (content: string) => Promise<void> }) {
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) return;
    setIsPosting(true);
    await onCreatePost(content);
    setContent("");
    setIsPosting(false);
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <Avatar src={profile.photoURL} name={profile.displayName} />
        <div className="w-full">
          <Textarea
            placeholder={`What's on your mind, ${profile.displayName}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <Button onClick={handlePost} loading={isPosting}>Post</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function PostCard({ post, onToggleLike }: { post: Post, onToggleLike: (postId: string, liked: boolean) => void }) {
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
        <Button variant="ghost" className="w-8 h-8 p-0">
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

function DashboardModules() {
  return <div className="grid gap-5 lg:grid-cols-3"><TodayHabits /><Module title="Challenges" href="/challenges" items={challenges} icon={Trophy} /><Module title="Rewards" href="/rewards" items={["Badges", "Themes", "Premium trials"]} icon={Star} /></div>;
}

function TodayHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchHabits = async () => {
      const userHabits = await getUserHabits(user.uid);
      setHabits(userHabits);
    };
    void fetchHabits();
  }, [user]);

  return <Module title="Today's Habits" href="/habits" items={habits.map(h => h.name)} icon={CheckCircle2} />;
}

function Module({ title, href, items, icon: Icon }: { title: string; href: string; items: string[]; icon: typeof CheckCircle2 }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-subtle grid place-items-center"><Icon className="w-5 h-5 text-muted" /></div>
        <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h3>
      </div>
      <ul className="space-y-1.5">
        {items.slice(0, 3).map((item, i) => <li key={i} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}><div className="w-1 h-1 rounded-full bg-current" />{item}</li>)}
      </ul>
      <Link href={href}><Button variant="link" size="sm" className="mt-2">View all</Button></Link>
    </Card>
  );
}