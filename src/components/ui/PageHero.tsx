"use client";

import type { ReactNode } from "react";
import { EyebrowBadge } from "@/components/ui/EyebrowBadge";
import { useI18n } from "@/components/providers/I18nProvider";
import type { MessageKey } from "@/lib/i18n";

type Props = {
  eyebrow?: MessageKey;
  title?: MessageKey;
  titleAccent?: MessageKey;
  description?: MessageKey;
  rawEyebrow?: string;
  rawTitle?: ReactNode;
  rawDescription?: string;
  vars?: Record<string, string | number>;
};

export function PageHero({
  eyebrow,
  title,
  titleAccent,
  description,
  rawEyebrow,
  rawTitle,
  rawDescription,
  vars,
}: Props) {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden border-b border-white/5 px-6 pb-16 pt-40 md:px-10 md:pb-20 md:pt-48">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 60% at 10% 0%, rgba(212,162,47,0.12) 0%, transparent 55%), radial-gradient(70% 50% at 90% 20%, rgba(255,255,255,0.04) 0%, transparent 50%)",
        }}
      />
      <div className="relative mx-auto flex max-w-[1400px] flex-col gap-5">
        <EyebrowBadge>{rawEyebrow ?? (eyebrow ? t(eyebrow, vars) : "")}</EyebrowBadge>
        <h1 className="max-w-[16ch] font-sans text-4xl font-semibold leading-[0.98] tracking-tighter text-foreground md:text-6xl lg:text-7xl">
          {rawTitle ?? (
            <>
              {title ? t(title, vars) : ""}{" "}
              {titleAccent ? <span className="text-accent">{t(titleAccent, vars)}</span> : null}
            </>
          )}
        </h1>
        {rawDescription || description ? (
          <p className="max-w-[52ch] font-sans text-base leading-relaxed text-zinc-400 md:text-lg">
            {rawDescription ?? (description ? t(description, vars) : null)}
          </p>
        ) : null}
      </div>
    </section>
  );
}
