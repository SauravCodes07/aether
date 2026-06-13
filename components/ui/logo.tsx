import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import logoImg from "../../public/logo.png";

type LogoProps = {
  className?: string;
  showIcon?: boolean;
  /** Set to `null` to render without a link (avoids nested anchors). Defaults to `/`. */
  href?: string | null;
};

export function Logo(props: LogoProps) {
  const { className, href = "/" } = props;
  const classes = cn(
    "group inline-flex items-center transition-opacity hover:opacity-90 h-8",
    className,
  );

  if (href === null) {
    return (
      <span className={classes}>
        <Image
          src={logoImg}
          alt={siteConfig.name}
          className="h-full w-auto object-contain"
          priority
        />
      </span>
    );
  }

  return (
    <Link href={href} className={classes} aria-label={`${siteConfig.name} home`}>
      <Image
        src={logoImg}
        alt={siteConfig.name}
        className="h-full w-auto object-contain"
        priority
      />
    </Link>
  );
}
