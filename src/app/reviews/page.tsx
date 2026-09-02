import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
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
      />
      <section className="px-6 py-16 md:px-10">
        <div className="card-surface mx-auto max-w-xl p-8">
          <p className="font-sans text-sm leading-relaxed text-zinc-400">
            <Tx k="reviews_page_body" />
          </p>
        </div>
      </section>
    </>
  );
}
