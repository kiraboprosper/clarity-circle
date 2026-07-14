import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "card p-5 rounded-[24px] border border-white/70 bg-white/70 backdrop-blur-xl",
        hover && "cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-luxury",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("", className)}>{children}</div>;
}
