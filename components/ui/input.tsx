import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  suffix?: React.ReactNode;
};

export function Input({ className, error, id, suffix, ...props }: InputProps) {
  return (
    <div className="w-full">
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "h-11 w-full rounded-aether-md border bg-aether-surface/60 px-4 text-sm text-aether-text placeholder:text-aether-text-subtle transition-colors",
            "focus:border-aether-border-focus focus:outline-none focus:ring-2 focus:ring-aether-accent/30",
            error
              ? "border-aether-error/50 focus:ring-aether-error/20"
              : "border-aether-border hover:border-aether-border-strong",
            suffix && "pr-10",
            className,
          )}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center">
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-aether-error">
          {error}
        </p>
      )}
    </div>
  );
}
