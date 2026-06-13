import { cn } from "@/lib/utils";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
};

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-aether-border bg-aether-surface/50 p-6",
        hover &&
          "transition-colors duration-200 hover:border-aether-border-strong hover:bg-aether-surface",
        className,
      )}
    >
      {children}
    </div>
  );
}
