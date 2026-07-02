"use client";

import { useEffect, useState } from "react";
import { Clock, Lock, Star, Trophy, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAuth } from "@/lib/context/AuthContext";
import { getChallenges, getUserChallengeProgress, joinChallenge } from "@/lib/firebase/challenges";
import type { Challenge, ChallengeProgress } from "@/lib/types";

const DEFAULT_CHALLENGES: Omit<Challenge, "id" | "createdAt" | "startsAt" | "endsAt">[] = [
  { title: "30 Day Confidence Challenge", description: "Build steady confidence through daily affirmations, mindset work, and bold actions.", durationDays: 30, difficulty: "beginner", status: "active", coverImageURL: "", category: "mindset", tasks: [], pointsReward: 500, badgeReward: "confidence_builder", participantsCount: 1247, isPremium: false },
  { title: "30 Day Journaling Challenge", description: "Develop clarity and self-awareness through the transformative practice of daily journaling.", durationDays: 30, difficulty: "beginner", status: "active", coverImageURL: "", category: "mindset", tasks: [], pointsReward: 400, badgeReward: "journal_keeper", participantsCount: 894, isPremium: false },
  { title: "21 Day Self Care Challenge", description: "Support your wellbeing with 21 days of intentional care and recovery.", durationDays: 21, difficulty: "beginner", status: "active", coverImageURL: "", category: "health", tasks: [], pointsReward: 350, badgeReward: "wellness_builder", participantsCount: 2103, isPremium: false },
  { title: "30 Day Reading Challenge", description: "Read 30 minutes daily and expand your mind over 30 days.", durationDays: 30, difficulty: "intermediate", status: "active", coverImageURL: "", category: "learning", tasks: [], pointsReward: 400, badgeReward: "bookworm", participantsCount: 456, isPremium: false },
  { title: "14 Day Discipline Challenge", description: "Build practical discipline in 2 weeks with structured daily challenges.", durationDays: 14, difficulty: "advanced", status: "active", coverImageURL: "", category: "mindset", tasks: [], pointsReward: 300, badgeReward: "discipline_master", participantsCount: 378, isPremium: true },
  { title: "Future Builder Challenge", description: "Think, plan, and act with ownership over your next chapter.", durationDays: 30, difficulty: "advanced", status: "active", coverImageURL: "", category: "finance", tasks: [], pointsReward: 500, badgeReward: "future_builder", participantsCount: 621, isPremium: true },
];

const COVER_GRADIENTS = [
  "from-emerald-400 to-lavender-400",
  "from-rose-400 to-amber-400",
  "from-lavender-500 to-lavender-700",
  "from-emerald-400 to-teal-500",
  "from-sky-400 to-lavender-500",
  "from-amber-400 to-rose-500",
];

const DIFF_COLORS: Record<string, "lavender" | "gold" | "blossom"> = {
  beginner: "lavender",
  intermediate: "gold",
  advanced: "blossom",
};

export default function ChallengesPage() {
  const { user, profile } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [progress, setProgress] = useState<ChallengeProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [realChallenges, userProgress] = await Promise.all([
        getChallenges(),
        user ? getUserChallengeProgress(user.uid) : Promise.resolve([]),
      ]);
      setChallenges(realChallenges.length > 0 ? realChallenges : DEFAULT_CHALLENGES.map((challenge, index) => ({
        ...challenge,
        id: `demo_challenge_${index}`,
        createdAt: null as never,
        startsAt: null,
        endsAt: null,
      })));
      setProgress(userProgress);
      setLoading(false);
    };
    load();
  }, [user]);

  const handleJoin = async (challengeId: string, isPremium: boolean) => {
    if (!user) return;
    if (isPremium && profile?.subscriptionTier === "free") return;
    setJoining(challengeId);
    await joinChallenge(challengeId, user.uid);
    const p = await getUserChallengeProgress(user.uid);
    setProgress(p);
    setJoining(null);
  };

  const getProgress = (challengeId: string) =>
    progress.find((p) => p.challengeId === challengeId);

  return (
    <div className="section-container py-6 max-w-3xl space-y-6">
      <div className="rounded-3xl p-6 bg-gradient-to-br from-emerald-100 to-lavender-100 dark:from-lavender-900/30 dark:to-emerald-900/30 border" style={{ borderColor: "var(--border-default)" }}>
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-6 h-6 text-amber-500" />
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Challenges</h1>
        </div>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Build confidence, earn points, and keep growing with your circle.
        </p>
        <div className="flex gap-4 mt-4 text-center">
          <div>
            <p className="text-lg font-bold text-lavender-600">{progress.length}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Active</p>
          </div>
          <div>
            <p className="text-lg font-bold text-amber-500">{progress.filter((p) => p.status === "completed").length}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Completed</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => <Card key={i} className="h-64 animate-pulse"><span className="sr-only">Loading challenge</span></Card>)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
        {challenges.map((challenge, i) => {
          const prog = getProgress(challenge.id);
          const isLocked = challenge.isPremium && profile?.subscriptionTier === "free";

          return (
            <Card key={i} className={`relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 ${isLocked ? "opacity-80" : ""}`}>
              <div className={`h-24 -mx-5 -mt-5 mb-4 bg-gradient-to-br ${COVER_GRADIENTS[i % COVER_GRADIENTS.length]} flex items-center justify-center`}>
                <Trophy className="w-8 h-8 text-white/80" />
                {isLocked && (
                  <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-xl px-2 py-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-white" />
                    <span className="text-white text-xs font-medium">Plus</span>
                  </div>
                )}
              </div>

              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm leading-snug flex-1 pr-2" style={{ color: "var(--text-primary)" }}>
                  {challenge.title}
                </h3>
                <Badge variant={DIFF_COLORS[challenge.difficulty]}>
                  {challenge.difficulty}
                </Badge>
              </div>

              <p className="text-xs mb-3 line-clamp-2" style={{ color: "var(--text-muted)" }}>
                {challenge.description}
              </p>

              <div className="flex items-center gap-3 text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{challenge.durationDays}d</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{challenge.participantsCount.toLocaleString()}</span>
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" />{challenge.pointsReward}pts</span>
              </div>

              {prog ? (
                <div className="space-y-2">
                  <ProgressBar value={prog.completedDays.length} max={challenge.durationDays} variant="blossom" showLabel />
                  <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>Day {prog.currentDay} of {challenge.durationDays}</p>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant={isLocked ? "secondary" : "primary"}
                  className="w-full"
                  loading={joining === challenge.id}
                  onClick={() => handleJoin(challenge.id, challenge.isPremium)}
                  disabled={isLocked}
                  leftIcon={isLocked ? <Lock className="w-3 h-3" /> : undefined}
                >
                  {isLocked ? "Upgrade to join" : "Start challenge"}
                </Button>
              )}
            </Card>
          );
        })}
        </div>
      )}
    </div>
  );
}
