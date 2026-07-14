"use client";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "blossom" | "link";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[22px] font-semibold text-sm transition-all duration-200 bg-[linear-gradient(135deg,#f8a5a5_0%,#f4b6b6_100%)] text-white shadow-[0_10px_30px_rgba(248,165,165,0.25)] hover:-translate-y-0.5",
  blossom: "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[22px] font-semibold text-sm transition-all duration-200 bg-[linear-gradient(135deg,var(--primary-lavender)_0%,var(--accent)_100%)] text-white shadow-[0_12px_32px_rgba(142,110,220,0.24)] hover:-translate-y-0.5",
  link: "inline-flex items-center justify-center gap-2 text-sm font-semibold text-[color:var(--accent)] hover:text-[color:var(--text-primary)]",
};

const sizeStyles: Record<Size, string> = {
  sm: "!px-3 !py-1.5 !text-xs",
  md: "",
  lg: "!px-7 !py-3.5 !text-base",
  icon: "!p-2 !rounded-full",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, leftIcon, rightIcon, children, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(variantStyles[variant], sizeStyles[size], "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none", className)}
        {...props}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);
Button.displayName = "Button";
