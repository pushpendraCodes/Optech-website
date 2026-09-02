import type { Metadata } from "next";
import { CourseDetailView } from "@/components/catalog/CourseDetailView";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export const metadata: Metadata = {
  title: "Course",
  description: "Course details at Optech Computer Institute, Deori.",
};

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  return <CourseDetailView slug={slug} />;
}
