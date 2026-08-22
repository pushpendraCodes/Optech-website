"use client";

import Link from "next/link";
import { MARQUEE_ITEMS } from "@/lib/site-content";

export function MarqueeBar() {
  const loop = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div className="overflow-hidden border-b border-white/8 bg-black/55 backdrop-blur-xl">
      <div className="marquee-track flex w-max gap-10 py-2">
        {loop.map((item, i) => (
          <Link
            key={`${item.id}-${i}`}
            href={item.href}
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent/90 transition-colors duration-200 hover:text-accent"
          >
            {item.text}
            <span className="mx-4 text-zinc-600">/</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
