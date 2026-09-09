"use client";

import { UsefulLinksGrid } from "@/components/site/UsefulLinksGrid";
import { useI18n } from "@/components/providers/I18nProvider";

export default function StudentLinksPage() {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-[1400px]">
      <h1 className="font-sans text-3xl font-semibold tracking-tight">{t("st_links_title")}</h1>
      <p className="mt-2 font-sans text-sm text-zinc-400">{t("st_links_lead")}</p>
      <div className="mt-6">
        <UsefulLinksGrid emptyKey="st_links_empty" />
      </div>
    </div>
  );
}
