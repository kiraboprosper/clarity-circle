"use client";
import { useCallback, useEffect, useState } from "react";
import { Bookmark, CheckCircle2, Flower2, Heart, Image as ImageIcon, MessageCircle, MoreHorizontal, Plus, Send, Share2, ShoppingBag, Sparkles, Star, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { PostSkeleton } from "@/components/ui/Skeleton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAuth } from "@/lib/context/AuthContext";
import { getFeedPosts, createPost, toggleLike } from "@/lib/firebase/posts";
import { formatPoints, timeAgo, xpToNextLevel } from "@/lib/utils/format";
import type { Post } from "@/lib/types";
import type { DocumentSnapshot } from "firebase/firestore";

const storyNames = ["Your Story", "Sienna", "Kiara", "Luna", "Maya", "Zara"];
const demoHabits = ["Read for 20 minutes", "Drink 2L of water", "Journal", "Workout", "No sugar"];
const challenges = ["21 Day Self Care", "30 Day Confidence", "7 Day Kindness"];
const products = ["Bloom Hoodie", "Growth Journal", "Clarity Mug", "Focus Bottle"];

export default function FeedPage() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [content, setContent] = useState("");
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const { posts: p, lastDoc: ld } = await getFeedPosts();
    setPosts(p);
    setLastDoc(ld);
    setHasMore(p.length === 15);
    setLoading(false);
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const handlePost = async () => {
    if (!user || !profile || !content.trim()) return;
    setPosting(true);
    try {
      await createPost(user.uid, { uid: user.uid, displayName: profile.displayName, username: profile.username, photoURL: profile.photoURL, isVerified: profile.isVerified }, content.trim());
      setContent("");
      await loadPosts();
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (post: Post) => {
    if (!user) return;
    const liked = post.likedBy.includes(user.uid);
    setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, likedBy: liked ? p.likedBy.filter((id) => id !== user.uid) : [...p.likedBy, user.uid], likesCount: liked ? p.likesCount - 1 : p.likesCount + 1 } : p));
    await toggleLike(post.id, user.uid, liked);
  };

  const loadMore = async () => {
    if (!lastDoc || loadingMore) return;
    setLoadingMore(true);
    const { posts: p, lastDoc: ld } = await getFeedPosts(lastDoc);
    setPosts((prev) => [...prev, ...p]);
    setLastDoc(ld);
    setHasMore(p.length === 15);
    setLoadingMore(false);
  };

  return (
    <div className="section-container py-5 space-y-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5 min-w-0">
          <header>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Good morning, {profile?.displayName?.split(" ")[0] || "friend"}</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Focus on your growth today.</p>
          </header>

          <div className="flex gap-4 overflow-x-auto pb-1">
            {storyNames.map((name, index) => <div key={name} className="flex-shrink-0 text-center"><div className="relative mx-auto mb-1 w-14 h-14 rounded-full p-0.5 bg-gradient-to-br from-lavender-500 to-blossom-400"><div className="w-full h-full rounded-full bg-white grid place-items-center text-lavender-700 font-bold">{index === 0 ? <Plus className="w-5 h-5" /> : name[0]}</div></div><p className="text-xs" style={{ color: "var(--text-primary)" }}>{name}</p></div>)}
          </div>

          <Card className="space-y-3">
            <div className="flex gap-3">
              <Avatar src={profile?.photoURL || null} name={profile?.displayName || "You"} size="md" />
              <div className="flex-1 space-y-3">
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Share a growth update, reflection, or win..." rows={2} />
                <div className="flex items-center justify-between"><button className="btn-ghost p-2 rounded-xl text-blossom-500"><ImageIcon className="w-4 h-4" /></button><Button onClick={handlePost} loading={posting} disabled={!content.trim()} size="sm" rightIcon={<Send className="w-3.5 h-3.5" />}>Share</Button></div>
              </div>
            </div>
          </Card>

          <div className="card p-0 overflow-hidden">
            <div className="flex gap-8 border-b px-5 pt-4" style={{ borderColor: "var(--border-default)" }}>
              {['For You', 'Following', 'Circles'].map((tab, i) => <button key={tab} className={`pb-3 text-sm font-semibold ${i === 0 ? 'text-lavender-700 border-b-2 border-lavender-600' : 'text-muted'}`}>{tab}</button>)}
            </div>
            <div className="p-4 space-y-4">
              {loading ? Array.from({ length: 2 }).map((_, i) => <PostSkeleton key={i} />) : posts.length > 0 ? posts.map((post) => <PostCard key={post.id} post={post} currentUserId={user?.uid} onLike={handleLike} />) : <DemoPost />}
              {hasMore && !loading && posts.length > 0 && <div className="flex justify-center"><Button variant="secondary" onClick={loadMore} loading={loadingMore}>Load more</Button></div>}
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <GardenCard />
          <TodayHabits />
        </aside>
      </div>

      <DashboardModules />
    </div>
  );
}

function GardenCard() {
  const { profile } = useAuth();
  const level = profile?.level ?? 1;
  const xp = profile?.xp ?? 0;
  const next = xpToNextLevel(level);
  return <Card className="overflow-hidden"><div className="flex items-start justify-between mb-3"><div><p className="font-bold" style={{ color: "var(--text-primary)" }}>Your Progress</p><p className="text-sm">Level {level}</p><p className="text-xs" style={{ color: "var(--text-muted)" }}>Blooming Soul</p></div><Sparkles className="w-5 h-5 text-blossom-500" /></div><ProgressBar value={xp} max={next} variant="lavender" /><div className="relative mt-5 h-44 rounded-3xl bg-gradient-to-br from-sky-100 via-lavender-100 to-blossom-100 overflow-hidden"><div className="absolute inset-x-8 bottom-8 h-12 rounded-full bg-emerald-500/25" /><div className="absolute left-1/2 bottom-12 -translate-x-1/2 w-20 h-24 rounded-t-full bg-gradient-to-br from-lavender-300 to-blossom-200" /><div className="absolute left-1/2 bottom-10 -translate-x-1/2 w-4 h-20 rounded-full bg-amber-900" /><Flower2 className="absolute left-10 bottom-10 w-7 h-7 text-blossom-500" /><Flower2 className="absolute right-12 bottom-8 w-7 h-7 text-lavender-600" /></div><Link href="/growth"><Button className="w-full mt-4">Go to Garden</Button></Link></Card>;
}

function TodayHabits() {
  return <Card><div className="flex items-center justify-between mb-4"><p className="font-bold" style={{ color: "var(--text-primary)" }}>Today's Habits</p><p className="text-xs" style={{ color: "var(--text-muted)" }}>4/5 completed</p></div><div className="space-y-3">{demoHabits.map((habit, i) => <div key={habit} className="flex items-center justify-between"><span className="text-sm" style={{ color: "var(--text-primary)" }}>{habit}</span>{i < 4 ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <span className="w-5 h-5 rounded-full border border-lavender-300" />}</div>)}</div><Link href="/habits"><Button variant="secondary" className="w-full mt-4">View All Habits</Button></Link></Card>;
}

function DashboardModules() {
  return <div className="grid gap-5 lg:grid-cols-4"><Module title="Habits" href="/habits" items={demoHabits} icon={CheckCircle2} /><Module title="Challenges" href="/challenges" items={challenges} icon={Trophy} /><Module title="Store" href="/store" items={products} icon={ShoppingBag} /><Module title="Rewards" href="/rewards" items={["5% Store Discount", "10% Store Discount", "Premium Wallpaper", "Bloom Frame"]} icon={Star} /></div>;
}

function Module({ title, href, items, icon: Icon }: { title: string; href: string; items: string[]; icon: typeof CheckCircle2 }) {
  return <Card><div className="flex items-center justify-between mb-4"><h2 className="font-bold">{title}</h2><Link href={href} className="text-xs font-semibold text-lavender-600">View All</Link></div><div className="space-y-3">{items.slice(0, 4).map((item) => <div key={item} className="flex items-center gap-3 rounded-2xl bg-subtle p-2"><div className="w-8 h-8 rounded-xl bg-white grid place-items-center"><Icon className="w-4 h-4 text-lavender-600" /></div><span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{item}</span></div>)}</div></Card>;
}

function DemoPost() {
  return <Card className="overflow-hidden"><div className="flex items-start justify-between mb-3"><div className="flex items-center gap-3"><Avatar src={null} name="Sienna" size="md" verified /><div><p className="font-semibold text-sm">Sienna</p><p className="text-xs" style={{ color: "var(--text-muted)" }}>2h ago</p></div></div><MoreHorizontal className="w-4 h-4" /></div><p className="text-sm mb-3">Finished my 30 day reading challenge. Consistency really is powerful.</p><div className="h-56 rounded-3xl bg-gradient-to-br from-blossom-100 via-white to-lavender-100 grid place-items-center"><div className="text-center"><Flower2 className="w-12 h-12 mx-auto text-blossom-500" /><p className="font-display text-xl mt-2">growth over everything</p></div></div><div className="flex items-center gap-2 pt-3"><button className="btn-ghost text-lavender-700"><Heart className="w-4 h-4" />Encourage (42)</button><button className="btn-ghost"><MessageCircle className="w-4 h-4" />Comment</button><button className="btn-ghost ml-auto"><Bookmark className="w-4 h-4" /></button></div></Card>;
}

function PostCard({ post, currentUserId, onLike }: { post: Post; currentUserId?: string; onLike: (p: Post) => void }) {
  const liked = currentUserId ? post.likedBy.includes(currentUserId) : false;
  return <Card className="overflow-hidden animate-fade-in"><div className="flex items-start justify-between mb-3"><div className="flex items-center gap-3"><Avatar src={post.author.photoURL} name={post.author.displayName} size="md" verified={post.author.isVerified} /><div><p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{post.author.displayName}</p><p className="text-xs" style={{ color: "var(--text-muted)" }}>@{post.author.username} - {timeAgo(post.createdAt)}</p></div></div><button className="btn-ghost p-1.5 rounded-xl" style={{ color: "var(--text-muted)" }}><MoreHorizontal className="w-4 h-4" /></button></div><p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-primary)" }}>{post.content}</p>{post.mediaURLs.length > 0 && <div className="rounded-2xl overflow-hidden mb-3 -mx-1"><img src={post.mediaURLs[0]} alt="Post media" className="w-full object-cover max-h-96" /></div>}<div className="flex items-center gap-1 pt-3 border-t" style={{ borderColor: "var(--border-default)" }}><button onClick={() => onLike(post)} className={`btn-ghost flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${liked ? "text-blossom-500" : ""}`}><Heart className={`w-4 h-4 transition-all ${liked ? "fill-blossom-500 stroke-blossom-500 scale-110" : ""}`} /><span className="text-xs font-medium">Encourage ({post.likesCount})</span></button><button className="btn-ghost flex items-center gap-1.5 px-3 py-2 rounded-xl"><MessageCircle className="w-4 h-4" /><span className="text-xs font-medium">Comment ({post.commentsCount})</span></button><button className="btn-ghost p-2 rounded-xl ml-auto"><Share2 className="w-4 h-4" /></button><button className="btn-ghost p-2 rounded-xl"><Bookmark className="w-4 h-4" /></button></div></Card>;
}
