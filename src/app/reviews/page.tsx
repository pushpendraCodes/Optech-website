import type { Metadata } from "next";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { PageHero } from "@/components/ui/PageHero";
import { GOOGLE_REVIEW_URL } from "@/lib/site-content";
import { INSTITUTE } from "@/lib/optech";
import { btnPrimary } from "@/components/ui/ui";
import { Tx } from "@/components/i18n/Tx";

export const metadata: Metadata = {
  title: "Google Reviews",
  description: "Leave a Google review for Optech Computer Institute, Deori.",
};

export default function ReviewsPage() {
  return (
    <>
      <PageHero
        eyebrow="reviews_page_eyebrow"
        title="reviews_page_title"
        titleAccent="reviews_page_title_accent"
        description="reviews_page_desc"
        vars={{ rating: INSTITUTE.rating }}
      />
      <section className="px-6 py-16 md:px-10">
        <div className="card-surface mx-auto max-w-xl p-8">
          <p className="font-sans text-sm leading-relaxed text-zinc-400">
            <Tx k="reviews_page_body" />
          </p>
          <a
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btnPrimary} mt-6`}
          >
            <Tx k="reviews_page_cta" />
            <ArrowUpRight size={14} weight="bold" />
          </a>
        </div>
      </section>
    </>
  );
}
