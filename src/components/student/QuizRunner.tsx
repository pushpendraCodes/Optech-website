"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { QUIZZES } from "@/lib/student-data";
import { btnPrimary, btnGhost, fieldClass } from "@/components/ui/ui";
import { useStartQuizMutation, useSubmitQuizMutation } from "@/lib/api";

type LiveQuestion = { id: string; type: "mcq" | "tf" | "blank"; q: string; options: string[]; marks?: number };

type SubmitResult = {
  score?: number;
  max?: number;
  percent?: number;
  correct?: number;
  wrong?: number;
  skipped?: number;
  timeTakenSeconds?: number;
  passing?: number;
  passed?: boolean;
  negative?: boolean;
};

export function QuizRunner({ id }: { id: string }) {
  const fallback = useMemo(() => QUIZZES.find((q) => q.id === id), [id]);
  const [startQuiz] = useStartQuizMutation();
  const [submitQuiz, submitState] = useSubmitQuizMutation();
  const [live, setLive] = useState<{
    attemptId?: string;
    title: string;
    minutes: number;
    passing: number;
    negative: boolean;
    totalMarks?: number;
    questions: LiveQuestion[];
  } | null>(null);
  const [seconds, setSeconds] = useState((fallback?.minutes ?? 1) * 60);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void startQuiz(id)
      .unwrap()
      .then((body) => {
        if (cancelled) return;
        const quiz = body.data.quiz as {
          title?: string;
          minutes?: number;
          passing?: number;
          negative?: boolean;
          totalMarks?: number;
          questions?: { id: string; type: LiveQuestion["type"]; prompt: string; options: string[]; marks?: number }[];
        };
        const attempt = body.data.attempt as { _id?: string; startedAt?: string } | undefined;
        const mapped = {
          attemptId: attempt?._id,
          title: quiz.title || fallback?.title || "Quiz",
          minutes: Number(quiz.minutes ?? fallback?.minutes ?? 1),
          passing: Number(quiz.passing ?? fallback?.passing ?? 0),
          negative: Boolean(quiz.negative ?? fallback?.negative),
          totalMarks: Number(quiz.totalMarks ?? 0),
          questions: (quiz.questions ?? []).map((q) => ({
            id: q.id,
            type: q.type,
            q: q.prompt,
            options: q.options,
            marks: q.marks,
          })),
        };
        setLive(mapped);
        setSeconds(mapped.minutes * 60);
        setStartedAt(attempt?.startedAt ? new Date(attempt.startedAt).getTime() : Date.now());
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [fallback?.minutes, fallback?.negative, fallback?.passing, fallback?.title, id, startQuiz]);

  const quiz = live?.questions.length
    ? live
    : fallback
      ? {
          title: fallback.title,
          minutes: fallback.minutes,
          passing: fallback.passing,
          negative: fallback.negative,
          totalMarks: fallback.questions.length,
          questions: fallback.questions.map((q) => ({ ...q, q: q.q, marks: 1 })),
        }
      : null;

  const submit = useCallback(async () => {
    if (!live?.attemptId || !quiz) return;
    const payload = quiz.questions.map((q, index) => ({
      index,
      value: q.type === "blank" ? answers[q.id] ?? "" : Number(answers[q.id] ?? -1),
    }));
    try {
      const body = await submitQuiz({ id: live.attemptId, answers: payload }).unwrap();
      setResult(body.data as SubmitResult);
    } catch {
      setResult(null);
    }
  }, [answers, live?.attemptId, quiz, submitQuiz]);

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

  useEffect(() => {
    if (!done || !live?.attemptId) return;
    void submit();
  }, [done, live?.attemptId, submit]);

  if (!quiz) {
    return <p className="text-zinc-400">Test not found.</p>;
  }

  const formatTime = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

  if (done) {
    const pct = result?.percent ?? 0;
    const timeTaken =
      result?.timeTakenSeconds ??
      (startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0);
    return (
      <div className="card-surface mx-auto max-w-xl p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Result</p>
        <h1 className="mt-2 font-sans text-3xl font-semibold">{pct}%</h1>
        <p className="mt-1 font-sans text-sm text-zinc-400">
          {result?.passed ? "Passed" : "Not passed"} · passing {result?.passing ?? quiz.passing}%
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
          <div><dt className="text-zinc-500">Score</dt><dd>{result?.score ?? "—"} / {result?.max ?? quiz.totalMarks ?? "—"}</dd></div>
          <div><dt className="text-zinc-500">Correct</dt><dd>{result?.correct ?? "—"}</dd></div>
          <div><dt className="text-zinc-500">Wrong</dt><dd>{result?.wrong ?? "—"}</dd></div>
          <div><dt className="text-zinc-500">Skipped</dt><dd>{result?.skipped ?? "—"}</dd></div>
          <div><dt className="text-zinc-500">Time taken</dt><dd>{formatTime(timeTaken)}</dd></div>
          <div><dt className="text-zinc-500">Negative marking</dt><dd>{result?.negative || quiz.negative ? "Yes" : "No"}</dd></div>
        </dl>
        {submitState.isLoading ? <p className="mt-4 text-sm text-zinc-500">Calculating score…</p> : null}
        <Link href="/student/quizzes" className={`${btnPrimary} mt-6 inline-block`}>
          Back to quizzes
        </Link>
      </div>
    );
  }

  const q = quiz.questions[current];
  const answeredCount = quiz.questions.filter((item) => answers[item.id] != null && answers[item.id] !== "").length;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-sans text-2xl font-semibold">{quiz.title}</h1>
          <p className="mt-1 font-sans text-sm text-zinc-400">
            {quiz.questions.length} questions · {quiz.totalMarks ?? "—"} marks · {answeredCount} answered
          </p>
        </div>
        <span className="font-mono text-lg text-accent">{formatTime(seconds)}</span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {quiz.questions.map((item, i) => {
          const answered = answers[item.id] != null && answers[item.id] !== "";
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrent(i)}
              className={`h-9 w-9 rounded-full border font-mono text-xs ${
                i === current
                  ? "border-accent bg-accent/20 text-accent"
                  : answered
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                    : "border-white/12 bg-white/5 text-zinc-400"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <fieldset className="card-surface p-5">
        <legend className="font-sans text-sm font-medium">
          Q{current + 1}. {q.q}
          {q.marks != null ? <span className="ml-2 text-zinc-500">({q.marks} mark{q.marks === 1 ? "" : "s"})</span> : null}
        </legend>
        {q.type === "blank" ? (
          <input
            className={`${fieldClass} mt-3`}
            value={answers[q.id] ?? ""}
            onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
          />
        ) : (
          <div className="mt-3 space-y-2">
            {q.options.map((opt, idx) => (
              <label key={opt} className="flex cursor-pointer gap-2 text-sm">
                <input
                  type="radio"
                  name={q.id}
                  checked={answers[q.id] === String(idx)}
                  onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: String(idx) }))}
                  className="accent-[#d4a22f]"
                />
                {opt}
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <div className="mt-6 flex flex-wrap justify-between gap-3">
        <button
          type="button"
          className={btnGhost}
          disabled={current === 0}
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
        >
          Previous
        </button>
        {current < quiz.questions.length - 1 ? (
          <button type="button" className={btnPrimary} onClick={() => setCurrent((c) => c + 1)}>
            Next
          </button>
        ) : (
          <button type="button" className={btnPrimary} onClick={() => setDone(true)}>
            Submit test
          </button>
        )}
      </div>
    </div>
  );
}
