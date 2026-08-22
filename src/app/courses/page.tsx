import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { CourseCatalog } from "@/components/catalog/CourseCatalog";
import { CoursesCta } from "./CoursesCta";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Explore industry-recognized courses at Optech Deori — filter by category, duration, fee, and mode. Enroll online or at campus.",
};

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
