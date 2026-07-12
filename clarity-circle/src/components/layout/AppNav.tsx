"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Leaf, Trophy, MessageCircle, User, Bell, Gift, BarChart3, CalendarDays, Bookmark, Settings, Users, Plus, Search, Moon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/lib/context/AuthContext";
import { Avatar } from "../ui/Avatar";

const desktopNavItems = [
  { href: "/feed", icon: Home, label: "Home" },
  { href: "/habits", icon: Leaf, label: "Habits" },
  { href: "/challenges", icon: Trophy, label: "Challenges" },
  { href: "/circles", icon: Users, label: "Circles" },
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
  { href: "/feed", icon: Plus, label: "Create" },
  { href: "/challenges", icon: Trophy, label: "Challenges" },
];

function isActive(pathname: string, href: string) {
  const root = href.split("/")[1];
  return pathname.startsWith(root ? `/${root}` : href);
}

export function BottomNav() {
  const pathname = usePathname();
  const { profile } = useAuth();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }}>
      <div className="grid grid-cols-5 px-2 py-2 safe-bottom">
        {mobileNavItems.map(({ href, icon: Icon, label }) => {
          const active = isActive(pathname, href);
          return (
            <Link key={label} href={href} className={cn("flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-2xl transition-all duration-200", active ? "text-lavender-600" : "text-gray-400")}>
              <Icon className={cn("w-5 h-5", active && "stroke-[2.5]")} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
        <Link href={`/profile/${profile?.uid}`} className={cn("flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-2xl transition-all duration-200", pathname.startsWith("/profile") ? "text-lavender-600" : "text-gray-400")}>
          {profile ? <Avatar src={profile.photoURL} name={profile.displayName} size="xs" /> : <User className="w-5 h-5" />}
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </div>
    </nav>
  );
}

export function SideNav() {
  const pathname = usePathname();
  const { profile } = useAuth();
  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 h-screen sticky top-0 border-r p-4 overflow-y-auto" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }}>
      <Link href="/feed" className="flex items-center gap-3 mb-6 group px-2">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blossom-200 via-lavender-200 to-lavender-500 flex items-center justify-center shadow-soft">
          <span className="text-white font-bold text-lg">C</span>
        </div>
        <span className="font-display text-xl font-bold leading-tight" style={{ color: "var(--text-primary)" }}>Clarity<br />Circle</span>
      </Link>
      <nav className="flex-1 space-y-1">
        {desktopNavItems.map(({ href, icon: Icon, label }) => {
          const active = isActive(pathname, href);
          return (
            <Link key={href} href={href} className={cn("flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm", active ? "bg-lavender-100 text-lavender-800 dark:bg-lavender-900/30 dark:text-lavender-200" : "hover:bg-subtle text-gray-600 dark:text-gray-400 hover:text-primary")}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="rounded-2xl p-4 my-4 bg-gradient-to-br from-lavender-100 to-blossom-100 border border-lavender-200">
        <p className="text-sm font-bold text-midnight-900">Upgrade to Clarity Circle+</p>
        <p className="text-xs mt-1 text-midnight-800">Unlock unlimited habits, analytics, premium circles, and advanced challenge support.</p>
        <Link href="/settings" className="btn-primary mt-3 w-full !py-2 !text-xs">Upgrade Now</Link>
      </div>
      {profile && (
        <div className="pt-4 border-t" style={{ borderColor: "var(--border-default)" }}>
          <Link href={`/profile/${profile.uid}`} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-subtle transition-all">
            <Avatar src={profile.photoURL} name={profile.displayName} size="sm" verified={profile.isVerified} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{profile.displayName}</p>
              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>Level {profile.level}</p>
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
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 border-b backdrop-blur md:px-6" style={{ backgroundColor: "rgba(255,255,255,0.82)", borderColor: "var(--border-default)" }}>
      <div className="hidden md:flex items-center gap-2 flex-1 max-w-sm input-base !py-2.5">
        <Search className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>Search Clarity Circle...</span>
      </div>
      <div className="flex md:hidden items-center gap-2">
        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-lavender-400 to-blossom-400 flex items-center justify-center">
          <span className="text-white font-bold text-xs">C</span>
        </div>
        <span className="font-display font-bold text-base" style={{ color: "var(--text-primary)" }}>{title || "Clarity Circle"}</span>
      </div>
      <div className="ml-auto flex items-center gap-2 md:gap-4">
        <button className="btn-ghost p-2 rounded-xl relative"><Bell className="w-5 h-5" /></button>
        <button className="btn-ghost p-2 rounded-xl hidden md:inline-flex"><Moon className="w-5 h-5" /></button>
        <Link href={`/profile/${profile?.uid}`} className="flex items-center gap-2">
          <Avatar src={profile?.photoURL || null} name={profile?.displayName || "?"} size="sm" />
          <span className="hidden lg:block text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{profile?.displayName || "Member"}</span>
        </Link>
      </div>
    </header>
  );
}
