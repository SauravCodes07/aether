import { cn } from "@/lib/utils";

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, children, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "mb-2 block text-sm font-medium text-aether-text",
        className,
      )}
      {...props}
    >
      {children}
    </label>
  );
}
