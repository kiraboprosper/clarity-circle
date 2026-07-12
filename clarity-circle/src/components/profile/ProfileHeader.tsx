import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import type { UserProfile } from '@/lib/types';

interface ProfileHeaderProps {
  profile: UserProfile;
  stats: { posts: number; goalsCompleted: number; currentStreak: number };
}

export function ProfileHeader({ profile, stats }: ProfileHeaderProps) {
  return (
    <div className="rounded-3xl border p-6 bg-card">
      <div className="flex items-center gap-4">
        <Avatar src={profile.photoURL} name={profile.displayName} size="xl" verified={profile.isVerified} />
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{profile.displayName}</h1>
            <Badge>{profile.username}</Badge>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">{profile.bio}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-muted p-4 text-center">
          <p className="text-sm uppercase text-muted-foreground">Posts</p>
          <p className="text-xl font-semibold">{stats.posts}</p>
        </div>
        <div className="rounded-2xl bg-muted p-4 text-center">
          <p className="text-sm uppercase text-muted-foreground">Goals</p>
          <p className="text-xl font-semibold">{stats.goalsCompleted}</p>
        </div>
        <div className="rounded-2xl bg-muted p-4 text-center">
          <p className="text-sm uppercase text-muted-foreground">Streak</p>
          <p className="text-xl font-semibold">{stats.currentStreak}d</p>
        </div>
      </div>
    </div>
  );
}
