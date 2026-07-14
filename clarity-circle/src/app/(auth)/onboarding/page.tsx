"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Target, Users } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { updateUserProfile } from "@/lib/firebase/users";
import { getDemoAuthState } from "@/lib/context/demoAuth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const focusOptions = [
  { id: "habit", title: "Build a habit", description: "Start with one small routine you can keep going.", icon: Target },
  { id: "community", title: "Join a circle", description: "Meet people who share your growth goals.", icon: Users },
  { id: "growth", title: "Explore your path", description: "Get a calm overview of your first steps.", icon: Sparkles },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [selectedFocus, setSelectedFocus] = useState<(typeof focusOptions)[number]["id"]>("habit");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (getDemoAuthState().enabled || profile?.onboardingCompleted) {
      router.replace("/feed");
    }
  }, [loading, profile?.onboardingCompleted, router, user]);

  const handleContinue = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, { onboardingCompleted: true });
      router.replace(selectedFocus === "community" ? "/circles" : "/habits");
    } catch {
      router.replace("/feed");
    } finally {
      setSaving(false);
    }
  };

  const selectedOption = useMemo(() => focusOptions.find((option) => option.id === selectedFocus) ?? focusOptions[0], [selectedFocus]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl animate-slide-up space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lavender-600">Welcome aboard</p>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Pick your first step</h1>
          <p className="text-sm leading-6" style={{ color: "var(--text-muted)" }}>
            We’ll make your first run feel calm and useful by guiding you to the most helpful place to start.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {focusOptions.map((option) => {
            const Icon = option.icon;
            const active = option.id === selectedFocus;
            return (
              <button
                key={option.id}
                onClick={() => setSelectedFocus(option.id)}
                className={`rounded-2xl border p-4 text-left transition-all ${active ? "border-lavender-400 bg-lavender-50" : "border-slate-200 bg-white hover:border-lavender-200"}`}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <Icon className={`h-5 w-5 ${active ? "text-lavender-600" : "text-slate-600"}`} />
                </div>
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{option.title}</p>
                <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>{option.description}</p>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>We recommend: {selectedOption.title}</p>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>{selectedOption.description}</p>
        </div>

        <Button onClick={handleContinue} loading={saving} className="w-full" size="lg">
          Continue to your first step
        </Button>
      </Card>
    </div>
  );
}
