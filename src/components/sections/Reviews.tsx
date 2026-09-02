"use client";

import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import { EyebrowBadge } from "@/components/ui/EyebrowBadge";
import { AnimatedItem, AnimatedSection } from "@/components/ui/AnimatedSection";
import { btnPrimary } from "@/components/ui/ui";
import { useI18n } from "@/components/providers/I18nProvider";

export function Reviews() {
  const { t } = useI18n();
  return (
    <section
      id="reviews"
      className="relative border-t border-white/5 bg-background px-6 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-[1400px]">
        <AnimatedSection className="mb-14 flex max-w-[40rem] flex-col gap-5">
          <AnimatedItem>
            <EyebrowBadge>{t("reviews_eyebrow")}</EyebrowBadge>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-sans text-4xl font-semibold leading-[0.98] tracking-tighter text-foreground md:text-5xl">
              {t("reviews_title")}{" "}
              <span className="text-accent">{t("reviews_title_accent")}</span>
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-base leading-relaxed text-zinc-400 md:text-lg">
              {t("reviews_lead")}
            </p>
          </AnimatedItem>
        </AnimatedSection>

        <div className="card-surface mx-auto max-w-xl p-8 text-center">
          <p className="font-sans text-sm leading-relaxed text-zinc-400">
            {t("reviews_page_body")}
          </p>
          <Link href="/reviews" className={`${btnPrimary} mt-6 inline-flex`}>
            {t("reviews_page_cta")}
            <ArrowUpRight size={14} weight="bold" />
          </Link>
        </div>
      </div>
    </section>
  );
}
