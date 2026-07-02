"use client";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "blossom";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:   "btn-primary",
  secondary: "btn-secondary",
  ghost:     "btn-ghost",
  danger:    "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-medium text-sm transition-all duration-200 bg-red-500 hover:bg-red-600 text-white",
  blossom:   "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-medium text-sm transition-all duration-200 bg-gradient-to-r from-blossom-400 to-blossom-500 text-white shadow-bloom hover:-translate-y-0.5 hover:shadow-lg",
};

const sizeStyles: Record<Size, string> = {
  sm: "!px-3 !py-1.5 !text-xs",
  md: "",
  lg: "!px-7 !py-3.5 !text-base",
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
