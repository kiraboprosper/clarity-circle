import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center p-6" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="space-y-4">
        <div className="text-6xl">🌸</div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Page not found</h1>
        <p style={{ color: "var(--text-muted)" }}>This page doesn't exist — but your growth journey does.</p>
        <Link href="/feed">
          <Button>Back to feed</Button>
        </Link>
      </div>
    </div>
  );
}
