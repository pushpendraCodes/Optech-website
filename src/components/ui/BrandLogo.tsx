"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const FALLBACK_LOGO = "/logo.webp";

type BrandLogoProps = {
  href?: string;
  /** Visual height in px */
  height?: number;
  showWordmark?: boolean;
  wordmark?: string;
  className?: string;
  priority?: boolean;
};

export function BrandLogo({
  href = "/",
  height = 36,
  showWordmark = false,
  wordmark,
  className = "",
  priority = false,
}: BrandLogoProps) {
  const site = useSiteSettings();
  const src = site.logoUrl || FALLBACK_LOGO;
  const label = wordmark || site.name || "Optech Deori";
  // Keep aspect reasonable for a wide institute logo
  const width = Math.round(height * 2.6);

  const inner = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src={src}
        alt={label}
        width={width}
        height={height}
        priority={priority}
        className="h-auto w-auto object-contain"
        style={{ height, width: "auto", maxWidth: width + 24 }}
      />
      {showWordmark ? (
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-foreground">
          {label}
        </span>
      ) : null}
    </span>
  );

  if (!href) return inner;

  return (
    <Link href={href} className="inline-flex items-center" aria-label={label}>
      {inner}
    </Link>
  );
}
