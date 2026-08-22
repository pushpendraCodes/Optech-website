import Link from "next/link";
import { QUIZ_HISTORY, QUIZZES } from "@/lib/student-data";

export const metadata = { title: "Quizzes" };

export default function QuizzesPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <h1 className="font-sans text-3xl font-semibold tracking-tight">Quiz / mock test</h1>
      <p className="mt-2 font-sans text-sm text-zinc-400">
        Timed tests, auto-submit, MCQ / true-false / fill-in. Negative marking where the admin enabled it.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {QUIZZES.map((quiz) => (
          <article key={quiz.id} className="card-surface p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              {quiz.course}
            </p>
            <h2 className="mt-2 font-sans text-xl font-semibold">{quiz.title}</h2>
            <p className="mt-2 font-sans text-sm text-zinc-400">
              {quiz.minutes} min · pass {quiz.passing}%
              {quiz.negative ? " · negative marking" : ""}
            </p>
            {quiz.open ? (
              <Link
                href={`/student/quizzes/${quiz.id}`}
                className="mt-4 inline-block font-mono text-[11px] uppercase tracking-[0.18em] text-accent"
              >
                Start test
              </Link>
            ) : (
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                Scheduled / closed
              </p>
            )}
          </article>
        ))}
      </div>
      <h2 className="mt-10 font-sans text-xl font-semibold">Result history</h2>
      <ul className="mt-4 space-y-2">
        {QUIZ_HISTORY.map((row) => (
          <li key={row.id} className="card-surface flex justify-between px-5 py-3 text-sm">
            <span>
              {row.title} · {row.date}
            </span>
            <span className="text-accent">
              {row.score}% · rank {row.rank}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
