"use client";

import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import { PageHero } from "@/components/ui/PageHero";
import { useI18n } from "@/components/providers/I18nProvider";
import { ABOUT, INSTITUTE, STATS } from "@/lib/optech";
import { STAT_I18N } from "@/lib/i18n";

export function AboutView() {
  const { t } = useI18n();
  return (
    <>
      <PageHero
        eyebrow="about_eyebrow"
        title="about_title"
        titleAccent="about_title_accent"
        rawDescription={ABOUT.story}
        vars={{ year: INSTITUTE.established }}
      />

      <section className="border-b border-white/5 px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-[1400px] gap-10 md:grid-cols-2 md:gap-16">
          <article className="flex flex-col gap-4 border-t border-white/10 pt-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
              {t("about_mission")}
            </span>
            <h2 className="font-sans text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {t("about_mission_h")}
            </h2>
            <p className="font-sans text-base leading-relaxed text-zinc-400">
              {ABOUT.mission}
            </p>
          </article>
          <article className="flex flex-col gap-4 border-t border-white/10 pt-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
              {t("about_vision")}
            </span>
            <h2 className="font-sans text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {t("about_vision_h")}
            </h2>
            <p className="font-sans text-base leading-relaxed text-zinc-400">
              {ABOUT.vision}
            </p>
          </article>
        </div>
      </section>

      <section className="border-b border-white/5 px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-12 max-w-[36rem]">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
              {t("about_legacy")}
            </span>
            <h2 className="mt-4 font-sans text-3xl font-semibold leading-[0.98] tracking-tighter text-foreground md:text-4xl">
              {t("about_trusted")}{" "}
              <span className="text-accent">{t("about_trusted_accent")}</span>
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat) => {
              const keys = STAT_I18N[stat.label];
              return (
                <article key={stat.label} className="card-surface flex flex-col gap-2 p-6">
                  <span className="font-sans text-3xl font-semibold tracking-tight text-foreground">
                    {stat.value}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
                    {keys ? t(keys.label) : stat.label}
                  </span>
                  <span className="font-sans text-sm text-zinc-400">
                    {keys ? t(keys.note) : stat.note}
                  </span>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-12 max-w-[36rem]">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
              {t("about_apart")}
            </span>
            <h2 className="mt-4 font-sans text-3xl font-semibold leading-[0.98] tracking-tighter text-foreground md:text-4xl">
              {t("about_outcomes")}{" "}
              <span className="text-accent">{t("about_outcomes_accent")}</span>
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {ABOUT.highlights.map((item, i) => (
              <article key={item.title} className="flex flex-col gap-3 border-t border-white/10 pt-6">
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-sans text-xl font-semibold tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="font-sans text-sm leading-relaxed text-zinc-400">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 px-6 py-16 md:px-10 md:py-20">
        <div className="card-surface mx-auto flex max-w-[1400px] flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-10">
          <div className="max-w-[36rem]">
            <h2 className="font-sans text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {t("about_visit")}
            </h2>
            <p className="mt-3 font-sans text-sm leading-relaxed text-zinc-400 md:text-base">
              {INSTITUTE.address} · {INSTITUTE.hours}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/staff"
              className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-foreground transition-all duration-200 hover:bg-white/[0.08]"
            >
              {t("about_staff")}
              <ArrowUpRight size={14} weight="bold" />
            </Link>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-5 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-accent transition-all duration-200 hover:bg-accent/25"
            >
              {t("about_contact")}
              <ArrowUpRight size={14} weight="bold" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
