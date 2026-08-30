"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle,
  Clock,
  Info,
  Prohibit,
  Warning,
  XCircle,
} from "@phosphor-icons/react";
import { PageHero } from "@/components/ui/PageHero";
import { btnPrimary, btnGhost, fieldClass, labelClass } from "@/components/ui/ui";
import { useGetScholarshipQuery, useSubmitScholarshipMutation } from "@/lib/api";
import { digitsOnlyPhone, isValidIndianMobile, mobilePhoneError } from "@/lib/phone";
import { useStudentAuth } from "@/components/providers/StudentAuth";

type Step = "register" | "briefing" | "exam" | "result";
type Question = { id: string; q: string; options: string[]; marks?: number };
type TerminationReason = "submitted" | "time_up" | "tab_switch";

type SubmitResult = {
  percent?: number;
  score?: number;
  max?: number;
  correct?: number;
  wrong?: number;
  skipped?: number;
  couponCode?: string;
  slab?: { couponPercent?: number };
  timeTakenSeconds?: number;
};

function ScoreRing({ percent }: { percent: number }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = c - (clamped / 100) * c;

  return (
    <div className="relative mx-auto h-40 w-40">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="#d4a22f"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-sans text-4xl font-semibold text-foreground">{Math.round(clamped)}%</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Score</span>
      </div>
    </div>
  );
}

function BreakdownChart({
  correct,
  wrong,
  skipped,
}: {
  correct: number;
  wrong: number;
  skipped: number;
}) {
  const total = correct + wrong + skipped || 1;
  const segments = [
    { label: "Correct", value: correct, color: "#34d399" },
    { label: "Wrong", value: wrong, color: "#f87171" },
    { label: "Skipped", value: skipped, color: "#71717a" },
  ];

  const r = 42;
  const c = 2 * Math.PI * r;
  let cumulative = 0;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-center">
      <div className="relative h-36 w-36 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
          {segments.map((seg) => {
            const fraction = seg.value / total;
            const dash = fraction * c;
            const gap = c - dash;
            const rotation = (cumulative / total) * 360;
            cumulative += seg.value;
            if (seg.value <= 0) return null;
            return (
              <circle
                key={seg.label}
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth="14"
                strokeDasharray={`${dash} ${gap}`}
                transform={`rotate(${rotation} 50 50)`}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-sans text-2xl font-semibold">{total}</span>
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">Questions</span>
        </div>
      </div>
      <ul className="w-full space-y-2 sm:w-auto">
        {segments.map((seg) => (
          <li key={seg.label} className="flex items-center justify-between gap-6 text-sm">
            <span className="flex items-center gap-2 text-zinc-400">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
              {seg.label}
            </span>
            <span className="font-mono text-zinc-200">
              {seg.value}
              <span className="ml-1 text-zinc-500">({Math.round((seg.value / total) * 100)}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ScholarshipPage() {
  const { ready, studentId, name: studentName } = useStudentAuth();
  const { data, isError } = useGetScholarshipQuery();
  const [submitExamApi, submitState] = useSubmitScholarshipMutation();

  const exam = data?.data as {
    id?: string;
    title?: string;
    minutes?: number;
    questionCount?: number;
    totalMarks?: number;
    questions?: { id: string; prompt: string; options: string[]; marks?: number }[];
  } | undefined;

  const questions: Question[] = useMemo(
    () =>
      (exam?.questions ?? []).map((q) => ({
        id: q.id,
        q: q.prompt,
        options: q.options,
        marks: q.marks,
      })),
    [exam?.questions],
  );

  const [step, setStep] = useState<Step>("register");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [seconds, setSeconds] = useState(30 * 60);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [terminationReason, setTerminationReason] = useState<TerminationReason>("submitted");
  const errorRef = useRef<HTMLDivElement>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (ready && studentName && !name) setName(studentName);
  }, [ready, studentName, name]);

  useEffect(() => {
    if (exam?.minutes) setSeconds(exam.minutes * 60);
  }, [exam?.minutes]);

  const finishExam = useCallback(
    async (reason: TerminationReason = "submitted") => {
      if (!exam?.id || step === "result" || submittingRef.current) return;
      submittingRef.current = true;
      setTerminationReason(reason);

      const timeTakenSeconds = startedAt ? Math.round((Date.now() - startedAt) / 1000) : undefined;
      const payload = questions.map((q, index) => ({
        index,
        value: Number(answers[q.id] ?? -1),
      }));

      try {
        const body = await submitExamApi({
          examId: String(exam.id),
          name,
          phone,
          email: email || undefined,
          studentCode: studentId || undefined,
          timeTakenSeconds,
          answers: payload,
        }).unwrap();
        setResult(body.data as SubmitResult);
        setStep("result");
      } catch {
        submittingRef.current = false;
        setErrors(["Could not submit exam. Please try again."]);
        setStep("register");
      }
    },
    [answers, email, exam?.id, name, phone, questions, startedAt, step, studentId, submitExamApi],
  );

  useEffect(() => {
    if (step !== "exam" || !exam?.minutes) return;
    const t = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          window.clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [step, exam?.minutes]);

  useEffect(() => {
    if (step === "exam" && seconds === 0 && exam?.id) {
      void finishExam("time_up");
    }
  }, [step, seconds, exam?.id, finishExam]);

  useEffect(() => {
    if (step !== "exam") return;

    const onVisibilityChange = () => {
      if (document.hidden) void finishExam("tab_switch");
    };

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Your exam is in progress. Leaving will submit and close the exam.";
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [step, finishExam]);

  const onRegister = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const n = String(form.get("name") ?? "").trim();
    const p = digitsOnlyPhone(String(form.get("phone") ?? ""));
    const em = String(form.get("email") ?? "").trim();
    const next: string[] = [];
    if (!n) next.push("Enter your full name.");
    const phoneErr = mobilePhoneError(p);
    if (phoneErr) next.push(phoneErr);
    if (next.length) {
      setErrors(next);
      errorRef.current?.focus();
      return;
    }
    setName(n);
    setPhone(p);
    setEmail(em);
    setErrors([]);
    setStep("briefing");
  };

  const proceedToBriefing = () => {
    if (!studentName || !studentId) return;
    setName(studentName);
    setStep("briefing");
  };

  const beginExam = () => {
    setStartedAt(Date.now());
    setCurrent(0);
    setAnswers({});
    submittingRef.current = false;
    setTerminationReason("submitted");
    setStep("exam");
  };

  const formatTime = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

  if (isError || (!exam?.id && data)) {
    return (
      <>
        <PageHero eyebrow="scholar_eyebrow" title="scholar_title" titleAccent="scholar_title_accent" description="scholar_desc" />
        <section className="px-6 py-16"><p className="text-center text-zinc-400">No scholarship exam is active right now. Check back later.</p></section>
      </>
    );
  }

  return (
    <>
      <PageHero eyebrow="scholar_eyebrow" title="scholar_title" titleAccent="scholar_title_accent" description="scholar_desc" />

      <section className="px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-2xl">
          {step === "register" ? (
            <>
              {studentId ? (
                <div className="card-surface mb-4 p-5">
                  <p className="font-sans text-sm text-zinc-300">Logged in as <span className="text-accent">{studentName}</span> ({studentId})</p>
                  <p className="mt-2 font-sans text-xs text-zinc-500">Enter your phone below and start, or continue if phone is already filled.</p>
                  <button type="button" className={`${btnPrimary} mt-4`} disabled={!isValidIndianMobile(phone)} onClick={proceedToBriefing}>Continue to exam</button>
                </div>
              ) : null}
              <form onSubmit={onRegister} className="card-surface flex flex-col gap-5 p-6 md:p-8">
                {errors.length ? (
                  <div ref={errorRef} tabIndex={-1} role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                    <ul className="list-disc pl-5 text-sm text-zinc-300">{errors.map((err) => <li key={err}>{err}</li>)}</ul>
                  </div>
                ) : null}
                {exam?.title ? (
                  <p className="font-sans text-sm text-zinc-400">
                    {exam.title} · {exam.questionCount ?? questions.length} questions · {exam.totalMarks ?? "—"} marks · {exam.minutes ?? 30} min
                  </p>
                ) : null}
                <div>
                  <label htmlFor="name" className={labelClass}>Full name</label>
                  <input id="name" name="name" defaultValue={studentName ?? ""} autoComplete="name" className={fieldClass} />
                </div>
                <div>
                  <label htmlFor="phone" className={labelClass}>Phone</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(digitsOnlyPhone(e.target.value))}
                    autoComplete="tel"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    className={fieldClass}
                  />
                  <p className="mt-1 font-sans text-xs text-zinc-500">10-digit Indian mobile number (starts with 6–9).</p>
                </div>
                <div>
                  <label htmlFor="email" className={labelClass}>Email (optional)</label>
                  <input id="email" name="email" type="email" autoComplete="email" className={fieldClass} />
                </div>
                <button type="submit" className={btnPrimary} disabled={!questions.length}>Continue to exam</button>
              </form>
            </>
          ) : null}

          {step === "briefing" ? (
            <div className="card-surface overflow-hidden p-0">
              <div className="border-b border-amber-500/20 bg-amber-500/10 px-6 py-5 md:px-8">
                <div className="flex items-start gap-3">
                  <Warning weight="fill" className="mt-0.5 h-6 w-6 shrink-0 text-amber-400" aria-hidden />
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-amber-400/90">Before you begin</p>
                    <h2 className="mt-1 font-sans text-xl font-semibold text-foreground">Exam rules — read carefully</h2>
                    <p className="mt-2 font-sans text-sm text-zinc-400">
                      Once you start, the timer runs continuously. Follow these rules to avoid losing your attempt.
                    </p>
                  </div>
                </div>
              </div>

              <ul className="space-y-4 px-6 py-6 md:px-8">
                <li className="flex gap-3 rounded-2xl border border-red-500/25 bg-red-500/8 p-4">
                  <Prohibit weight="bold" className="mt-0.5 h-5 w-5 shrink-0 text-red-400" aria-hidden />
                  <div>
                    <p className="font-sans text-sm font-medium text-zinc-200">Do not switch tabs or minimize this window</p>
                    <p className="mt-1 text-sm text-zinc-500">If you leave this tab, your exam will be submitted immediately and closed.</p>
                  </div>
                </li>
                <li className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <XCircle weight="bold" className="mt-0.5 h-5 w-5 shrink-0 text-zinc-400" aria-hidden />
                  <div>
                    <p className="font-sans text-sm font-medium text-zinc-200">Do not close or refresh the browser tab</p>
                    <p className="mt-1 text-sm text-zinc-500">Closing the tab will end your exam. You will see a warning if you try to leave.</p>
                  </div>
                </li>
                <li className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <Clock weight="bold" className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
                  <div>
                    <p className="font-sans text-sm font-medium text-zinc-200">{exam?.minutes ?? 30} minutes · {questions.length} questions</p>
                    <p className="mt-1 text-sm text-zinc-500">Stay on this page until you submit or time runs out.</p>
                  </div>
                </li>
              </ul>

              <div className="flex flex-col gap-3 border-t border-white/8 px-6 py-5 sm:flex-row sm:justify-between md:px-8">
                <button type="button" className={btnGhost} onClick={() => setStep("register")}>Go back</button>
                <button type="button" className={btnPrimary} onClick={beginExam}>I understand — start exam</button>
              </div>
            </div>
          ) : null}

          {step === "exam" && questions.length ? (
            <div>
              <div className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/8 px-4 py-3">
                <p className="flex items-center gap-2 font-sans text-xs text-amber-200/90">
                  <Warning weight="fill" className="h-4 w-4 shrink-0" aria-hidden />
                  Stay on this tab. Switching away will submit and close your exam.
                </p>
              </div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-sans text-xl font-semibold">{exam?.title ?? "Scholarship exam"}</h2>
                  <p className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
                    <span>Question {current + 1} of {questions.length}</span>
                    <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent">
                      {questions[current].marks ?? 1} mark{(questions[current].marks ?? 1) === 1 ? "" : "s"}
                    </span>
                  </p>
                </div>
                <span className={`font-mono text-lg ${seconds <= 60 ? "text-red-400" : "text-accent"}`}>{formatTime(seconds)}</span>
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                {questions.map((q, i) => {
                  const answered = answers[q.id] != null && answers[q.id] !== "";
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrent(i)}
                      className={`h-9 w-9 rounded-full border font-mono text-xs ${i === current ? "border-accent bg-accent/20 text-accent" : answered ? "border-emerald-500/40 text-emerald-300" : "border-white/12 text-zinc-400"}`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <fieldset className="card-surface p-5">
                <legend className="flex flex-wrap items-start gap-2 font-sans text-sm font-medium">
                  <span>{current + 1}. {questions[current].q}</span>
                  <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] font-normal text-zinc-400">
                    {questions[current].marks ?? 1} mark{(questions[current].marks ?? 1) === 1 ? "" : "s"}
                  </span>
                </legend>
                <div className="mt-3 space-y-2">
                  {questions[current].options.map((opt, idx) => (
                    <label key={opt} className="flex cursor-pointer gap-2 text-sm">
                      <input type="radio" name={questions[current].id} checked={answers[questions[current].id] === String(idx)} onChange={() => setAnswers((prev) => ({ ...prev, [questions[current].id]: String(idx) }))} className="accent-[#d4a22f]" />
                      {opt}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="mt-6 flex justify-between gap-3">
                <button type="button" className={btnGhost} disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>Previous</button>
                {current < questions.length - 1 ? (
                  <button type="button" className={btnPrimary} onClick={() => setCurrent((c) => c + 1)}>Next</button>
                ) : (
                  <button type="button" className={btnPrimary} disabled={submitState.isLoading} onClick={() => void finishExam("submitted")}>Submit exam</button>
                )}
              </div>
            </div>
          ) : null}

          {step === "result" && result ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="scholarship-result-title"
                className="card-surface max-h-[90vh] w-full max-w-lg overflow-y-auto p-0 shadow-2xl shadow-black/40"
              >
                <div className="border-b border-white/8 px-6 py-5 text-center md:px-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">Exam complete</p>
                  <h2 id="scholarship-result-title" className="mt-2 font-sans text-xl font-semibold">{name}</h2>
                  {terminationReason === "tab_switch" ? (
                    <p className="mt-2 flex items-center justify-center gap-2 text-sm text-red-300">
                      <Prohibit weight="bold" className="h-4 w-4" aria-hidden />
                      Exam closed — you switched tabs or left this page.
                    </p>
                  ) : terminationReason === "time_up" ? (
                    <p className="mt-2 flex items-center justify-center gap-2 text-sm text-amber-300">
                      <Clock weight="bold" className="h-4 w-4" aria-hidden />
                      Time&apos;s up — your answers were auto-submitted.
                    </p>
                  ) : (
                    <p className="mt-2 flex items-center justify-center gap-2 text-sm text-emerald-300">
                      <CheckCircle weight="fill" className="h-4 w-4" aria-hidden />
                      Submitted successfully
                    </p>
                  )}
                </div>

                <div className="px-6 py-6 md:px-8">
                  <ScoreRing percent={Number(result.percent ?? 0)} />

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Marks</p>
                      <p className="mt-1 font-sans text-2xl font-semibold">{result.score ?? "—"}<span className="text-base text-zinc-500"> / {result.max ?? "—"}</span></p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Time taken</p>
                      <p className="mt-1 font-sans text-2xl font-semibold">
                        {result.timeTakenSeconds != null ? formatTime(result.timeTakenSeconds) : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <p className="mb-4 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Answer breakdown</p>
                    <BreakdownChart
                      correct={Number(result.correct ?? 0)}
                      wrong={Number(result.wrong ?? 0)}
                      skipped={Number(result.skipped ?? 0)}
                    />
                  </div>

                  <div className={`mt-6 rounded-2xl border p-5 ${result.couponCode ? "border-accent/30 bg-accent/10" : "border-white/10 bg-white/[0.03]"}`}>
                    {result.couponCode ? (
                      <>
                        <p className="flex items-center justify-center gap-2 font-sans text-sm font-medium text-emerald-300">
                          <CheckCircle weight="fill" className="h-4 w-4 shrink-0" aria-hidden />
                          Congratulations — you passed!
                        </p>
                        <p className="mt-2 text-center font-sans text-sm text-zinc-300">
                          Scholarship unlocked — <span className="font-semibold text-accent">{result.slab?.couponPercent ?? ""}% off</span> on your next course enrollment.
                        </p>
                        <p className="mt-3 rounded-xl border border-accent/25 bg-black/20 px-4 py-3 text-center font-mono text-lg tracking-wider text-accent">
                          {result.couponCode}
                        </p>
                        <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
                          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Registered details</p>
                          <dl className="mt-2 space-y-1 text-sm">
                            <div className="flex justify-between gap-3">
                              <dt className="text-zinc-500">Mobile</dt>
                              <dd className="font-medium text-zinc-200">{phone}</dd>
                            </div>
                            {email ? (
                              <div className="flex justify-between gap-3">
                                <dt className="text-zinc-500">Email</dt>
                                <dd className="font-medium text-zinc-200">{email}</dd>
                              </div>
                            ) : null}
                          </dl>
                        </div>
                        <div className="mt-4 flex gap-3 rounded-xl border border-amber-500/25 bg-amber-500/8 p-4">
                          <Info weight="fill" className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" aria-hidden />
                          <p className="font-sans text-sm leading-relaxed text-amber-100/90">
                            When you purchase a course, use the <span className="font-semibold text-amber-200">same mobile number{email ? " and email" : ""}</span> entered for this exam. Your coupon will only apply if the checkout details match.
                          </p>
                        </div>
                        <p className="mt-3 text-center text-xs text-zinc-500">Apply this code on the course enroll page during checkout.</p>
                      </>
                    ) : (
                      <p className="text-center font-sans text-sm text-zinc-400">
                        No discount slab this time. You can still enroll at the listed course fee.
                      </p>
                    )}
                  </div>

                  <Link href="/courses" className={`${btnPrimary} mt-6 flex w-full justify-center`}>
                    Browse courses
                    <ArrowUpRight weight="bold" className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
