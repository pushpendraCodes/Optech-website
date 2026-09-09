import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { CourseCatalog } from "@/components/catalog/CourseCatalog";
import { CoursesCta } from "./CoursesCta";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Computer courses",
  description:
    "Explore computer courses at Optech Computer Institute of Technology, Deori — PGDCA, Tally, typing, web development, and more. Filter by fee, duration, and mode.",
  path: "/courses",
  keywords: ["computer courses Deori", "PGDCA Deori", "Tally course Deori"],
});

export default function CoursesPage() {
  return (
    <>
      <PageHero
        eyebrow="courses_eyebrow"
        title="courses_title"
        titleAccent="courses_title_accent"
        description="courses_desc"
      />
      <CourseCatalog />
      <CoursesCta />
    </>
  );
}
