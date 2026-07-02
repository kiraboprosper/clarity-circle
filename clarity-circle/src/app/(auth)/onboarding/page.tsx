"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/context/AuthContext";
import { updateUserProfile } from "@/lib/firebase/users";
import { awardPoints } from "@/lib/firebase/auth";
import { cn } from "@/lib/utils/cn";

const STEPS = ["welcome", "goals", "interests", "notifications", "done"] as const;
type Step = typeof STEPS[number];

const GOALS = [
  { id: "confidence",  emoji: "💪", label: "Build confidence" },
  { id: "habits",      emoji: "🌱", label: "Build better habits" },
  { id: "mindset",     emoji: "🧘", label: "Improve my mindset" },
  { id: "community",   emoji: "🤝", label: "Find my community" },
  { id: "learning",    emoji: "📚", label: "Keep learning" },
  { id: "reflection",  emoji: "✨", label: "Practice reflection" },
  { id: "business",    emoji: "💼", label: "Grow my business" },
  { id: "finances",    emoji: "💰", label: "Improve my finances" },
];

const INTERESTS = [
  "Journaling", "Nature", "Fitness", "Reading", "Tech", "Cooking",
  "Travel", "Music", "Art", "Entrepreneurship", "Wellness", "Reflection", "Productivity", "Family",
];

export default function OnboardingPage() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const stepIndex = STEPS.indexOf(step);

  const toggleGoal = (id: string) =>
    setSelectedGoals((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]);

  const toggleInterest = (i: string) =>
    setSelectedInterests((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    await updateUserProfile(user.uid, { onboardingCompleted: true });
    await awardPoints(user.uid, 100, "onboarding_completed", "Completed onboarding! 🎉");
    await refreshProfile();
    router.replace("/feed");
  };

  const next = () => setStep(STEPS[stepIndex + 1]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero dark:gradient-dark-hero">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {STEPS.filter((s) => s !== "done").map((s, i) => (
            <div key={s} className={cn("flex-1 h-1.5 rounded-full transition-all duration-500", i <= stepIndex ? "bg-lavender-500" : "bg-lavender-100 dark:bg-lavender-900/30")} />
          ))}
        </div>

        {step === "welcome" && (
          <div className="text-center space-y-6 animate-slide-up">
            <div className="text-6xl animate-bloom">🌸</div>
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                Welcome to your circle.
              </h1>
              <p className="text-base" style={{ color: "var(--text-muted)" }}>
                A calm space where people grow, connect, and build steady confidence.
                Let us personalize your experience in 2 minutes.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[["🌱", "Growth tools"], ["🤝", "Community"], ["🏆", "Challenges"]].map(([emoji, label]) => (
                <div key={label} className="card py-4">
                  <div className="text-2xl mb-1">{emoji}</div>
                  <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}</p>
                </div>
              ))}
            </div>
            <Button onClick={next} className="w-full" size="lg">Start setup ✨</Button>
          </div>
        )}

        {step === "goals" && (
          <div className="space-y-6 animate-slide-up">
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>What are you here for?</h2>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Pick everything that resonates. (Pick at least one)</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {GOALS.map(({ id, emoji, label }) => (
                <button
                  key={id}
                  onClick={() => toggleGoal(id)}
                  className={cn(
                    "flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all duration-200",
                    selectedGoals.includes(id)
                      ? "border-lavender-500 bg-lavender-50 dark:bg-lavender-900/20"
                      : "border-transparent hover:border-lavender-200"
                  )}
                  style={!selectedGoals.includes(id) ? { backgroundColor: "var(--bg-card)" } : {}}
                >
                  <span className="text-xl">{emoji}</span>
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</span>
                </button>
              ))}
            </div>
            <Button onClick={next} className="w-full" size="lg" disabled={selectedGoals.length === 0}>
              Continue
            </Button>
          </div>
        )}

        {step === "interests" && (
          <div className="space-y-6 animate-slide-up">
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>What are you into?</h2>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>We will personalize your feed and recommendations.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={cn(
                    "px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200",
                    selectedInterests.includes(interest)
                      ? "bg-lavender-500 text-white shadow-soft"
                      : "btn-secondary"
                  )}
                >
                  {interest}
                </button>
              ))}
            </div>
            <Button onClick={next} className="w-full" size="lg">
              {selectedInterests.length > 0 ? `Continue with ${selectedInterests.length} interest${selectedInterests.length > 1 ? "s" : ""}` : "Skip"}
            </Button>
          </div>
        )}

        {step === "notifications" && (
          <div className="space-y-6 animate-slide-up">
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Stay in the loop</h2>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Enable notifications to get daily challenge reminders and community updates.</p>
            </div>
            <div className="card text-center py-8 space-y-4">
              <div className="text-5xl">🔔</div>
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>Daily reminders help you stay consistent</p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Members with notifications on are 3x more likely to complete challenges.</p>
            </div>
            <Button onClick={next} className="w-full" size="lg">Enable notifications</Button>
            <Button onClick={next} variant="ghost" className="w-full">Maybe later</Button>
          </div>
        )}

        {step === "done" && (
          <div className="text-center space-y-6 animate-slide-up">
            <div className="text-6xl animate-bloom">🌺</div>
            <div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>You are all set!</h2>
              <p style={{ color: "var(--text-muted)" }}>Your circle is waiting. You just earned <strong className="text-amber-500">+100 Clarity Points</strong> for joining! 🎉</p>
            </div>
            <div className="card">
              <p className="text-sm font-medium mb-3" style={{ color: "var(--text-muted)" }}>Your first steps:</p>
              <div className="space-y-2 text-left">
                {["Introduce yourself in the feed", "Join your first challenge", "Create your first habit", "Explore the store"].map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-lavender-100 dark:bg-lavender-900/30 text-lavender-600 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                    <span className="text-sm" style={{ color: "var(--text-primary)" }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={handleFinish} loading={saving} className="w-full" size="lg">
              Enter my circle ✨
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
