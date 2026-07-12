"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Settings, Grid, Flower2, Trophy } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/context/AuthContext";
import { getUserProfile, followUser, unfollowUser, isFollowing } from "@/lib/firebase/users";
import { getUserPosts } from "@/lib/firebase/posts";
import { getOrCreateDirectConversation } from "@/lib/firebase/chat";
import { timeAgo, formatDate, GROWTH_STAGE_LABELS, GROWTH_STAGE_EMOJIS, xpToNextLevel, formatPoints } from "@/lib/utils/format";
import type { UserProfile, Post } from "@/lib/types";

const SUBSCRIPTION_LABELS = { free: "Free", pro: "Pro", business: "Business" } as const;

export default function ProfilePage() {
  const { uid } = useParams<{ uid: string }>();
  const router = useRouter();
  const { user, profile: currentProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "garden" | "achievements">("posts");

  const isOwnProfile = user?.uid === uid;

  useEffect(() => {
    const load = async () => {
      const [p, userPosts, followStatus] = await Promise.all([
        getUserProfile(uid),
        getUserPosts(uid),
        user && !isOwnProfile ? isFollowing(user.uid, uid) : Promise.resolve(false),
      ]);
      setProfile(p);
      setPosts(userPosts);
      setFollowing(followStatus);
      setLoading(false);
    };
    load();
  }, [uid, user, isOwnProfile]);

  const handleFollow = async () => {
    if (!user || !currentProfile || !profile) return;
    setFollowLoading(true);
    if (following) {
      await unfollowUser(user.uid, uid);
      setFollowing(false);
      setProfile((p) => p ? { ...p, followersCount: p.followersCount - 1 } : p);
    } else {
      await followUser(user.uid, uid);
      setFollowing(true);
      setProfile((p) => p ? { ...p, followersCount: p.followersCount + 1 } : p);
    }
    setFollowLoading(false);
  };

  const handleMessage = async () => {
    if (!user || !currentProfile || !profile || isOwnProfile) return;
    setMessageLoading(true);
    const conversationId = await getOrCreateDirectConversation(
      user.uid,
      { uid: user.uid, displayName: currentProfile.displayName, photoURL: currentProfile.photoURL },
      profile.uid,
      { uid: profile.uid, displayName: profile.displayName, photoURL: profile.photoURL }
    );
    router.push(`/chat?conversation=${conversationId}`);
  };

  if (loading) return <ProfileSkeleton />;
  if (!profile) return (
    <div className="section-container py-12 text-center">
      <p className="text-2xl mb-2">ðŸŒ¸</p>
      <p style={{ color: "var(--text-muted)" }}>This profile does not exist.</p>
    </div>
  );

  const xpNeeded = xpToNextLevel(profile.level);
  const stageEmoji = GROWTH_STAGE_EMOJIS[profile.growthStage];
  const stageLabel = GROWTH_STAGE_LABELS[profile.growthStage];

  return (
    <div className="section-container py-6 max-w-2xl space-y-5">
      {/* Profile card */}
      <Card>
        <div className="flex items-start justify-between mb-4">
          <Avatar src={profile.photoURL} name={profile.displayName} size="xl" verified={profile.isVerified} />
          <div className="flex gap-2 flex-wrap justify-end">
            {isOwnProfile ? (
              <Link href="/settings">
                <Button variant="secondary" size="sm" leftIcon={<Settings className="w-4 h-4" />}>Edit profile</Button>
              </Link>
            ) : (
              <>
                <Button
                  variant={following ? "secondary" : "primary"}
                  size="sm"
                  onClick={handleFollow}
                  loading={followLoading}
                >
                  {following ? "Following" : "Follow"}
                </Button>
                <Button variant="secondary" size="sm" onClick={handleMessage} loading={messageLoading}>Message</Button>
              </>
            )}
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{profile.displayName}</h1>
            <Badge variant="lavender">{SUBSCRIPTION_LABELS[profile.subscriptionTier]}</Badge>
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>@{profile.username}</p>
          {profile.bio && <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--text-primary)" }}>{profile.bio}</p>}
        </div>

        {/* Stats */}
        <div className="flex gap-5 text-center mb-4">
          {[
            { label: "Posts",     value: profile.postsCount },
            { label: "Followers", value: profile.followersCount },
            { label: "Following", value: profile.followingCount },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>{value.toLocaleString()}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Growth level */}
        <div className="rounded-2xl p-4 space-y-2" style={{ backgroundColor: "var(--bg-subtle)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{stageEmoji}</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Level {profile.level} Â· {stageLabel}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{profile.xp} / {xpNeeded} XP</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-amber-500">âœ¦ {formatPoints(profile.points)}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>points</p>
            </div>
          </div>
          <ProgressBar value={profile.xp} max={xpNeeded} variant="lavender" />
        </div>

        {/* Joined */}
        <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
          Joined {formatDate(profile.joinedAt)}
        </p>
      </Card>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: "var(--border-default)" }}>
        {([
          { id: "posts",        icon: Grid,    label: "Posts" },
          { id: "garden",       icon: Flower2, label: "Garden" },
          { id: "achievements", icon: Trophy,  label: "Badges" },
        ] as const).map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-all border-b-2 ${
              activeTab === id
                ? "border-lavender-500 text-lavender-600"
                : "border-transparent"
            }`}
            style={activeTab !== id ? { color: "var(--text-muted)" } : {}}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "posts" && (
        <div className="space-y-3">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-3xl mb-2">âœï¸</p>
              <p style={{ color: "var(--text-muted)" }}>No posts yet.</p>
            </div>
          ) : (
            posts.map((post) => (
              <Card key={post.id}>
                <p className="text-sm" style={{ color: "var(--text-primary)" }}>{post.content}</p>
                <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>{timeAgo(post.createdAt)}</p>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "garden" && (
        <Card className="text-center py-12">
          <div className="text-5xl mb-3 animate-bloom">{stageEmoji}</div>
          <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Growth Garden Â· {stageLabel}</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {profile.habitStreak > 0
              ? `${profile.habitStreak} day streak â€” keep growing! ðŸŒ±`
              : "Complete habits to grow your garden."}
          </p>
        </Card>
      )}

      {activeTab === "achievements" && (
        <Card className="text-center py-12">
          <div className="text-5xl mb-3">ðŸ†</div>
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>Achievements coming soon</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Complete challenges to earn badges.</p>
        </Card>
      )}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="section-container py-6 max-w-2xl space-y-5">
      <div className="card p-5 space-y-4">
        <div className="flex justify-between">
          <Skeleton className="w-20 h-20 rounded-full" />
          <Skeleton className="w-28 h-9 rounded-2xl" />
        </div>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-16 w-full rounded-2xl" />
      </div>
    </div>
  );
}


