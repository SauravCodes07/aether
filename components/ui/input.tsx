import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export function Input({ className, error, id, ...props }: InputProps) {
  return (
    <div className="w-full">
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
          className,
        )}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-aether-error">
          {error}
        </p>
      )}
    </div>
  );
}
