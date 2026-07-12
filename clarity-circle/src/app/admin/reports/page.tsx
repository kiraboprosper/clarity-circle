"use client";
import { useState, useEffect } from "react";
import { Flag, CheckCircle, XCircle } from "lucide-react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { moderateReportSecure } from "@/lib/firebase/functions";
import type { Report } from "@/lib/types";

const REASON_LABELS: Record<string, string> = { bullying: "Bullying", harassment: "Harassment", hate_speech: "Hate speech", spam: "Spam", scam: "Scam", inappropriate: "Inappropriate" };

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "reviewed" | "all">("pending");
  useEffect(() => { async function loadReports() { setLoading(true); let q = query(collection(db, COLLECTIONS.REPORTS), orderBy("createdAt", "desc")); if (filter !== "all") q = query(q, where("status", "==", filter)); const snap = await getDocs(q); setReports(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Report))); setLoading(false); } void loadReports(); }, [filter]);
  const handleAction = async (reportId: string, action: "actioned" | "dismissed") => { await moderateReportSecure({ reportId, action }); setReports((prev) => prev.filter((r) => r.id !== reportId)); };
  return <div className="p-6 space-y-5"><div className="flex items-center justify-between"><h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Reports</h1><div className="flex gap-2">{(["pending", "reviewed", "all"] as const).map((f) => <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all ${filter === f ? "bg-lavender-500 text-white" : "btn-secondary"}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>)}</div></div>{loading ? <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full" />)}</div> : reports.length === 0 ? <div className="text-center py-16"><Flag className="w-10 h-10 mx-auto mb-3 text-lavender-300" /><p className="font-medium" style={{ color: "var(--text-primary)" }}>No {filter} reports</p></div> : <div className="space-y-3">{reports.map((report) => <div key={report.id} className="card space-y-3"><div className="flex items-start justify-between"><div className="flex gap-3 flex-wrap"><Badge variant="blossom">{report.targetType}</Badge><Badge variant="gold">{REASON_LABELS[report.reason] || report.reason}</Badge><Badge variant={report.status === "pending" ? "blossom" : report.status === "actioned" ? "green" : "gray"}>{report.status}</Badge></div><p className="text-xs" style={{ color: "var(--text-muted)" }}>#{report.id.slice(-6)}</p></div>{report.description && <p className="text-sm" style={{ color: "var(--text-primary)" }}>{report.description}</p>}<div className="flex gap-2 text-xs" style={{ color: "var(--text-muted)" }}><span>Target: <code className="bg-subtle px-1 rounded">{report.targetId.slice(-8)}</code></span><span>Reporter: <code className="bg-subtle px-1 rounded">{report.reporterId.slice(-8)}</code></span></div>{report.status === "pending" && <div className="flex gap-2 pt-2 border-t" style={{ borderColor: "var(--border-default)" }}><Button size="sm" variant="danger" onClick={() => handleAction(report.id, "actioned")} leftIcon={<XCircle className="w-3.5 h-3.5" />}>Hide content</Button><Button size="sm" variant="secondary" onClick={() => handleAction(report.id, "dismissed")} leftIcon={<CheckCircle className="w-3.5 h-3.5" />}>Dismiss</Button></div>}</div>)}</div>}</div>;
}
