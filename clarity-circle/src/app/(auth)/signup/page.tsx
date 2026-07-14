"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, AtSign, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { signUpWithEmail, signInWithGoogle } from "@/lib/firebase/auth";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "", age: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async () => {
    setError("");
    if (!form.name || !form.username || !form.email || !form.password || !form.age) {
      setError("Please fill in all fields."); return;
    }
    const age = parseInt(form.age);
    if (isNaN(age) || age < 13) { setError("You must be at least 13 to join."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      await signUpWithEmail(form.email, form.password, form.name, form.username.toLowerCase().replace(/\s/g, "_"), age);
      router.replace("/onboarding");
    } catch (e: any) {
      if (e.code === "auth/email-already-in-use") setError("An account with this email already exists.");
      else setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.replace("/onboarding");
    } catch {
      setError("Google sign in failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleDemo = () => {
    router.replace("/feed?demoAuth=1");
  };

  return (
    <Card className="animate-slide-up">
      <h2 className="text-xl font-bold mb-1 text-center" style={{ color: "var(--text-primary)" }}>Start your journey 🌱</h2>
      <p className="text-center text-sm mb-6" style={{ color: "var(--text-muted)" }}>Join thousands growing together.</p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <Input label="Full name" placeholder="Your name" value={form.name} onChange={f("name")} leftElement={<User className="w-4 h-4" />} />
        <Input label="Username" placeholder="@yourusername" value={form.username} onChange={f("username")} leftElement={<AtSign className="w-4 h-4" />} hint="This will be your public handle." />
        <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={f("email")} leftElement={<Mail className="w-4 h-4" />} autoComplete="email" />
        <Input label="Age" type="number" placeholder="Your age" value={form.age} onChange={f("age")} hint="You must be at least 13 to join." />
        <Input
          label="Password"
          type={showPw ? "text" : "password"}
          placeholder="At least 8 characters"
          value={form.password}
          onChange={f("password")}
          leftElement={<Lock className="w-4 h-4" />}
          rightElement={
            <button onClick={() => setShowPw((s) => !s)} type="button">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          autoComplete="new-password"
        />

        <Button onClick={handleSubmit} loading={loading} className="w-full" size="lg">
          Create my account
        </Button>

        <Button variant="secondary" onClick={handleDemo} className="w-full" size="lg">
          Try demo mode
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ backgroundColor: "var(--border-default)" }} />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>or</span>
          <div className="flex-1 h-px" style={{ backgroundColor: "var(--border-default)" }} />
        </div>

        <Button variant="secondary" onClick={handleGoogle} loading={googleLoading} className="w-full" size="lg"
          leftIcon={<svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>}>
          Continue with Google
        </Button>

        <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
          By joining you agree to our{" "}
          <Link href="/terms" className="text-lavender-600 hover:underline">Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" className="text-lavender-600 hover:underline">Privacy Policy</Link>.
        </p>
      </div>

      <p className="text-center text-sm mt-6" style={{ color: "var(--text-muted)" }}>
        Already a member?{" "}
        <Link href="/login" className="text-lavender-600 font-medium hover:underline">Sign in</Link>
      </p>
    </Card>
  );
}
