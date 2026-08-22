"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { AD_BANNERS } from "@/lib/site-content";
import { useI18n } from "@/components/providers/I18nProvider";

const ROTATE_MS = 6000;

export function HomeAdBanner() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const banner = AD_BANNERS[index];
  const { t } = useI18n();

  useEffect(() => {
    if (paused || AD_BANNERS.length < 2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % AD_BANNERS.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section className="border-t border-white/5 px-6 py-10 md:px-10">
      <div
        className="mx-auto max-w-[1400px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <Link
          href={banner.href}
          className="card-surface flex min-h-[180px] flex-col justify-between gap-6 p-6 transition-colors duration-200 hover:border-white/15 md:min-h-[220px] md:flex-row md:items-center md:p-10"
        >
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
              {t("ad_label")} · {index + 1}/{AD_BANNERS.length}
            </p>
            <h2 className="mt-3 font-sans text-2xl font-semibold tracking-tight text-foreground md:text-4xl">
              {banner.title}
            </h2>
            <p className="mt-3 max-w-[52ch] font-sans text-sm leading-relaxed text-zinc-400 md:text-base">
              {banner.body}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 self-start font-mono text-[11px] uppercase tracking-[0.22em] text-accent md:self-center">
            {banner.cta}
            <ArrowUpRight size={14} weight="bold" />
          </span>
        </Link>
        {AD_BANNERS.length > 1 ? (
          <div className="mt-3 flex justify-center gap-1.5">
            {AD_BANNERS.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Show banner ${i + 1}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className={`h-1.5 cursor-pointer rounded-full transition-all duration-200 ${
                  i === index ? "w-5 bg-accent" : "w-1.5 bg-white/25 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
