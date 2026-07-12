"use client";
import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Users, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/context/AuthContext";
import { cancelRsvp, getEvents, getRsvpedEventIds, rsvpEvent, type EventItem } from "@/lib/firebase/events";

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [rsvped, setRsvped] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      setLoading(true);
      const [items, ids] = await Promise.all([getEvents(), getRsvpedEventIds(user.uid)]);
      setEvents(items);
      setRsvped(ids);
      setLoading(false);
    }
    void load();
  }, [user]);

  const toggleRsvp = async (eventId: string) => {
    if (!user) return;
    if (rsvped.includes(eventId)) {
      await cancelRsvp(user.uid, eventId);
      setRsvped((current) => current.filter((id) => id !== eventId));
    } else {
      await rsvpEvent(user.uid, eventId);
      setRsvped((current) => [...current, eventId]);
    }
  };

  return (
    <div className="section-container py-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Events</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Live rooms, workshops, and circle gatherings.</p>
      </div>
      {loading ? <Card>Loading events...</Card> : events.length === 0 ? (
        <Card className="py-16 text-center"><CalendarDays className="mx-auto w-10 h-10 text-lavender-500" /><p className="font-semibold mt-3">No events scheduled</p><p className="text-sm" style={{ color: "var(--text-muted)" }}>Admins can add events in Firestore.</p></Card>
      ) : <div className="grid gap-4">{events.map((event) => {
        const going = rsvped.includes(event.id);
        return <Card key={event.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-4"><div className="w-16 h-16 rounded-2xl bg-lavender-100 grid place-items-center text-center"><CalendarDays className="w-6 h-6 text-lavender-600" /></div><div><div className="flex items-center gap-2"><h2 className="font-bold" style={{ color: "var(--text-primary)" }}>{event.title}</h2><Badge variant="lavender">{event.tag}</Badge></div><p className="text-xs flex items-center gap-1 mt-1" style={{ color: "var(--text-muted)" }}><MapPin className="w-3 h-3" />{event.place}</p>{event.description && <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>{event.description}</p>}</div></div><Button variant={going ? "secondary" : "primary"} leftIcon={going ? <CheckCircle2 className="w-4 h-4" /> : <Users className="w-4 h-4" />} onClick={() => toggleRsvp(event.id)}>{going ? "Going" : "RSVP"}</Button></Card>;
      })}</div>}
    </div>
  );
}
