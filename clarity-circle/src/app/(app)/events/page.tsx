"use client";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const events = [
  { title: "Sunday Reset Planning", date: "Jul 5", time: "6:00 PM", place: "Wellness Circle", tag: "Virtual" },
  { title: "Confidence Journaling Room", date: "Jul 8", time: "7:30 PM", place: "Confidence Circle", tag: "Workshop" },
  { title: "Creator Accountability Sprint", date: "Jul 12", time: "11:00 AM", place: "Creator Circle", tag: "Challenge" },
  { title: "Parent Growth Check-in", date: "Jul 16", time: "5:00 PM", place: "Family Circle", tag: "Family" },
];

export default function EventsPage() {
  return (
    <div className="section-container py-6 space-y-6 max-w-4xl">
      <div><h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Events</h1><p className="text-sm" style={{ color: "var(--text-muted)" }}>Live rooms, workshops, and circle gatherings.</p></div>
      <div className="grid gap-4">{events.map((event) => <Card key={event.title} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-4"><div className="w-16 h-16 rounded-2xl bg-lavender-100 grid place-items-center text-center"><CalendarDays className="w-6 h-6 text-lavender-600" /><span className="text-[10px] font-bold text-lavender-700">{event.date}</span></div><div><div className="flex items-center gap-2"><h2 className="font-bold" style={{ color: "var(--text-primary)" }}>{event.title}</h2><Badge variant="lavender">{event.tag}</Badge></div><p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{event.time}</p><p className="text-xs flex items-center gap-1 mt-1" style={{ color: "var(--text-muted)" }}><MapPin className="w-3 h-3" />{event.place}</p></div></div><Button variant="secondary" leftIcon={<Users className="w-4 h-4" />}>RSVP</Button></Card>)}</div>
    </div>
  );
}
