import { ExamRunner } from "@/components/student/ExamRunner";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function ExamPage({ params }: Props) {
  const { id } = await params;
  return <ExamRunner id={id} />;
}
