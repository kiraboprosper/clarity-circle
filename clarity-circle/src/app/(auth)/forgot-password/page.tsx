"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { resetPassword } from "@/lib/firebase/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch {
      setError("We could not send a reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md animate-slide-up">
        <div className="mb-6 flex items-center gap-2">
          <Link href="/login" className="rounded-full p-2 text-lavender-600 transition hover:bg-lavender-50">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Reset your password</h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>We’ll send a recovery link to your email.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {sent ? (
          <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <p className="font-semibold">Check your inbox</p>
            <p>If an account exists for that email, you’ll receive a reset link shortly.</p>
            <Link href="/login" className="font-medium underline">Back to sign in</Link>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              leftElement={<Mail className="h-4 w-4" />}
              autoComplete="email"
            />
            <Button onClick={handleSubmit} loading={loading} className="w-full" size="lg">
              Send reset link
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
