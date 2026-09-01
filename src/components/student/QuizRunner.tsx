"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Clock, XCircle } from "@phosphor-icons/react";
import { Tx } from "@/components/i18n/Tx";
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

function formatTime(sec: number) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

function ScoreRing({ value, size = 120 }: { value: number; size?: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-sans text-3xl font-semibold text-accent">
        {pct}%
      </span>
    </div>
  );
}

export function QuizRunner({ id }: { id: string }) {
  const [startQuiz, startState] = useStartQuizMutation();
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
  const [seconds, setSeconds] = useState(60);
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
          title: quiz.title || "Quiz",
          minutes: Number(quiz.minutes ?? 1),
          passing: Number(quiz.passing ?? 0),
          negative: Boolean(quiz.negative),
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
  }, [id, startQuiz]);

  const quiz = live?.questions.length ? live : null;

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

  if (startState.isLoading && !quiz) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="h-48 animate-pulse rounded-3xl border border-white/10 bg-white/3" />
        <p className="mt-4 text-center text-sm text-zinc-500">Starting test…</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="card-surface mx-auto max-w-xl p-8 text-center">
        <p className="text-zinc-400">
          <Tx k="st_quiz_missing" />
        </p>
        <Link href="/student/quizzes" className={`${btnGhost} mt-4 inline-flex`}>
          <ArrowLeft size={14} aria-hidden />
          <Tx k="st_quiz_back" />
        </Link>
      </div>
    );
  }

  const totalSeconds = quiz.minutes * 60;
  const timePct = totalSeconds > 0 ? (seconds / totalSeconds) * 100 : 0;
  const answeredCount = quiz.questions.filter((item) => answers[item.id] != null && answers[item.id] !== "").length;

  if (done) {
    const pct = result?.percent ?? 0;
    const passed = result?.passed ?? pct >= quiz.passing;
    const timeTaken =
      result?.timeTakenSeconds ?? (startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0);

    return (
      <div className="mx-auto max-w-xl">
        <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-6 md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,162,47,0.12),transparent_55%)]" />
          <div className="relative text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              <Tx k="st_quiz_scored" />
            </p>
            <h1 className="mt-2 font-sans text-xl font-semibold">{quiz.title}</h1>
            <div className="mt-6">
              <ScoreRing value={pct} />
            </div>
            <span
              className={`mt-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${
                passed
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-red-500/30 bg-red-500/10 text-red-300"
              }`}
            >
              {passed ? <CheckCircle size={12} aria-hidden /> : <XCircle size={12} aria-hidden />}
              {passed ? "Passed" : "Not passed"} · need {result?.passing ?? quiz.passing}%
            </span>
          </div>

          <dl className="relative mt-8 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-white/8 bg-white/3 p-3">
              <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">Score</dt>
              <dd className="mt-1 font-semibold">
                {result?.score ?? "—"} / {result?.max ?? quiz.totalMarks ?? "—"}
              </dd>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-3">
              <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">Time</dt>
              <dd className="mt-1 font-semibold">{formatTime(timeTaken)}</dd>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-3">
              <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">Correct</dt>
              <dd className="mt-1 font-semibold text-emerald-300">{result?.correct ?? "—"}</dd>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-3">
              <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">Wrong</dt>
              <dd className="mt-1 font-semibold text-red-300">{result?.wrong ?? "—"}</dd>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-3">
              <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">Skipped</dt>
              <dd className="mt-1 font-semibold">{result?.skipped ?? "—"}</dd>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-3">
              <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">Negative</dt>
              <dd className="mt-1 font-semibold">{result?.negative || quiz.negative ? "Yes" : "No"}</dd>
            </div>
          </dl>

          {submitState.isLoading ? <p className="relative mt-4 text-center text-sm text-zinc-500">Calculating score…</p> : null}

          <Link href="/student/quizzes" className={`${btnPrimary} relative mt-6 inline-flex w-full justify-center`}>
            <Tx k="st_quiz_back" />
          </Link>
        </article>
      </div>
    );
  }

  const q = quiz.questions[current];

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/student/quizzes"
        className="mb-4 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500 transition hover:text-accent"
      >
        <ArrowLeft size={12} aria-hidden />
        <Tx k="st_quiz_back" />
      </Link>

      <article className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
        <div className="border-b border-white/8 px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-sans text-xl font-semibold tracking-tight">{quiz.title}</h1>
              <p className="mt-1 text-sm text-zinc-400">
                {quiz.questions.length} questions · {quiz.totalMarks ?? "—"} marks · {answeredCount} answered · pass{" "}
                {quiz.passing}%
              </p>
            </div>
            <div className="text-right">
              <p className="inline-flex items-center gap-1.5 font-mono text-lg text-accent">
                <Clock size={16} aria-hidden />
                {formatTime(seconds)}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">Time left</p>
            </div>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/8">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                timePct <= 20 ? "bg-red-500" : timePct <= 40 ? "bg-amber-500" : "bg-accent"
              }`}
              style={{ width: `${timePct}%` }}
            />
          </div>
        </div>

        <div className="border-b border-white/8 px-5 py-4">
          <div className="flex flex-wrap gap-2">
            {quiz.questions.map((item, i) => {
              const answered = answers[item.id] != null && answers[item.id] !== "";
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrent(i)}
                  className={`h-9 w-9 cursor-pointer rounded-full border font-mono text-xs transition ${
                    i === current
                      ? "border-accent bg-accent/20 text-accent"
                      : answered
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                        : "border-white/12 bg-white/5 text-zinc-400 hover:border-white/20"
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        <fieldset className="px-5 py-6">
          <legend className="font-sans text-base font-medium leading-relaxed text-zinc-100">
            Q{current + 1}. {q.q}
            {q.marks != null ? (
              <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                ({q.marks} mark{q.marks === 1 ? "" : "s"})
              </span>
            ) : null}
          </legend>
          {q.type === "blank" ? (
            <input
              className={`${fieldClass} mt-4`}
              placeholder="Type your answer"
              value={answers[q.id] ?? ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
            />
          ) : (
            <div className="mt-4 space-y-2">
              {q.options.map((opt, idx) => {
                const selected = answers[q.id] === String(idx);
                return (
                  <label
                    key={opt}
                    className={`flex cursor-pointer gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                      selected
                        ? "border-accent/40 bg-accent/10 text-foreground"
                        : "border-white/10 bg-white/3 text-zinc-300 hover:border-white/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      checked={selected}
                      onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: String(idx) }))}
                      className="mt-0.5 accent-[#d4a22f]"
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          )}
        </fieldset>

        <div className="flex flex-wrap justify-between gap-3 border-t border-white/8 px-5 py-4">
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
              <Tx k="st_quiz_submit" />
            </button>
          )}
        </div>
      </article>
    </div>
  );
}
