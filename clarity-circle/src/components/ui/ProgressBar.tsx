import { cn } from "@/lib/utils/cn";

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: "lavender" | "blossom" | "gold";
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

const trackColors = {
  lavender: "bg-lavender-100 dark:bg-lavender-900/30",
  blossom:  "bg-blossom-100 dark:bg-blossom-900/30",
  gold:     "bg-amber-100 dark:bg-amber-900/30",
};

const fillColors = {
  lavender: "bg-gradient-to-r from-lavender-400 to-lavender-500",
  blossom:  "bg-gradient-to-r from-blossom-400 to-blossom-500",
  gold:     "bg-gradient-to-r from-amber-400 to-amber-500",
};

export function ProgressBar({ value, max = 100, variant = "lavender", size = "md", showLabel, className }: ProgressBarProps) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("flex-1 rounded-full overflow-hidden", trackColors[variant], size === "sm" ? "h-1.5" : "h-2.5")}>
        <div
          className={cn("h-full rounded-full transition-all duration-700", fillColors[variant])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium w-10 text-right" style={{ color: "var(--text-muted)" }}>
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}
