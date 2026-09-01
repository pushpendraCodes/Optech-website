"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { useI18n } from "@/components/providers/I18nProvider";
import { useGetAdsQuery } from "@/lib/api";

const ROTATE_MS = 6000;

export function HomeAdBanner() {
  const { data } = useGetAdsQuery();
  const banners = useMemo(() => {
    const rows = (data?.data ?? []).filter((item) => item.slot === "home-between" || !item.slot);
    return rows.map((item) => ({
      id: item._id,
      title: item.title,
      body: item.body ?? "",
      href: item.href || "/courses",
      cta: item.cta || "View",
      image: item.image?.url ?? "",
    }));
  }, [data]);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const banner = banners[index] ?? banners[0];
  const { t } = useI18n();

  useEffect(() => {
    if (paused || banners.length < 2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [paused, banners.length]);

  if (!banner) return null;

  return (
    <section className="border-t border-white/5 px-6 py-10 md:px-10">
      <div
        className="mx-auto max-w-[1400px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <Link
          href={banner.href}
          className="card-surface group flex min-h-[180px] flex-col overflow-hidden p-0 transition-colors duration-200 hover:border-white/15 md:min-h-[240px] md:flex-row"
        >
          {banner.image ? (
            <div className="relative aspect-[12/5] w-full shrink-0 bg-zinc-950 md:aspect-auto md:min-h-[240px] md:w-[42%]">
              <Image
                src={banner.image}
                alt=""
                fill
                sizes="(min-width: 768px) 42vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
          ) : null}
          <div className="flex flex-1 flex-col justify-between gap-6 p-6 md:p-10">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
                {t("ad_label")} · {index + 1}/{banners.length}
              </p>
              <h2 className="mt-3 font-sans text-2xl font-semibold tracking-tight text-foreground md:text-4xl">
                {banner.title}
              </h2>
              <p className="mt-3 max-w-[52ch] font-sans text-sm leading-relaxed text-zinc-400 md:text-base">
                {banner.body}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 self-start font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
              {banner.cta}
              <ArrowUpRight size={14} weight="bold" />
            </span>
          </div>
        </Link>
        {banners.length > 1 ? (
          <div className="mt-3 flex justify-center gap-1.5">
            {banners.map((item, i) => (
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
