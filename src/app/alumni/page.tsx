import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { AlumniBoard } from "@/components/site/AlumniBoard";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Alumni",
  description:
    "Alumni of Optech Computer Institute of Technology, Deori — student success stories, batches, and career outcomes.",
  path: "/alumni",
});

export default function AlumniPage() {
  return (
    <>
      <PageHero
        eyebrow="alumni_eyebrow"
        title="alumni_title"
        titleAccent="alumni_title_accent"
        description="alumni_desc"
      />
      <AlumniBoard />
    </>
  );
}
