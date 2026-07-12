"use client";
import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftElement, rightElement, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftElement && (
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none" style={{ color: "var(--text-muted)" }}>
              {leftElement}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "input-base",
              leftElement && "pl-14",
              rightElement && "pr-14",
              error && "border-red-400 focus:border-red-400 focus:shadow-red-100",
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-3 flex items-center" style={{ color: "var(--text-muted)" }}>
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn("input-base resize-none", error && "border-red-400", className)}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
