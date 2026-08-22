"use client";

import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import { EyebrowBadge } from "@/components/ui/EyebrowBadge";
import { AnimatedItem, AnimatedSection } from "@/components/ui/AnimatedSection";
import { useI18n } from "@/components/providers/I18nProvider";

export function HomeCta() {
  const { t } = useI18n();
  return (
    <section className="relative border-t border-white/5 bg-background px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        <AnimatedSection>
          <AnimatedItem>
            <div className="card-surface flex flex-col gap-8 p-8 md:flex-row md:items-center md:justify-between md:p-12">
              <div className="flex max-w-[40rem] flex-col gap-4">
                <EyebrowBadge>{t("cta_eyebrow")}</EyebrowBadge>
                <h2 className="font-sans text-3xl font-semibold leading-[0.98] tracking-tighter text-foreground md:text-5xl">
                  {t("cta_title")}{" "}
                  <span className="text-accent">{t("cta_title_accent")}</span>
                </h2>
                <p className="font-sans text-base leading-relaxed text-zinc-400">
                  {t("cta_lead")}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/courses"
                  className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-foreground transition-all duration-200 hover:bg-white/[0.08]"
                >
                  {t("cta_courses")}
                  <ArrowUpRight size={14} weight="bold" />
                </Link>
                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-5 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-accent transition-all duration-200 hover:bg-accent/25"
                >
                  {t("cta_form")}
                  <ArrowUpRight size={14} weight="bold" />
                </Link>
              </div>
            </div>
          </AnimatedItem>
        </AnimatedSection>
      </div>
    </section>
  );
}
