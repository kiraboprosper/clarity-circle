import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-2xl space-y-4">
        <div className="flex items-center gap-2">
          <Link href="/signup" className="rounded-full p-2 text-lavender-600 transition hover:bg-lavender-50">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Privacy policy</h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>How we handle your information and keep your account secure.</p>
          </div>
        </div>

        <div className="space-y-3 text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
          <p>Clarity Circle collects the minimum information needed to create an account, support your habits and community activity, and provide a better experience.</p>
          <p>This may include your name, email address, profile details, and activity data such as posts and habits.</p>
          <p>We use your information to run the app, personalize your experience, and respond to support requests. You can manage your profile and privacy settings from the app.</p>
          <p>If you delete your account or request data updates, we’ll work through the available account tools to support that request.</p>
        </div>
      </Card>
    </div>
  );
}
