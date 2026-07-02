"use client";
import { useState, useEffect } from "react";
import { Plus, Trophy } from "lucide-react";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { Challenge } from "@/lib/types";

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", durationDays: "30", pointsReward: "300", difficulty: "beginner", isPremium: false });
  const [saving, setSaving] = useState(false);

  const loadChallenges = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, COLLECTIONS.CHALLENGES));
    setChallenges(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Challenge)));
    setLoading(false);
  };

  useEffect(() => { loadChallenges(); }, []);

  const handleCreate = async () => {
    if (!form.title) return;
    setSaving(true);
    await addDoc(collection(db, COLLECTIONS.CHALLENGES), {
      title: form.title,
      description: form.description,
      durationDays: parseInt(form.durationDays),
      pointsReward: parseInt(form.pointsReward),
      difficulty: form.difficulty,
      isPremium: form.isPremium,
      status: "active",
      coverImageURL: "",
      category: "mindset",
      tasks: [],
      badgeReward: null,
      participantsCount: 0,
      createdAt: serverTimestamp(),
      startsAt: null,
      endsAt: null,
    });
    await loadChallenges();
    setShowCreate(false);
    setSaving(false);
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Challenges</h1>
        <Button onClick={() => setShowCreate(true)} leftIcon={<Plus className="w-4 h-4" />} size="sm">New challenge</Button>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading…</p>
      ) : challenges.length === 0 ? (
        <div className="text-center py-16">
          <Trophy className="w-10 h-10 mx-auto mb-3 text-lavender-300" />
          <p className="font-medium mb-4" style={{ color: "var(--text-primary)" }}>No challenges yet</p>
          <Button onClick={() => setShowCreate(true)} leftIcon={<Plus className="w-4 h-4" />}>Create challenge</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {challenges.map((ch) => (
            <Card key={ch.id} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-lavender-400 to-blossom-400 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{ch.title}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{ch.durationDays} days · {ch.participantsCount} participants</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Badge variant={ch.status === "active" ? "green" : "gray"}>{ch.status}</Badge>
                {ch.isPremium && <Badge variant="gold">Plus</Badge>}
                <Badge variant="lavender">+{ch.pointsReward}pts</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Challenge" size="md">
        <div className="space-y-4">
          <Input label="Title" placeholder="30 Day Confidence Challenge" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <Textarea label="Description" rows={2} placeholder="What will members achieve?" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Duration (days)" type="number" value={form.durationDays} onChange={(e) => setForm((f) => ({ ...f, durationDays: e.target.value }))} />
            <Input label="Points reward" type="number" value={form.pointsReward} onChange={(e) => setForm((f) => ({ ...f, pointsReward: e.target.value }))} />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer" style={{ color: "var(--text-primary)" }}>
              <input type="checkbox" checked={form.isPremium} onChange={(e) => setForm((f) => ({ ...f, isPremium: e.target.checked }))} className="rounded" />
              Premium (Clarity+ only)
            </label>
          </div>
          <Button onClick={handleCreate} loading={saving} className="w-full">Create challenge</Button>
        </div>
      </Modal>
    </div>
  );
}
