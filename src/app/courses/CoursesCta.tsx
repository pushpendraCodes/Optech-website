"use client";

import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import { useI18n } from "@/components/providers/I18nProvider";

export function CoursesCta() {
  const { t } = useI18n();
  return (
    <section className="border-t border-white/5 px-6 py-16 md:px-10 md:py-20">
      <div className="card-surface mx-auto flex max-w-[1400px] flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-10">
        <div className="max-w-[36rem]">
          <h2 className="font-sans text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            {t("courses_fee_cta_title")}
          </h2>
          <p className="mt-3 font-sans text-sm leading-relaxed text-zinc-400 md:text-base">
            {t("courses_fee_cta_body")}
          </p>
        </div>
        <Link
          href="/calculator"
          className="group inline-flex items-center gap-2 self-start rounded-full border border-accent/40 bg-accent/15 px-5 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-accent transition-all duration-200 hover:bg-accent/25"
        >
          {t("courses_fee_cta")}
          <ArrowUpRight size={14} weight="bold" />
        </Link>
      </div>
    </section>
  );
}
