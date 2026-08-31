"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle,
  Clock,
  MagnifyingGlass,
  MinusCircle,
  PlayCircle,
  Question,
  Trophy,
  XCircle,
} from "@phosphor-icons/react";
import { Tx } from "@/components/i18n/Tx";
import { QUIZ_HISTORY, QUIZZES } from "@/lib/student-data";
import { useGetStudentDashboardQuery, useGetStudentQuizAttemptsQuery, useGetStudentQuizzesQuery } from "@/lib/api";
import { loc } from "@/lib/loc";
import { useStudentAuth } from "@/components/providers/StudentAuth";
import { btnGhost, btnPrimary } from "@/components/ui/ui";

type QuizItem = {
  id: string;
  title: string;
  course: string;
  subject: string;
  minutes: number;
  passing: number;
  negative: boolean;
  open: boolean;
  questionCount: number;
  totalMarks: number;
  bestScore?: number;
  attemptCount: number;
};

type AttemptItem = {
  id: string;
  quizId: string;
  title: string;
  date: string;
  score: number;
  passing: number;
  passed: boolean;
  correct?: number;
  wrong?: number;
  skipped?: number;
  status: string;
};

type TabKey = "available" | "history";

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function ScoreRing({ value, size = 44 }: { value: number; size?: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
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
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-medium text-accent">
        {pct}%
      </span>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/3 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className="mt-2 font-sans text-2xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
    </article>
  );
}

function QuizRow({ quiz }: { quiz: QuizItem }) {
  return (
    <div className="flex flex-col gap-3 border-b border-white/5 px-4 py-4 last:border-0 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
            quiz.open
              ? "border-accent/30 bg-accent/10 text-accent"
              : "border-white/10 bg-white/5 text-zinc-500"
          }`}
        >
          <Question size={18} weight="fill" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-sans text-sm font-semibold text-zinc-100">{quiz.title}</h3>
            <span
              className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] ${
                quiz.open
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-zinc-600/40 bg-zinc-800/60 text-zinc-400"
              }`}
            >
              {quiz.open ? "Open" : "Closed"}
            </span>
            {quiz.negative ? (
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-amber-300">
                -ve marks
              </span>
            ) : null}
          </div>
          <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
            {quiz.questionCount ? <span>{quiz.questionCount} questions</span> : null}
            {quiz.totalMarks ? <span>{quiz.totalMarks} marks</span> : null}
            <span className="inline-flex items-center gap-1">
              <Clock size={12} aria-hidden />
              {quiz.minutes} min
            </span>
            <span>Pass {quiz.passing}%</span>
            {quiz.subject ? <span>{quiz.subject}</span> : null}
          </p>
          {quiz.attemptCount > 0 ? (
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
              {quiz.attemptCount} attempt{quiz.attemptCount === 1 ? "" : "s"}
              {quiz.bestScore != null ? ` · best ${quiz.bestScore}%` : ""}
            </p>
          ) : null}
        </div>
      </div>
      {quiz.open ? (
        <Link
          href={`/student/quizzes/${quiz.id}`}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-accent transition hover:bg-accent/20"
        >
          <PlayCircle size={14} aria-hidden />
          <Tx k="st_quiz_start" />
        </Link>
      ) : (
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
          <Tx k="st_quiz_closed" />
        </span>
      )}
    </div>
  );
}

function AttemptRow({ attempt }: { attempt: AttemptItem }) {
  return (
    <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3 last:border-0">
      <ScoreRing value={attempt.score} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-sans text-sm font-medium text-zinc-100">{attempt.title}</p>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] ${
              attempt.passed
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/30 bg-red-500/10 text-red-300"
            }`}
          >
            {attempt.passed ? <CheckCircle size={10} aria-hidden /> : <XCircle size={10} aria-hidden />}
            {attempt.passed ? "Passed" : "Failed"}
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          {attempt.date}
          {attempt.correct != null ? ` · ${attempt.correct} correct` : ""}
          {attempt.wrong != null ? ` · ${attempt.wrong} wrong` : ""}
          {attempt.status === "auto_submitted" ? " · auto-submitted" : ""}
        </p>
      </div>
      <div className="hidden shrink-0 text-right sm:block">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">Pass {attempt.passing}%</p>
      </div>
    </div>
  );
}

export default function QuizzesPage() {
  const { studentId } = useStudentAuth();
  const { data, isLoading, isError, refetch } = useGetStudentQuizzesQuery(undefined, { skip: !studentId });
  const { data: attemptsRes } = useGetStudentQuizAttemptsQuery(undefined, { skip: !studentId });
  const { data: dash } = useGetStudentDashboardQuery(undefined, { skip: !studentId });
  const [tab, setTab] = useState<TabKey>("available");
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");

  const fromApi = Boolean(data?.data?.length);

  const attempts: AttemptItem[] = useMemo(() => {
    if (attemptsRes?.data?.length) {
      return attemptsRes.data.map((row) => {
        const quiz = row.quiz as { _id?: string; title?: string; passing?: number } | undefined;
        const score = Number(row.percent ?? 0);
        const passing = Number(quiz?.passing ?? 60);
        return {
          id: String(row._id),
          quizId: String(quiz?._id ?? ""),
          title: String(quiz?.title ?? "Quiz"),
          date: formatDate(row.submittedAt ? String(row.submittedAt) : undefined),
          score,
          passing,
          passed: score >= passing,
          correct: row.correct != null ? Number(row.correct) : undefined,
          wrong: row.wrong != null ? Number(row.wrong) : undefined,
          skipped: row.skipped != null ? Number(row.skipped) : undefined,
          status: String(row.status ?? "submitted"),
        };
      });
    }
    return QUIZ_HISTORY.map((row) => ({
      id: row.id,
      quizId: row.id,
      title: row.title,
      date: row.date,
      score: row.score,
      passing: 60,
      passed: row.score >= 60,
      status: "submitted",
    }));
  }, [attemptsRes?.data]);

  const attemptStats = useMemo(() => {
    const map = new Map<string, { count: number; best: number }>();
    for (const attempt of attempts) {
      if (!attempt.quizId) continue;
      const prev = map.get(attempt.quizId) ?? { count: 0, best: 0 };
      map.set(attempt.quizId, {
        count: prev.count + 1,
        best: Math.max(prev.best, attempt.score),
      });
    }
    return map;
  }, [attempts]);

  const quizzes: QuizItem[] = useMemo(() => {
    if (fromApi) {
      return (data?.data ?? []).map((row) => {
        const id = String(row._id);
        const stats = attemptStats.get(id);
        return {
          id,
          title: String(row.title ?? "Quiz"),
          course: loc((row.course as { title?: unknown } | undefined)?.title as never) || "Course",
          subject: String(row.subject ?? ""),
          minutes: Number(row.minutes ?? 0),
          passing: Number(row.passing ?? 0),
          negative: Boolean(row.negative),
          open: Boolean(row.open),
          questionCount: Number(row.questionCount ?? 0),
          totalMarks: Number(row.totalMarks ?? 0),
          attemptCount: stats?.count ?? 0,
          bestScore: stats?.best,
        };
      });
    }
    return QUIZZES.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      course: quiz.course,
      subject: "",
      minutes: quiz.minutes,
      passing: quiz.passing,
      negative: quiz.negative,
      open: quiz.open,
      questionCount: quiz.questions.length,
      totalMarks: quiz.questions.length,
      attemptCount: 0,
    }));
  }, [attemptStats, data?.data, fromApi]);

  const enrolledCourses = useMemo(() => {
    const enrollments = (dash?.data?.enrollments as Record<string, unknown>[] | undefined) ?? [];
    if (enrollments.length) {
      return enrollments.map((row) => loc((row.course as { title?: unknown })?.title as never) || "Course");
    }
    return [...new Set(quizzes.map((q) => q.course))];
  }, [dash?.data?.enrollments, quizzes]);

  const filteredQuizzes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return quizzes.filter((quiz) => {
      const matchesCourse = courseFilter === "all" || quiz.course === courseFilter;
      const matchesSearch =
        !q ||
        quiz.title.toLowerCase().includes(q) ||
        quiz.course.toLowerCase().includes(q) ||
        quiz.subject.toLowerCase().includes(q);
      return matchesCourse && matchesSearch;
    });
  }, [courseFilter, quizzes, search]);

  const filteredAttempts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return attempts.filter(
      (attempt) => !q || attempt.title.toLowerCase().includes(q) || attempt.date.toLowerCase().includes(q),
    );
  }, [attempts, search]);

  const groupedQuizzes = useMemo(() => {
    const map = new Map<string, QuizItem[]>();
    for (const quiz of filteredQuizzes) {
      const list = map.get(quiz.course) ?? [];
      list.push(quiz);
      map.set(quiz.course, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filteredQuizzes]);

  const openCount = quizzes.filter((q) => q.open).length;
  const avgScore =
    attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
      : 0;
  const passCount = attempts.filter((a) => a.passed).length;

  return (
    <div className="mx-auto max-w-4xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
        <Tx k="st_module" />
      </p>
      <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight">
        <Tx k="st_quiz_title" />
      </h1>
      <p className="mt-2 font-sans text-sm text-zinc-400">
        <Tx k="st_quiz_lead" />
      </p>

      {isLoading ? (
        <div className="mt-8 space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-20 animate-pulse rounded-2xl border border-white/10 bg-white/3" />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-3xl border border-white/10 bg-white/3" />
        </div>
      ) : isError ? (
        <div className="card-surface mt-8 p-8 text-center">
          <p className="text-sm text-zinc-400">Could not load quizzes. Check your connection and try again.</p>
          <button type="button" className={`${btnGhost} mt-4`} onClick={() => void refetch()}>
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Open tests" value={String(openCount)} hint="Ready to attempt" />
            <StatCard label="Attempts" value={String(attempts.length)} hint="Submitted results" />
            <StatCard label="Avg score" value={attempts.length ? `${avgScore}%` : "—"} hint="Across all tests" />
            <StatCard
              label="Pass rate"
              value={attempts.length ? `${Math.round((passCount / attempts.length) * 100)}%` : "—"}
              hint={`${passCount} passed`}
            />
          </div>

          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTab("available")}
                className={`cursor-pointer rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition ${
                  tab === "available"
                    ? "border-accent/40 bg-accent/15 text-accent"
                    : "border-white/10 bg-white/3 text-zinc-400 hover:border-white/20"
                }`}
              >
                Available ({quizzes.length})
              </button>
              <button
                type="button"
                onClick={() => setTab("history")}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition ${
                  tab === "history"
                    ? "border-accent/40 bg-accent/15 text-accent"
                    : "border-white/10 bg-white/3 text-zinc-400 hover:border-white/20"
                }`}
              >
                <Trophy size={12} aria-hidden />
                <Tx k="st_quiz_history" /> ({attempts.length})
              </button>
            </div>
            <label className="relative block w-full lg:max-w-xs">
              <MagnifyingGlass
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                aria-hidden
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={tab === "available" ? "Search quizzes..." : "Search results..."}
                className="w-full rounded-2xl border border-white/10 bg-zinc-900 py-2.5 pl-10 pr-4 font-sans text-sm outline-none transition focus:border-accent/40 focus:ring-2 focus:ring-accent/20"
              />
            </label>
          </div>

          {tab === "available" ? (
            <>
              {enrolledCourses.length > 1 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setCourseFilter("all")}
                    className={`cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition ${
                      courseFilter === "all"
                        ? "border-accent/40 bg-accent/15 text-accent"
                        : "border-white/10 text-zinc-400 hover:border-white/20"
                    }`}
                  >
                    All courses
                  </button>
                  {enrolledCourses.map((course) => (
                    <button
                      key={course}
                      type="button"
                      onClick={() => setCourseFilter(course)}
                      className={`cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition ${
                        courseFilter === course
                          ? "border-accent/40 bg-accent/15 text-accent"
                          : "border-white/10 text-zinc-400 hover:border-white/20"
                      }`}
                    >
                      {course}
                    </button>
                  ))}
                </div>
              ) : null}

              {filteredQuizzes.length === 0 ? (
                <div className="card-surface mt-6 flex flex-col items-center gap-4 p-10 text-center">
                  <Question size={36} className="text-zinc-600" aria-hidden />
                  <p className="font-sans text-lg font-semibold">No quizzes available</p>
                  <p className="max-w-sm text-sm text-zinc-400">
                    Open mock tests for your enrolled courses will appear here when admin publishes them.
                  </p>
                  <Link href="/student/courses" className={btnPrimary}>
                    View my courses
                  </Link>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {groupedQuizzes.map(([course, items]) => (
                    <section key={course} className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
                      <header className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <BookOpen size={16} className="shrink-0 text-accent" aria-hidden />
                          <h2 className="truncate font-sans text-sm font-semibold">{course}</h2>
                        </div>
                        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                          {items.length} {items.length === 1 ? "test" : "tests"}
                        </span>
                      </header>
                      <div>
                        {items.map((quiz) => (
                          <QuizRow key={quiz.id} quiz={quiz} />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </>
          ) : filteredAttempts.length === 0 ? (
            <div className="card-surface mt-6 flex flex-col items-center gap-3 p-10 text-center">
              <MinusCircle size={32} className="text-zinc-600" aria-hidden />
              <p className="text-sm text-zinc-400">No submitted results yet. Start an open test to build your history.</p>
              <button type="button" className={btnGhost} onClick={() => setTab("available")}>
                Browse available tests
              </button>
            </div>
          ) : (
            <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
              <header className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
                <Trophy size={16} className="text-accent" aria-hidden />
                <h2 className="font-sans text-sm font-semibold">
                  <Tx k="st_quiz_history" />
                </h2>
              </header>
              <div>
                {filteredAttempts.map((attempt) => (
                  <AttemptRow key={attempt.id} attempt={attempt} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
