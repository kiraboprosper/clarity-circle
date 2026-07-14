import Image from "next/image";
import { cn } from "@/lib/utils/cn";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src: string | null;
  name: string;
  size?: AvatarSize;
  className?: string;
  verified?: boolean;
}

const sizeMap: Record<AvatarSize, { wh: string; text: string; badge: string }> = {
  xs: { wh: "w-6 h-6",   text: "text-xs",  badge: "w-2 h-2 border" },
  sm: { wh: "w-8 h-8",   text: "text-sm",  badge: "w-2.5 h-2.5 border" },
  md: { wh: "w-10 h-10", text: "text-sm",  badge: "w-3 h-3 border-[1.5px]" },
  lg: { wh: "w-14 h-14", text: "text-lg",  badge: "w-4 h-4 border-2" },
  xl: { wh: "w-20 h-20", text: "text-2xl", badge: "w-5 h-5 border-2" },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function getGradient(name: string): string {
  const gradients = [
    "from-lavender-300 to-blossom-300",
    "from-blossom-300 to-lavender-400",
    "from-lavender-400 to-lavender-600",
    "from-blossom-400 to-blossom-600",
    "from-lavender-300 to-lavender-500",
  ];
  const idx = name.charCodeAt(0) % gradients.length;
  return gradients[idx];
}

export function Avatar({ src, name, size = "md", className, verified }: AvatarProps) {
  const { wh, text, badge } = sizeMap[size];
  return (
    <div className={cn("relative flex-shrink-0", wh, className)}>
      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          className="rounded-full object-cover ring-2 ring-white/80 shadow-[0_8px_28px_rgba(142,110,220,0.18)]"
          sizes="80px"
        />
      ) : (
        <div
          className={cn(
            "rounded-full flex items-center justify-center font-semibold text-white bg-gradient-to-br ring-2 ring-white/80 shadow-[0_8px_28px_rgba(142,110,220,0.18)]",
            wh,
            text,
            getGradient(name)
          )}
        >
          {getInitials(name)}
        </div>
      )}
      {verified && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full bg-[linear-gradient(135deg,var(--accent),var(--primary-lavender))] border-2 border-white flex items-center justify-center shadow-lg",
            badge
          )}
        >
          <svg viewBox="0 0 10 10" className="w-full h-full p-0.5" fill="white">
            <path d="M8.5 2.5L4 7.5 1.5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          </svg>
        </span>
      )}
    </div>
  );
}
