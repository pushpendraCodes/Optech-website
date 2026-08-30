import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { AlumniBoard } from "@/components/site/AlumniBoard";

export const metadata: Metadata = {
  title: "Alumni",
  description: "Optech Deori alumni directory and featured success stories.",
};

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
