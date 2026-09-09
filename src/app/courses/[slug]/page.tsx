import type { Metadata } from "next";
import { CourseDetailView } from "@/components/catalog/CourseDetailView";
import { loc } from "@/lib/loc";
import { fetchPublicCourse } from "@/lib/public-api";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await fetchPublicCourse(slug);
  const title = loc(course?.title) || "Course";
  const raw = loc(course?.description);
  const description = raw
    ? raw.slice(0, 155)
    : `${title} at Optech Computer Institute of Technology, Deori — fees, syllabus, batches, and enrollment.`;

  return pageMeta({
    title,
    description,
    path: `/courses/${slug}`,
    keywords: [title, `${title} Deori`, `${title} Optech`],
    image: course?.thumbnail?.url,
  });
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  return <CourseDetailView slug={slug} />;
}
