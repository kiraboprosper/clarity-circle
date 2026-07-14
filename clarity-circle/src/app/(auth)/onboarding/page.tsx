"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { getDemoAuthState } from "@/lib/context/demoAuth";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

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

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Welcome aboard</h1>
        <p className="mt-2 text-sm text-slate-600">
          We&apos;re getting your account ready. You&apos;ll be redirected shortly.
        </p>
      </div>
    </div>
  );
}
