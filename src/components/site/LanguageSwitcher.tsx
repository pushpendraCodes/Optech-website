"use client";

import { LOCALES, useI18n } from "@/components/providers/I18nProvider";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t("lang_label")}
      className={`inline-flex rounded-full border border-white/12 bg-white/[0.04] p-0.5 ${
        compact ? "" : ""
      }`}
    >
      {LOCALES.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-pressed={locale === item.id}
          onClick={() => setLocale(item.id)}
          className={`cursor-pointer rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors duration-200 ${
            locale === item.id
              ? "bg-accent/20 text-accent"
              : "text-zinc-400 hover:text-foreground"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
