import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { NoticesBoard } from "@/components/site/NoticesBoard";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Notice board",
  description:
    "Public notices from Optech Computer Institute of Technology, Deori — exams, holidays, admissions, and campus updates.",
  path: "/notices",
});

export default function NoticesPage() {
  return (
    <>
      <PageHero
        eyebrow="notices_eyebrow"
        title="notices_title"
        titleAccent="notices_title_accent"
        description="notices_desc"
      />
      <NoticesBoard />
    </>
  );
}
