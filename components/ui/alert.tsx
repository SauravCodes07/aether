import { cn } from "@/lib/utils";

type AlertVariant = "error" | "success" | "info";

type AlertProps = {
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
};

const variants: Record<AlertVariant, string> = {
  error: "border-aether-error/30 bg-aether-error/10 text-aether-error",
  success: "border-aether-success/30 bg-aether-success/10 text-aether-success",
  info: "border-aether-info/30 bg-aether-info/10 text-aether-info",
};

export function Alert({ variant = "info", children, className }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-aether-md border px-4 py-3 text-sm leading-relaxed",
        variants[variant],
        className,
      )}
    >
      {children}
    </div>
  );
}
