import { QuizRunner } from "@/components/student/QuizRunner";
import { QUIZZES } from "@/lib/student-data";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return QUIZZES.map((quiz) => ({ id: quiz.id }));
}

export default async function QuizPage({ params }: Props) {
  const { id } = await params;
  return <QuizRunner id={id} />;
}
