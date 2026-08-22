"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { QUIZZES } from "@/lib/student-data";
import { btnPrimary, fieldClass } from "@/components/ui/ui";

export function QuizRunner({ id }: { id: string }) {
  const quiz = useMemo(() => QUIZZES.find((q) => q.id === id), [id]);
  const [seconds, setSeconds] = useState((quiz?.minutes ?? 1) * 60);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!quiz || done) return;
    const t = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          window.clearInterval(t);
          setDone(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [quiz, done]);

  if (!quiz) {
    return <p className="text-zinc-400">Test not found.</p>;
  }

  const grade = () => {
    let score = 0;
    quiz.questions.forEach((q) => {
      const raw = (answers[q.id] ?? "").trim().toLowerCase();
      if (q.type === "blank") {
        if (raw === q.options[0].toLowerCase()) score += 1;
        else if (quiz.negative && raw) score -= 0.25;
      } else {
        const idx = Number(raw);
        if (idx === q.answer) score += 1;
        else if (quiz.negative && raw !== "") score -= 0.25;
      }
    });
    return Math.max(0, Math.round((score / quiz.questions.length) * 100));
  };

  if (done) {
    const pct = grade();
    return (
      <div className="card-surface mx-auto max-w-xl p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
          Auto-scored
        </p>
        <h1 className="mt-2 font-sans text-3xl font-semibold">{pct}%</h1>
        <p className="mt-2 font-sans text-sm text-zinc-400">
          Passing mark {quiz.passing}%. Correct answers shown below.
        </p>
        <ol className="mt-6 space-y-3 font-sans text-sm">
          {quiz.questions.map((q, i) => (
            <li key={q.id}>
              {i + 1}. {q.q}
              <span className="mt-1 block text-accent">
                Answer: {q.type === "blank" ? q.options[0] : q.options[q.answer]}
              </span>
            </li>
          ))}
        </ol>
        <Link href="/student/quizzes" className={`${btnPrimary} mt-6`}>
          Back to quizzes
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-sans text-2xl font-semibold">{quiz.title}</h1>
        <span className="font-mono text-sm text-accent">
          {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
        </span>
      </div>
      <div className="space-y-4">
        {quiz.questions.map((q, i) => (
          <fieldset key={q.id} className="card-surface p-5">
            <legend className="font-sans text-sm font-medium">
              {i + 1}. {q.q}
            </legend>
            {q.type === "blank" ? (
              <input
                className={`${fieldClass} mt-3`}
                value={answers[q.id] ?? ""}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                }
              />
            ) : (
              <div className="mt-3 space-y-2">
                {q.options.map((opt, idx) => (
                  <label key={opt} className="flex cursor-pointer gap-2 text-sm">
                    <input
                      type="radio"
                      name={q.id}
                      onChange={() =>
                        setAnswers((prev) => ({ ...prev, [q.id]: String(idx) }))
                      }
                      className="accent-[#d4a22f]"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}
          </fieldset>
        ))}
      </div>
      <button type="button" className={`${btnPrimary} mt-6`} onClick={() => setDone(true)}>
        Submit now
      </button>
    </div>
  );
}
