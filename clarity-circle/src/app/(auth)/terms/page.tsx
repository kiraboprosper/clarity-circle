import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-2xl space-y-4">
        <div className="flex items-center gap-2">
          <Link href="/signup" className="rounded-full p-2 text-lavender-600 transition hover:bg-lavender-50">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Terms of use</h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>A simple overview of what to expect when using Clarity Circle.</p>
          </div>
        </div>

        <div className="space-y-3 text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
          <p>Clarity Circle is a wellness and community app designed to support reflection, healthy habits, and positive growth.</p>
          <p>You agree to use the app respectfully, avoid harassment or harmful behavior, and keep your account information accurate.</p>
          <p>We may update features, pricing, or policies over time. Continued use means you accept the latest version of these terms.</p>
          <p>If you have questions about your account or the app, please contact support through the product team.</p>
        </div>
      </Card>
    </div>
  );
}
