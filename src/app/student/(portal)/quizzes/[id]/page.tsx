import { QuizRunner } from "@/components/student/QuizRunner";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function QuizPage({ params }: Props) {
  const { id } = await params;
  return <QuizRunner id={id} />;
}
