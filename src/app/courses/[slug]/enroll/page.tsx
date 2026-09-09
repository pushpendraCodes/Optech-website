import type { Metadata } from "next";
import { Suspense } from "react";
import { EnrollFlow } from "@/components/catalog/EnrollFlow";
import { loc } from "@/lib/loc";
import { fetchPublicCourse } from "@/lib/public-api";
import { pageMeta } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await fetchPublicCourse(slug);
  const title = loc(course?.title) || "Course";
  return pageMeta({
    title: `Enroll — ${title}`,
    description: `Enroll in ${title} at Optech Computer Institute of Technology, Deori. Online admission and fee payment.`,
    path: `/courses/${slug}/enroll`,
    keywords: [`${title} admission Deori`, `enroll ${title} Optech`],
  });
}

export default async function EnrollPage({ params }: Props) {
  const { slug } = await params;
  return (
    <Suspense>
      <EnrollFlow slug={slug} />
    </Suspense>
  );
}
