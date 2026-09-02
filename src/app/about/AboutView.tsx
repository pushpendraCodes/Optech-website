"use client";

import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import { PageHero } from "@/components/ui/PageHero";
import { useI18n } from "@/components/providers/I18nProvider";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export function AboutView() {
  const { t } = useI18n();
  const site = useSiteSettings();

  return (
    <>
      <PageHero
        eyebrow="about_eyebrow"
        title="about_title"
        titleAccent="about_title_accent"
        description="about_story"
        vars={{ year: "1994" }}
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
              {t("about_mission_body")}
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
              {t("about_vision_body")}
            </p>
          </article>
        </div>
      </section>

      <section className="border-t border-white/5 px-6 py-16 md:px-10 md:py-20">
        <div className="card-surface mx-auto flex max-w-[1400px] flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-10">
          <div className="max-w-[36rem]">
            <h2 className="font-sans text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {t("about_visit")}
            </h2>
            <p className="mt-3 font-sans text-sm leading-relaxed text-zinc-400 md:text-base">
              {site.address || "—"}
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
