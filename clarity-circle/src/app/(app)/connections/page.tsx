"use client";
import { useMemo, useState } from "react";
import { BellRing, CalendarDays, MessageSquareText, Sparkles, Target, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  createSeedContacts,
  createSeedGoals,
  createSeedReminders,
  getPriorityContacts,
} from "@/lib/utils/connectionData";

export default function ConnectionsPage() {
  const contacts = useMemo(() => createSeedContacts(), []);
  const reminders = useMemo(() => createSeedReminders(), []);
  const goals = useMemo(() => createSeedGoals(), []);
  const priorityContacts = useMemo(() => getPriorityContacts(contacts, reminders, goals), [contacts, reminders, goals]);
  const [activeTab, setActiveTab] = useState<"overview" | "contacts" | "reminders">("overview");

  return (
    <div className="section-container py-6 space-y-6 max-w-6xl">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Connections</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          A calm place to nurture important relationships, communication goals, and meaningful reminders.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: "overview", label: "Overview" },
          { id: "contacts", label: "Contacts" },
          { id: "reminders", label: "Reminders" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${activeTab === tab.id ? "bg-lavender-500 text-white" : "bg-subtle"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              <Sparkles className="w-5 h-5 text-lavender-500" />
              Communication summary
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ["Conversations started today", "7"],
                ["Messages sent today", "14"],
                ["Messages received today", "11"],
                ["Goals due", "2"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border p-3" style={{ borderColor: "var(--border-default)" }}>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>{label}</p>
                  <p className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>{value}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              <Target className="w-5 h-5 text-emerald-500" />
              Active goals
            </div>
            {goals.map((goal) => (
              <div key={goal.id} className="rounded-2xl border p-3" style={{ borderColor: "var(--border-default)" }}>
                <div className="flex items-center justify-between">
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>{goal.title}</p>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{goal.cadence}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-subtle">
                  <div className="h-2 rounded-full bg-gradient-to-r from-lavender-500 to-emerald-500" style={{ width: `${goal.progress}%` }} />
                </div>
                <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>{goal.progress}% complete</p>
              </div>
            ))}
          </Card>
        </div>
      )}

      {activeTab === "contacts" && (
        <div className="grid gap-4 md:grid-cols-2">
          {priorityContacts.map((contact) => (
            <Card key={contact.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{contact.name}</p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>{contact.relationship}</p>
                </div>
                <span className="rounded-full bg-lavender-100 px-2.5 py-1 text-xs text-lavender-700">{contact.favorite ? "Favorite" : "Priority"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                <MessageSquareText className="w-4 h-4" />
                Last contact: {contact.lastContact}
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                <BellRing className="w-4 h-4" />
                Next reminder: {contact.nextReminder}
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "reminders" && (
        <div className="grid gap-4 md:grid-cols-2">
          {reminders.map((reminder) => (
            <Card key={reminder.id} className="p-4 space-y-2">
              <div className="flex items-center gap-2 font-semibold" style={{ color: "var(--text-primary)" }}>
                <CalendarDays className="w-4 h-4 text-emerald-500" />
                {reminder.title}
              </div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Due: {reminder.due}</p>
              <Button variant="secondary" className="w-full">Mark complete</Button>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-5">
        <div className="flex items-center gap-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          <Users className="w-5 h-5 text-lavender-500" />
          What this experience supports
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            ["Relationship notes", "Keep private context and follow-up ideas close at hand"],
            ["Scheduled messages", "Plan thoughtful outreach in advance"],
            ["Shared media", "Organize photos, voice notes, and documents"],
          ].map(([title, description]) => (
            <div key={title} className="rounded-2xl border p-3" style={{ borderColor: "var(--border-default)" }}>
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>{title}</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{description}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
