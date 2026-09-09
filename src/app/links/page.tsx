import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { UsefulLinksGrid } from "@/components/site/UsefulLinksGrid";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Useful links",
  description:
    "Exam portals, result sites, and public resources curated by Optech Computer Institute of Technology, Deori.",
  path: "/links",
});

export default function UsefulLinksPage() {
  return (
    <>
      <PageHero
        eyebrow="links_eyebrow"
        title="links_title"
        titleAccent="links_title_accent"
        description="links_desc"
      />
      <section className="px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-[1400px]">
          <UsefulLinksGrid />
        </div>
      </section>
    </>
  );
}
