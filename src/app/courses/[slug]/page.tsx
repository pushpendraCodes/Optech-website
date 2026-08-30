import type { Metadata } from "next";
import { COURSES, getCourse } from "@/lib/catalog";
import { CourseDetailView } from "@/components/catalog/CourseDetailView";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return COURSES.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
  return {
    title: course ? course.title : "Course",
    description: course?.body,
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  return <CourseDetailView slug={slug} />;
}
