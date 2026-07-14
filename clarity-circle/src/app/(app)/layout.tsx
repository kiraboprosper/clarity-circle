"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { SideNav, BottomNav, TopBar } from "@/components/layout/AppNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="flex flex-col items-center gap-4 rounded-[32px] border border-white/70 bg-white/70 px-8 py-7 shadow-luxury backdrop-blur-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-[24px] bg-[linear-gradient(135deg,var(--primary-lavender),var(--accent))] shadow-luxury animate-bloom">
            <span className="text-xl font-bold text-white">C</span>
          </div>
          <p className="text-sm font-medium animate-pulse-soft" style={{ color: "var(--text-muted)" }}>Preparing your calm space…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(191,167,242,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(216,200,255,0.18),transparent_30%)]" />
      <div className="flex min-h-screen">
        <SideNav />
        <div className="flex min-h-screen flex-1 flex-col">
          <TopBar />
          <main className="flex-1 pb-24 md:pb-6">
            {children}
          </main>
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
