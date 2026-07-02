import { formatDistanceToNow, format } from "date-fns";
import type { Timestamp } from "firebase/firestore";

export function timeAgo(timestamp: Timestamp | Date | null): string {
  if (!timestamp) return "";
  const date = timestamp instanceof Date ? timestamp : (timestamp as Timestamp).toDate();
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatDate(timestamp: Timestamp | Date | null, fmt = "MMM d, yyyy"): string {
  if (!timestamp) return "";
  const date = timestamp instanceof Date ? timestamp : (timestamp as Timestamp).toDate();
  return format(date, fmt);
}

export function formatPoints(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export const GROWTH_STAGE_LABELS: Record<string, string> = {
  seed:     "Seed",
  sprout:   "Sprout",
  bloom:    "Bloom",
  flourish: "Flourish",
  radiant:  "Radiant",
};

export const GROWTH_STAGE_EMOJIS: Record<string, string> = {
  seed:     "🌱",
  sprout:   "🌿",
  bloom:    "🌸",
  flourish: "🌺",
  radiant:  "✨",
};

export function xpToNextLevel(level: number): number {
  return level * 500;
}
