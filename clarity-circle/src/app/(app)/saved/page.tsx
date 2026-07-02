"use client";
import { Bookmark, FileText, Image, Lock, PlayCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const saved = [
  { title: "30 journal prompts for confidence", type: "Resource", icon: FileText },
  { title: "Morning routine inspiration", type: "Post", icon: Image },
  { title: "Breathwork for anxious moments", type: "Audio", icon: PlayCircle },
  { title: "Business workspace guide", type: "Premium", icon: Lock },
];

export default function SavedPage() {
  return (
    <div className="section-container py-6 space-y-6 max-w-4xl">
      <div><h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Saved</h1><p className="text-sm" style={{ color: "var(--text-muted)" }}>Posts, resources, and growth tools you want to revisit.</p></div>
      <div className="grid gap-4 sm:grid-cols-2">{saved.map(({ title, type, icon: Icon }) => <Card key={title} className="space-y-4"><div className="flex items-start justify-between"><div className="w-12 h-12 rounded-2xl bg-blossom-100 grid place-items-center"><Icon className="w-6 h-6 text-blossom-600" /></div><Badge variant={type === "Premium" ? "gold" : "lavender"}>{type}</Badge></div><h2 className="font-bold" style={{ color: "var(--text-primary)" }}>{title}</h2><Button variant="secondary" className="w-full" leftIcon={<Bookmark className="w-4 h-4" />}>Open</Button></Card>)}</div>
    </div>
  );
}
