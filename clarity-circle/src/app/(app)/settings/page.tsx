"use client";
import { useState } from "react";
import { User, Bell, Shield, Palette, CreditCard, LogOut, ChevronRight, Moon, Sun, Monitor } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/context/AuthContext";
import { useTheme } from "@/lib/context/ThemeContext";
import { signOut } from "@/lib/firebase/auth";
import { updateUserProfile } from "@/lib/firebase/users";
import { useRouter } from "next/navigation";
import type { NotificationSettings, ThemePreference } from "@/lib/types";
import { RevenueCatPlans } from "@/components/subscription/RevenueCatPlans";

const THEME_OPTIONS: { value: ThemePreference; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
];

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [section, setSection] = useState<"main" | "profile" | "notifications" | "privacy" | "theme" | "subscription">("main");
  const [form, setForm] = useState({ displayName: profile?.displayName || "", bio: profile?.bio || "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveAndFlash = async (data: Parameters<typeof updateUserProfile>[1]) => {
    if (!user) return;
    setSaving(true);
    await updateUserProfile(user.uid, data);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const toggleNotification = async (key: keyof NotificationSettings, checked: boolean) => {
    const next = { ...(profile?.notificationSettings || {}), [key]: checked } as NotificationSettings;
    await saveAndFlash({ notificationSettings: next });
  };

  const handleSignOut = async () => { await signOut(); router.replace("/login"); };
  const sections = [
    { id: "profile", icon: User, label: "Profile", desc: "Edit your public profile" },
    { id: "theme", icon: Palette, label: "Appearance", desc: "Theme and display preferences" },
    { id: "notifications", icon: Bell, label: "Notifications", desc: "Control what alerts you receive" },
    { id: "privacy", icon: Shield, label: "Privacy", desc: "Account privacy and safety" },
    { id: "subscription", icon: CreditCard, label: "Subscription", desc: "Manage your plan" },
  ] as const;

  if (section !== "main") {
    return <div className="section-container py-6 max-w-xl space-y-5"><button onClick={() => setSection("main")} className="btn-ghost flex items-center gap-2 -ml-2">Back to Settings</button>
      {section === "profile" && <Card className="space-y-4"><h2 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Edit Profile</h2>{profile && <div className="flex items-center gap-4"><Avatar src={profile.photoURL} name={profile.displayName} size="lg" /></div>}<Input label="Display name" value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} /><Textarea label="Bio" value={form.bio} rows={3} placeholder="Tell the community who you are..." onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} /><Button onClick={() => saveAndFlash({ displayName: form.displayName, bio: form.bio })} loading={saving} className="w-full">{saved ? "Saved" : "Save changes"}</Button></Card>}
      {section === "theme" && <Card className="space-y-4"><h2 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Appearance</h2><div className="grid grid-cols-3 gap-3">{THEME_OPTIONS.map(({ value, icon: Icon, label }) => <button key={value} onClick={() => { setTheme(value); void saveAndFlash({ theme: value }); }} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${theme === value ? "border-lavender-500 bg-lavender-50 dark:bg-lavender-900/20" : "border-transparent"}`} style={theme !== value ? { backgroundColor: "var(--bg-subtle)" } : {}}><Icon className="w-6 h-6" /><span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</span></button>)}</div></Card>}
      {section === "notifications" && <Card className="space-y-4"><h2 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Notifications</h2>{([{ key: "likes", label: "Likes", desc: "When someone likes your post" }, { key: "comments", label: "Comments", desc: "When someone comments" }, { key: "follows", label: "New followers", desc: "When someone follows you" }, { key: "directMessages", label: "Direct messages", desc: "When you receive a message" }, { key: "challenges", label: "Challenge updates", desc: "Daily challenge reminders" }, { key: "communityUpdates", label: "Community updates", desc: "News from Clarity Circle" }] as const).map(({ key, label, desc }) => <SettingToggle key={key} label={label} desc={desc} checked={Boolean(profile?.notificationSettings?.[key])} onChange={(checked) => toggleNotification(key, checked)} />)}</Card>}
      {section === "privacy" && <Card className="space-y-4"><h2 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Privacy & Safety</h2><SettingToggle label="Private account" desc="Only approved followers see your profile details" checked={Boolean(profile?.isPrivate)} onChange={(checked) => saveAndFlash({ isPrivate: checked })} /></Card>}
      {section === "subscription" && <RevenueCatPlans />}
    </div>;
  }

  return <div className="section-container py-6 max-w-xl space-y-5">{profile && <Card><div className="flex items-center gap-4"><Avatar src={profile.photoURL} name={profile.displayName} size="md" /><div className="flex-1 min-w-0"><p className="font-semibold" style={{ color: "var(--text-primary)" }}>{profile.displayName}</p><p className="text-sm" style={{ color: "var(--text-muted)" }}>@{profile.username}</p></div><Badge variant={profile.subscriptionTier === "free" ? "gray" : "lavender"}>{profile.subscriptionTier === "free" ? "Free" : "Plus"}</Badge></div></Card>}<div className="card p-0 overflow-hidden divide-y" style={{ borderColor: "var(--border-default)" }}>{sections.map(({ id, icon: Icon, label, desc }) => <button key={id} onClick={() => setSection(id)} className="w-full flex items-center gap-4 p-4 text-left hover:bg-subtle transition-all"><div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--bg-subtle)" }}><Icon className="w-5 h-5" style={{ color: "var(--accent-primary)" }} /></div><div className="flex-1 min-w-0"><p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{label}</p><p className="text-xs" style={{ color: "var(--text-muted)" }}>{desc}</p></div><ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-muted)" }} /></button>)}</div><Button variant="ghost" onClick={handleSignOut} className="w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" leftIcon={<LogOut className="w-4 h-4" />}>Sign out</Button></div>;
}

function SettingToggle({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <div className="flex items-center justify-between py-2"><div><p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</p><p className="text-xs" style={{ color: "var(--text-muted)" }}>{desc}</p></div><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="sr-only peer" /><div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lavender-500" /></label></div>;
}
