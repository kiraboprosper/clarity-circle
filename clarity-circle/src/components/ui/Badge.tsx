import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

type BadgeVariant = "lavender" | "blossom" | "gold" | "green" | "red" | "gray";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  lavender: "badge badge-lavender",
  blossom:  "badge badge-blossom",
  gold:     "badge badge-gold",
  green:    "badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  red:      "badge bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  gray:     "badge bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
};

export function Badge({ children, variant = "lavender", className }: BadgeProps) {
  return <span className={cn(variants[variant], className)}>{children}</span>;
}
