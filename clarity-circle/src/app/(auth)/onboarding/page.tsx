"use client";

import { useParams } from 'next/navigation';
import { Timestamp } from 'firebase/firestore';
import { UserProfile, Post } from '@/lib/types';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { PostGrid } from '@/components/profile/PostGrid';
import { ProfileSkeleton } from '@/components/skeletons/ProfileSkeleton';

// MOCK DATA & HOOK
const useProfileData = (username: string | string[] | undefined) => {
  const isLoading = false; // Set to true to see skeleton
  const error = null;

  if (username !== 'friend') {
    return { profile: null, posts: [], isLoading: false, error: { message: 'User not found' } };
  }

  const posts: Post[] = [
    {
      id: 'p1',
      authorId: 'user2',
      author: {
        uid: 'user2',
        displayName: 'Alex',
        username: 'alex',
        photoURL: 'https://i.pravatar.cc/150?u=alex',
        isVerified: true,
      },
      type: 'image',
      content: 'Staying focused with a morning routine today.',
      mediaURLs: ['https://images.unsplash.com/photo-1506126613408-4e756b67b073?w=500'],
      likesCount: 12,
      commentsCount: 2,
      likedBy: [],
      tags: ['focus', 'morning'],
      challengeRef: null,
      habitRef: null,
      isReported: false,
      isHidden: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    {
      id: 'p2',
      authorId: 'user2',
      author: {
        uid: 'user2',
        displayName: 'Alex',
        username: 'alex',
        photoURL: 'https://i.pravatar.cc/150?u=alex',
        isVerified: true,
      },
      type: 'text',
      content: 'Completed a 10-minute meditation and feeling clear-headed.',
      mediaURLs: [],
      likesCount: 8,
      commentsCount: 5,
      likedBy: [],
      tags: ['meditation', 'wellness'],
      challengeRef: null,
      habitRef: null,
      isReported: false,
      isHidden: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    {
      id: 'p3',
      authorId: 'user2',
      author: {
        uid: 'user2',
        displayName: 'Alex',
        username: 'alex',
        photoURL: 'https://i.pravatar.cc/150?u=alex',
        isVerified: true,
      },
      type: 'image',
      content: 'Sharing a quick habit update from today.',
      mediaURLs: ['https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500'],
      likesCount: 15,
      commentsCount: 1,
      likedBy: [],
      tags: ['habit', 'progress'],
      challengeRef: null,
      habitRef: null,
      isReported: false,
      isHidden: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
  ];

  const profile: UserProfile = {
    uid: 'user2',
    email: 'alex@example.com',
    displayName: 'Alex',
    username: 'alex',
    photoURL: 'https://i.pravatar.cc/150?u=alex',
    bio: 'On a journey of self-improvement. Sharing my progress and learnings along the way. ✨',
    role: 'user',
    subscriptionTier: 'free',
    subscriptionExpiry: null,
    points: 0,
    level: 1,
    xp: 0,
    growthStage: 'seed',
    isPrivate: false,
    isVerified: true,
    followersCount: 0,
    followingCount: 0,
    postsCount: posts.length,
    habitStreak: 0,
    longestStreak: 0,
    joinedAt: Timestamp.now(),
    lastActiveAt: Timestamp.now(),
    onboardingCompleted: true,
    blockedUsers: [],
    theme: 'light',
    notificationSettings: {
      likes: true,
      comments: true,
      follows: true,
      challenges: true,
      directMessages: true,
      communityUpdates: true,
    },
    age: null,
    ageVerified: false,
  };

  const stats = {
    posts: posts.length,
    goalsCompleted: 12,
    currentStreak: 45,
  };

  return { profile, posts, stats, isLoading, error };
};
// END MOCK DATA

export default function ProfilePage() {
  const params = useParams();
  const { username } = params;

  const { profile, posts, stats, isLoading, error } = useProfileData(username);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Profile Not Found</h2>
        <p className="text-muted-foreground mt-2">
          Sorry, we couldn't find a user with that username.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <ProfileHeader profile={profile} stats={stats} />
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">
          Public Posts
        </h3>
        {posts.length > 0 ? (
          <PostGrid posts={posts} />
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-xl mt-4">
            <p className="text-muted-foreground">This user hasn't shared any public posts yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}