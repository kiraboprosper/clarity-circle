"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Bookmark, FileText, PlayCircle, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getSavedItemsForUser, removeSavedItemForUser } from "@/lib/firebase/saved";
import { useAuth } from "@/lib/context/AuthContext";
import type { SavedItem } from "@/lib/utils/saved";

const ICON_MAP: Record<string, typeof FileText> = { post: FileText, resource: FileText, audio: PlayCircle };

export default function SavedPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { async function load() { if (!user) return; setItems(await getSavedItemsForUser(user.uid)); setLoading(false); } void load(); }, [user]);

  const handleRemove = async (id: string) => {
    if (!user) return;
    await removeSavedItemForUser(user.uid, id);
    setItems((current) => current.filter((item) => item.id !== id));
  };

  return (
    <div className="section-container py-6 space-y-6 max-w-5xl">
      <div><h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Saved</h1><p className="text-sm" style={{ color: "var(--text-muted)" }}>Only the items you saved appear here.</p></div>
      {loading ? <Card>Loading saved items...</Card> : items.length === 0 ? <Card className="py-16 text-center space-y-4"><Bookmark className="mx-auto w-10 h-10 text-lavender-500" /><p className="font-semibold" style={{ color: "var(--text-primary)" }}>Nothing saved yet</p><p className="text-sm" style={{ color: "var(--text-muted)" }}>Save content from the feed to access it later.</p><Link href="/feed"><Button>Explore content</Button></Link></Card> : <div className="grid gap-4 sm:grid-cols-2">{items.map((item) => { const Icon = ICON_MAP[item.type] ?? FileText; return <Card key={item.id} className="space-y-4"><div className="flex items-start justify-between"><div className="w-12 h-12 rounded-2xl bg-blossom-100 grid place-items-center"><Icon className="w-6 h-6 text-blossom-600" /></div><Badge variant="lavender">{item.type}</Badge></div><div className="space-y-2"><h2 className="font-bold" style={{ color: "var(--text-primary)" }}>{item.title}</h2>{item.description && <p className="text-sm" style={{ color: "var(--text-muted)" }}>{item.description}</p>}</div><div className="flex gap-3"><Link href={item.href} className="flex-1"><Button className="w-full" leftIcon={<Bookmark className="w-4 h-4" />}>Open</Button></Link><Button variant="secondary" className="w-12 p-0" onClick={() => handleRemove(item.id)}><Trash2 className="w-4 h-4" /></Button></div></Card>; })}</div>}
    </div>
  );
}
