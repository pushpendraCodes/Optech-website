"use client";

import { EyebrowBadge } from "@/components/ui/EyebrowBadge";
import { AnimatedItem, AnimatedSection } from "@/components/ui/AnimatedSection";
import { PILLARS } from "@/lib/optech";
import { useI18n } from "@/components/providers/I18nProvider";

export function WhyChooseUs() {
  const { t } = useI18n();
  return (
    <section
      id="why-us"
      className="relative border-t border-white/5 bg-background px-6 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-[1400px]">
        <AnimatedSection className="mb-14 flex max-w-[40rem] flex-col gap-5">
          <AnimatedItem>
            <EyebrowBadge>{t("why_eyebrow")}</EyebrowBadge>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-sans text-4xl font-semibold leading-[0.98] tracking-tighter text-foreground md:text-5xl">
              {t("why_title")}{" "}
              <span className="text-accent">{t("why_title_accent")}</span>
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-base leading-relaxed text-zinc-400 md:text-lg">
              {t("why_lead")}
            </p>
          </AnimatedItem>
        </AnimatedSection>

        <AnimatedSection className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((pillar, i) => (
            <AnimatedItem key={pillar.title}>
              <article className="flex flex-col gap-3 border-t border-white/10 pt-6">
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-sans text-xl font-semibold tracking-tight text-foreground">
                  {pillar.title}
                </h3>
                <p className="font-sans text-sm leading-relaxed text-zinc-400">
                  {pillar.body}
                </p>
              </article>
            </AnimatedItem>
          ))}
        </AnimatedSection>
      </div>
    </section>
  );
}
