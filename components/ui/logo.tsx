import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

type LogoProps = {
  className?: string;
  showIcon?: boolean;
  /** Set to `null` to render without a link (avoids nested anchors). Defaults to `/`. */
  href?: string | null;
};

function LogoContent({ showIcon = true }: Pick<LogoProps, "showIcon">) {
  return (
    <>
      {showIcon && (
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-aether-border-strong bg-aether-surface"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4 text-aether-accent"
          >
            <path
              d="M12 2L4 8v8l8 6 8-6V8L12 2z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M12 8v8M8 10l4 2 4-2"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
      )}
      <span className="text-base sm:text-lg">{siteConfig.name}</span>
    </>
  );
}

export function Logo({
  className,
  showIcon = true,
  href = "/",
}: LogoProps) {
  const classes = cn(
    "group inline-flex items-center gap-2.5 font-semibold tracking-tight text-aether-text transition-opacity hover:opacity-90",
    className,
  );

  if (href === null) {
    return (
      <span className={classes}>
        <LogoContent showIcon={showIcon} />
      </span>
    );
  }

  return (
    <Link href={href} className={classes} aria-label={`${siteConfig.name} home`}>
      <LogoContent showIcon={showIcon} />
    </Link>
  );
}
