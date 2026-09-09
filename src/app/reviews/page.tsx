import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ReviewsCta } from "@/components/site/ReviewsCta";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Google reviews",
  description:
    "Review Optech Computer Institute of Technology, Deori on Google. Help the next student choose a computer institute in Deori, Maharashtra.",
  path: "/reviews",
  keywords: ["Optech Deori Google reviews", "computer institute Deori reviews"],
});

export default function ReviewsPage() {
  return (
    <>
      <PageHero
        eyebrow="reviews_page_eyebrow"
        title="reviews_page_title"
        titleAccent="reviews_page_title_accent"
        description="reviews_page_desc"
        vars={{ rating: "4.9" }}
      />
      <section className="px-6 py-16 md:px-10">
        <ReviewsCta />
      </section>
    </>
  );
}
