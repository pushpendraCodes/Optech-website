"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { SCHOLARSHIP_QUESTIONS, SCHOLARSHIP_SLABS } from "@/lib/site-content";
import { btnPrimary, fieldClass, labelClass } from "@/components/ui/ui";

type Step = "register" | "exam" | "result";

export default function ScholarshipPage() {
  const [step, setStep] = useState<Step>("register");
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const errorRef = useRef<HTMLDivElement>(null);

  const onRegister = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const n = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const next: string[] = [];
    if (!n) next.push("Enter your full name.");
    if (phone.length < 10) next.push("Enter a valid phone number.");
    if (next.length) {
      setErrors(next);
      errorRef.current?.focus();
      return;
    }
    setName(n);
    setErrors([]);
    setStep("exam");
  };

  const submitExam = () => {
    let correct = 0;
    SCHOLARSHIP_QUESTIONS.forEach((q) => {
      const val = answers[q.id];
      if (typeof val === "number" && val === q.answer) correct += 1;
    });
    setScore(Math.round((correct / SCHOLARSHIP_QUESTIONS.length) * 100));
    setStep("result");
  };

  const slab = SCHOLARSHIP_SLABS.find((s) => score >= s.min);

  return (
    <>
      <PageHero
        eyebrow="scholar_eyebrow"
        title="scholar_title"
        titleAccent="scholar_title_accent"
        description="scholar_desc"
      />

      <section className="px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-2xl">
          {step === "register" ? (
            <form onSubmit={onRegister} className="card-surface flex flex-col gap-5 p-6 md:p-8">
              {errors.length ? (
                <div
                  ref={errorRef}
                  tabIndex={-1}
                  role="alert"
                  className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4"
                >
                  <h2 id="error-title" className="font-sans text-sm font-semibold">
                    There is a problem
                  </h2>
                  <ul className="mt-2 list-disc pl-5 font-sans text-sm text-zinc-400">
                    {errors.map((err) => (
                      <li key={err}>{err}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div>
                <label htmlFor="name" className={labelClass}>
                  Full name
                </label>
                <input id="name" name="name" autoComplete="name" className={fieldClass} />
              </div>
              <div>
                <label htmlFor="phone" className={labelClass}>
                  Phone
                </label>
                <input id="phone" name="phone" type="tel" autoComplete="tel" className={fieldClass} />
              </div>
              <button type="submit" className={btnPrimary}>
                Start exam
              </button>
            </form>
          ) : null}

          {step === "exam" ? (
            <div className="flex flex-col gap-5">
              {SCHOLARSHIP_QUESTIONS.map((q, i) => (
                <fieldset key={q.id} className="card-surface p-5">
                  <legend className="font-sans text-sm font-medium">
                    {i + 1}. {q.q}
                  </legend>
                  <div className="mt-3 space-y-2">
                    {q.options.map((opt, idx) => (
                      <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                        <input
                          type="radio"
                          name={q.id}
                          onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: idx }))}
                          className="accent-[#d4a22f]"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
              <button type="button" className={btnPrimary} onClick={submitExam}>
                Submit & auto-score
              </button>
            </div>
          ) : null}

          {step === "result" ? (
            <div className="card-surface p-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
                Result for {name}
              </p>
              <h2 className="mt-3 font-sans text-4xl font-semibold">{score}%</h2>
              <p className="mt-3 font-sans text-sm text-zinc-400">
                {slab
                  ? `Coupon ${slab.coupon} — ${slab.label}. Use it on the enroll page.`
                  : "No discount slab this time. You can still enroll at the listed fee."}
              </p>
              {slab ? (
                <p className="mt-4 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 font-mono text-sm text-accent">
                  {slab.coupon}
                </p>
              ) : null}
              <Link href="/courses" className={`${btnPrimary} mt-6`}>
                Browse courses
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
