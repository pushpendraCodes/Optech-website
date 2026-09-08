import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ReviewsCta } from "@/components/site/ReviewsCta";

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
        vars={{ rating: "4.9" }}
      />
      <section className="px-6 py-16 md:px-10">
        <ReviewsCta />
      </section>
    </>
  );
}
