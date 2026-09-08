"use client";

import { ArrowUpRight } from "@phosphor-icons/react";
import { Tx } from "@/components/i18n/Tx";
import { useI18n } from "@/components/providers/I18nProvider";
import { btnPrimary } from "@/components/ui/ui";

/** Opens Google search/maps for the institute listing so visitors can leave a review. */
const GOOGLE_REVIEW_URL =
  "https://search.google.com/local/writereview?placeid=ChIJkXVOL_OTKzoRjOzwf4HFYPo";

export function ReviewsCta() {
  const { t } = useI18n();

  return (
    <div className="card-surface mx-auto flex max-w-xl flex-col gap-6 p-8">
      <p className="font-sans text-sm leading-relaxed text-zinc-400">
        <Tx k="reviews_page_body" />
      </p>
      <a
        href={GOOGLE_REVIEW_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`${btnPrimary} self-start px-6 py-3`}
      >
        {t("reviews_page_cta")}
        <ArrowUpRight size={14} weight="bold" />
      </a>
    </div>
  );
}
