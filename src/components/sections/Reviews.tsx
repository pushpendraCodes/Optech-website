"use client";

import { EyebrowBadge } from "@/components/ui/EyebrowBadge";
import { AnimatedItem, AnimatedSection } from "@/components/ui/AnimatedSection";
import { REVIEWS } from "@/lib/optech";
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

        <AnimatedSection className="grid gap-6 md:grid-cols-2">
          {REVIEWS.map((review) => (
            <AnimatedItem key={review.name}>
              <figure className="card-surface flex h-full flex-col gap-6 p-7 md:p-8">
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
                  ★★★★★
                </span>
                <blockquote className="flex-1 font-sans text-lg font-medium leading-snug tracking-tight text-foreground md:text-xl">
                  &ldquo;{review.quote}&rdquo;
                </blockquote>
                <figcaption className="flex items-center justify-between border-t border-white/8 pt-5">
                  <span className="font-sans text-sm text-zinc-300">
                    {review.name}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                    {review.role}
                  </span>
                </figcaption>
              </figure>
            </AnimatedItem>
          ))}
        </AnimatedSection>
      </div>
    </section>
  );
}
