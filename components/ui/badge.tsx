import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "accent" | "cyan";
  className?: string;
};

const variants = {
  default: "bg-aether-surface border-aether-border text-aether-text-muted",
  accent:
    "bg-aether-accent/10 border-aether-accent/20 text-aether-accent-light",
  cyan: "bg-aether-cyan/10 border-aether-cyan/20 text-aether-cyan",
};

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
