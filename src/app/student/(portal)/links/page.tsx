"use client";

import { USEFUL_LINKS } from "@/lib/site-content";
import { ArrowUpRight } from "@phosphor-icons/react";
import { useGetLinksQuery } from "@/lib/api";

export default function LinksPage() {
  const { data } = useGetLinksQuery();
  const links = data?.data?.length
    ? data.data.map((link) => ({
        href: String(link.href ?? "#"),
        title: String(link.title ?? ""),
        description: String(link.body ?? ""),
      }))
    : USEFUL_LINKS;

  return (
    <div className="mx-auto max-w-[1400px]">
      <h1 className="font-sans text-3xl font-semibold tracking-tight">Useful links</h1>
      <p className="mt-2 font-sans text-sm text-zinc-400">Admin-curated exam portals and resources.</p>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="card-surface p-5 transition-colors duration-200 hover:border-white/15"
          >
            <p className="font-sans text-base font-semibold">{link.title}</p>
            <p className="mt-2 font-sans text-sm text-zinc-400">{link.description}</p>
            <span className="mt-3 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
              Open
              <ArrowUpRight size={12} />
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
