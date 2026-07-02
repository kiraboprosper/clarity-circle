"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  Leaf,
  MessageCircle,
  Mountain,
  ShoppingBag,
  Sparkles,
  Star,
  Sun,
  Trophy,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const FEATURES = [
  { icon: Leaf, title: "Habit Tracker", desc: "Build streaks, earn points, and watch your Growth Garden bloom." },
  { icon: Trophy, title: "Challenges", desc: "Join confidence, reading, wellness, creativity, and kindness challenges." },
  { icon: MessageCircle, title: "Community Feed", desc: "Share wins, ask for support, and grow alongside people on their own path." },
  { icon: ShoppingBag, title: "The Shop", desc: "Choose journals, bottles, bags, hoodies, and digital tools for your journey." },
];

const TESTIMONIALS = [
  { name: "Maya R.", handle: "@mayagrows", text: "The confidence challenge helped me take action instead of waiting to feel ready. Small steps finally feel visible.", avatar: "M" },
  { name: "Jordan L.", handle: "@jordannotes", text: "I came for habit tracking and stayed for the circles. It feels calm, supportive, and never performative.", avatar: "J" },
  { name: "Noah A.", handle: "@noahbuilds", text: "The Growth Garden makes consistency feel rewarding without turning my life into pressure. That balance matters.", avatar: "N" },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    desc: "Community access and basic growth tools.",
    features: ["Community feed", "3 habit slots", "Public challenges", "Basic profile"],
    cta: "Get started",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Clarity Circle+",
    price: "$0.99",
    period: "/month",
    desc: "Everything you need to accelerate your growth.",
    features: ["Unlimited habits", "Advanced analytics", "Premium themes", "Exclusive challenges", "Premium communities"],
    cta: "Start Plus",
    href: "/signup",
    highlight: true,
  },
  {
    name: "Family",
    price: "$1.99",
    period: "/month",
    desc: "For parents supporting up to 3 child profiles.",
    features: ["Parent dashboard", "3 child profiles", "Family goals", "Growth reports", "Encouragement tools"],
    cta: "Start Family",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Business",
    price: "$8.99",
    period: "/month",
    desc: "For creators, coaches, and organizations building growth communities.",
    features: ["Business profile", "Team workspace", "Team chat", "Announcements", "Analytics dashboard", "Product promotion"],
    cta: "Start Business",
    href: "/signup",
    highlight: false,
  },
];

const GARDEN_THEMES = [
  { icon: Leaf, label: "Lavender Garden", tone: "bg-lavender-100 text-lavender-700" },
  { icon: Mountain, label: "Forest Path", tone: "bg-emerald-100 text-emerald-800" },
  { icon: Waves, label: "Ocean Calm", tone: "bg-cyan-100 text-cyan-800" },
  { icon: Sun, label: "Sunrise Goals", tone: "bg-amber-100 text-amber-800" },
];

const COMMUNITY = [
  { name: "Sage", role: "Growth guide", color: "from-emerald-300 to-lavender-300" },
  { name: "Explorer", role: "Learning", color: "from-amber-200 to-emerald-300" },
  { name: "Creator", role: "Creative goals", color: "from-rose-200 to-lavender-300" },
  { name: "Wellness", role: "Balance", color: "from-cyan-200 to-emerald-300" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden" style={{ backgroundColor: "var(--bg-primary)" }}>
      <nav className="sticky top-0 z-50 border-b backdrop-blur-sm" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }}>
        <div className="section-container flex items-center justify-between py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-emerald-400 via-lavender-400 to-amber-300 flex items-center justify-center shadow-soft">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>Clarity Circle</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Join free</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="section-container py-16 md:py-24">
        <div className="grid lg:grid-cols-[1fr_0.95fr] items-center gap-12">
          <div className="max-w-3xl space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium"
              style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>
              <Leaf className="w-4 h-4 text-emerald-600" />
              A calm growth ecosystem for everyone
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight max-w-4xl" style={{ color: "var(--text-primary)" }}>
              Grow with{" "}
              <span className="text-emerald-600 dark:text-emerald-300">
                clarity.
              </span>
            </h1>

            <p className="text-lg md:text-xl max-w-2xl leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Build better habits, join meaningful challenges, track your Growth Garden,
              and find supportive circles across every stage of life.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link href="/signup">
                <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Start growing free
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="secondary">Sign in</Button>
              </Link>
            </div>

            <p className="text-xs" style={{ color: "var(--text-muted)" }}>No credit card required. Cancel anytime.</p>
          </div>

          <div className="relative max-w-xl mx-auto lg:mr-0 w-full">
            <div className="rounded-3xl overflow-hidden shadow-card border" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}>
              <div className="h-10 flex items-center gap-2 px-4 border-b" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-subtle)" }}>
                <div className="flex gap-1.5">
                  {["bg-red-400", "bg-yellow-400", "bg-green-400"].map((c, i) => (
                    <div key={i} className={`w-3 h-3 rounded-full ${c}`} />
                  ))}
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>claritycircle.app</span>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="rounded-3xl p-5 bg-gradient-to-br from-emerald-50 via-lavender-50 to-amber-50 dark:from-emerald-950 dark:via-lavender-950 dark:to-midnight-900 border border-lavender-100 dark:border-lavender-700">
                  <div className="flex items-end justify-between gap-3 min-h-48">
                    {["Seed", "Sprout", "Grow", "Bloom", "Garden"].map((stage, i) => (
                      <div key={stage} className="flex flex-col items-center gap-2 flex-1">
                        <div className="relative w-full h-28 flex items-end justify-center">
                          <div className="absolute bottom-0 w-12 h-5 rounded-[50%] bg-amber-700/25 dark:bg-amber-300/35" />
                          <div
                            className="w-3 rounded-full bg-emerald-500 dark:bg-emerald-300"
                            style={{ height: `${Math.max(12, 18 + i * 16)}px` }}
                          />
                          {i > 0 && <div className="absolute bottom-8 left-1/2 w-8 h-5 rounded-full bg-emerald-300 dark:bg-emerald-200 -rotate-12" />}
                          {i > 1 && <div className="absolute bottom-14 right-1/2 w-8 h-5 rounded-full bg-emerald-400 dark:bg-emerald-300 rotate-12" />}
                          {i > 2 && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-rose-300 dark:bg-rose-400 grid place-items-center text-white shadow-soft">
                              <Sparkles className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <span className="text-[11px] font-semibold text-midnight-800 dark:text-lavender-50">{stage}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {GARDEN_THEMES.map(({ icon: Icon, label, tone }) => (
                    <div key={label} className="rounded-2xl border p-3 flex items-center gap-2" style={{ borderColor: "var(--border-default)" }}>
                      <div className={`w-9 h-9 rounded-xl grid place-items-center ${tone}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 card px-4 py-2 shadow-bloom animate-float">
              <p className="text-xs font-bold text-amber-600">+50 points earned</p>
            </div>
            <div className="absolute -bottom-4 -left-4 card px-4 py-2 shadow-soft animate-float" style={{ animationDelay: "2s" }}>
              <p className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>14 day streak</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-container py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            Everything you need to grow
          </h2>
          <p style={{ color: "var(--text-muted)" }}>Built for teenagers, parents, creators, professionals, and lifelong learners.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6 hover:-translate-y-1 transition-all duration-300 cursor-default">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-lavender-100 dark:from-lavender-900/30 dark:to-emerald-900/30 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-lavender-600" />
              </div>
              <h3 className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>{title}</h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-container py-20">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
          <div>
            <h2 className="font-display text-4xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
              A circle for every journey
            </h2>
            <p className="max-w-xl" style={{ color: "var(--text-muted)" }}>
              Clarity Circle welcomes different ages, cultures, goals, and life seasons.
              The identity stays warm and expressive without making growth feel exclusive.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {COMMUNITY.map(({ name, role, color }) => (
              <div key={name} className="card p-4 flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold shadow-soft`}>
                  {name.slice(0, 1)}
                </div>
                <div>
                  <p className="font-bold" style={{ color: "var(--text-primary)" }}>{name}</p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-container py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            Real people. Real growth.
          </h2>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-5 h-5 fill-amber-400 stroke-amber-400" />)}
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loved by our community</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map(({ name, handle, text, avatar }) => (
            <div key={name} className="card p-6 space-y-4">
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>{text}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-lavender-400 flex items-center justify-center text-white font-bold">
                  {avatar}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{handle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-container py-20" id="pricing">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>Simple, honest pricing</h2>
          <p style={{ color: "var(--text-muted)" }}>Start free. Upgrade when you are ready.</p>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {PRICING.map(({ name, price, period, desc, features, cta, href, highlight }) => (
            <div key={name} className={`card p-6 relative ${highlight ? "border-2 border-lavender-400 shadow-glow" : ""}`}>
              {highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-lavender-500 to-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                  Most popular
                </div>
              )}
              <div className="mb-4">
                <p className="font-bold text-sm mb-1" style={{ color: "var(--text-muted)" }}>{name}</p>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{price}</span>
                  {period && <span className="text-sm" style={{ color: "var(--text-muted)" }}>{period}</span>}
                </div>
                <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>{desc}</p>
              </div>
              <ul className="space-y-2 mb-6">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-primary)" }}>
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={href}>
                <Button variant={highlight ? "primary" : "secondary"} className="w-full">{cta}</Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="section-container py-20">
        <div className="rounded-3xl p-10 md:p-16 text-center gradient-brand" style={{ color: "#1a0a4a" }}>
          <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-white/70 grid place-items-center animate-bloom">
            <BookOpen className="w-7 h-7 text-lavender-700" />
          </div>
          <h2 className="font-display text-4xl font-bold mb-3">Your circle is waiting.</h2>
          <p className="text-lg mb-8 opacity-80">Join people choosing steady growth, support, and balance every day.</p>
          <Link href="/signup">
            <Button size="lg" className="!bg-white !text-lavender-700 hover:!bg-lavender-50 !shadow-bloom" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Start for free
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t py-8" style={{ borderColor: "var(--border-default)" }}>
        <div className="section-container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-lavender-400 flex items-center justify-center">
              <span className="text-white font-bold text-xs">C</span>
            </div>
            <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Clarity Circle</span>
          </div>
          <div className="flex gap-5 text-xs" style={{ color: "var(--text-muted)" }}>
            {["Privacy", "Terms", "Safety", "Support"].map((link) => (
              <Link key={link} href={`/${link.toLowerCase()}`} className="hover:text-lavender-600 transition-colors">{link}</Link>
            ))}
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Copyright 2026 Clarity Circle.</p>
        </div>
      </footer>
    </div>
  );
}
