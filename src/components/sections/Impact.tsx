"use client";

import { ArrowUpRight } from "@phosphor-icons/react";
import { EyebrowBadge } from "@/components/ui/EyebrowBadge";
import { AnimatedItem, AnimatedSection } from "@/components/ui/AnimatedSection";
import { useI18n } from "@/components/providers/I18nProvider";

export function Impact() {
  const { t } = useI18n();
  return (
    <section
      id="impact"
      className="relative border-t border-white/5 bg-background px-6 pb-28 pt-24 md:px-10 md:pb-40 md:pt-32"
    >
      <div className="mx-auto max-w-[1400px]">
        <AnimatedSection className="flex max-w-[48rem] flex-col gap-8">
          <AnimatedItem>
            <EyebrowBadge>{t("impact_eyebrow", { year: "1994" })}</EyebrowBadge>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="max-w-[16ch] font-sans text-4xl font-semibold leading-[0.98] tracking-tighter text-foreground md:text-6xl">
              {t("impact_title")}{" "}
              <span className="text-accent">{t("impact_title_accent")}</span>
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="max-w-[48ch] font-sans text-base leading-relaxed text-zinc-400 md:text-lg">
              {t("impact_body")}
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <a
              href="/courses"
              className="group inline-flex items-center gap-2 self-start rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-foreground backdrop-blur-md transition-all duration-200 hover:bg-white/[0.08] active:translate-y-[1px]"
            >
              {t("impact_cta")}
              <ArrowUpRight
                size={14}
                weight="bold"
                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </AnimatedItem>
        </AnimatedSection>
      </div>
    </section>
  );
}
