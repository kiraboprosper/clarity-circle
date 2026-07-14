"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Leaf, MessageCircle, User, Bell, Gift, BarChart3, CalendarDays, Bookmark, Settings, Users, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/lib/context/AuthContext";
import { Avatar } from "../ui/Avatar";

const desktopNavItems = [
  { href: "/feed", icon: Home, label: "Home" },
  { href: "/habits", icon: Leaf, label: "Habits" },
  { href: "/circles", icon: Users, label: "Circle" },
  { href: "/chat", icon: MessageCircle, label: "Messages" },
  { href: "/rewards", icon: Gift, label: "Rewards" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/events", icon: CalendarDays, label: "Events" },
  { href: "/saved", icon: Bookmark, label: "Saved" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

const mobileNavItems = [
  { href: "/feed", icon: Home, label: "Home" },
  { href: "/habits", icon: Leaf, label: "Habits" },
  { href: "/circles", icon: Users, label: "Circle" },
  { href: "/chat", icon: MessageCircle, label: "Chat" },
  { href: "/feed", icon: Plus, label: "Create" },
];

function isActive(pathname: string, href: string) {
  const root = href.split("/")[1];
  return pathname.startsWith(root ? `/${root}` : href);
}

export function BottomNav() {
  const pathname = usePathname();
  const { profile } = useAuth();
  return (
    <nav className="fixed bottom-3 left-1/2 z-40 md:hidden -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-[24px] border border-white/70 bg-white/80 px-2 py-2 shadow-luxury backdrop-blur-xl safe-bottom">
        {mobileNavItems.map(({ href, icon: Icon, label }) => {
          const active = isActive(pathname, href);
          return (
            <Link key={label} href={href} className={cn("flex min-w-[58px] flex-col items-center gap-1 rounded-[18px] px-2 py-2 transition-all duration-200", active ? "bg-[linear-gradient(135deg,rgba(191,167,242,0.28),rgba(216,200,255,0.2))] text-[color:var(--accent)]" : "text-[color:var(--text-muted)]") }>
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
              <span className="text-[10px] font-semibold">{label}</span>
            </Link>
          );
        })}
        <Link href={`/profile/${profile?.uid}`} className={cn("flex min-w-[58px] flex-col items-center gap-1 rounded-[18px] px-2 py-2 transition-all duration-200", pathname.startsWith("/profile") ? "bg-[linear-gradient(135deg,rgba(191,167,242,0.28),rgba(216,200,255,0.2))] text-[color:var(--accent)]" : "text-[color:var(--text-muted)]") }>
          {profile ? <Avatar src={profile.photoURL} name={profile.displayName} size="xs" /> : <User className="h-5 w-5" />}
          <span className="text-[10px] font-semibold">Profile</span>
        </Link>
      </div>
    </nav>
  );
}

export function SideNav() {
  const pathname = usePathname();
  const { profile } = useAuth();
  return (
    <aside className="hidden md:flex h-screen w-64 flex-col sticky top-0 overflow-y-auto border-r p-4 lg:w-72" style={{ backgroundColor: "rgba(255,255,255,0.7)", borderColor: "var(--border-default)", backdropFilter: "blur(20px)" }}>
      <Link href="/feed" className="mb-6 flex items-center gap-3 px-2 py-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,var(--primary-lavender),var(--accent))] shadow-luxury">
          <span className="text-lg font-bold text-white">C</span>
        </div>
        <div>
          <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Clarity Circle</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Wellness space</p>
        </div>
      </Link>
      <nav className="flex-1 space-y-1">
        {desktopNavItems.map(({ href, icon: Icon, label }) => {
          const active = isActive(pathname, href);
          return (
            <Link key={href} href={href} className={cn("flex items-center gap-3 rounded-[18px] px-4 py-2.5 text-sm font-medium transition-all duration-200", active ? "bg-[linear-gradient(135deg,rgba(191,167,242,0.24),rgba(216,200,255,0.16))] text-[color:var(--accent)]" : "text-[color:var(--text-secondary)] hover:bg-[rgba(191,167,242,0.12)] hover:text-[color:var(--text-primary)]") }>
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="my-4 rounded-[24px] border border-white/70 bg-[linear-gradient(135deg,rgba(191,167,242,0.16),rgba(255,255,255,0.9))] p-4 shadow-soft">
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Upgrade to Clarity Circle+</p>
        <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>Unlock premium circles, richer analytics, and deeper support.</p>
        <Link href="/settings" className="btn-primary mt-3 w-full !py-2 !text-xs">Upgrade Now</Link>
      </div>
      {profile && (
        <div className="border-t pt-4" style={{ borderColor: "var(--border-default)" }}>
          <Link href={`/profile/${profile.uid}`} className="flex items-center gap-3 rounded-[18px] p-3 transition-all hover:bg-[rgba(191,167,242,0.12)]">
            <Avatar src={profile.photoURL} name={profile.displayName} size="sm" verified={profile.isVerified} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{profile.displayName}</p>
              <p className="truncate text-xs" style={{ color: "var(--text-muted)" }}>Level {profile.level}</p>
            </div>
          </Link>
        </div>
      )}
    </aside>
  );
}

export function TopBar({ title }: { title?: string }) {
  const { profile } = useAuth();
  return (
    <header className="sticky top-3 z-30 mx-3 flex items-center justify-between gap-3 rounded-[24px] border border-white/70 bg-white/70 px-4 py-3 shadow-soft backdrop-blur-xl md:px-6">
      <div className="hidden flex-1 max-w-sm items-center gap-2 rounded-[18px] border border-white/70 bg-white/70 px-3 py-2 md:flex">
        <Search className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>Search Clarity Circle...</span>
      </div>
      <div className="flex items-center gap-2 md:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,var(--primary-lavender),var(--accent))]">
          <span className="text-xs font-bold text-white">C</span>
        </div>
        <span className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{title || "Clarity Circle"}</span>
      </div>
      <div className="ml-auto flex items-center gap-2 md:gap-3">
        <button className="btn-ghost rounded-[16px] p-2"><Bell className="h-5 w-5" /></button>
        <Link href={`/profile/${profile?.uid}`} className="flex items-center gap-2 rounded-[18px] px-2 py-1 transition-all hover:bg-[rgba(191,167,242,0.12)]">
          <Avatar src={profile?.photoURL || null} name={profile?.displayName || "?"} size="sm" />
          <span className="hidden text-sm font-semibold lg:block" style={{ color: "var(--text-primary)" }}>{profile?.displayName || "Member"}</span>
        </Link>
      </div>
    </header>
  );
}

