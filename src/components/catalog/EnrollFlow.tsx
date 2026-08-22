"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useRef, useState } from "react";
import { ArrowUpRight, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import {
  INSTALLMENT_RULES,
  calcPayable,
  formatInr,
  getCourse,
} from "@/lib/catalog";
import { DEMO_STUDENT } from "@/lib/student-data";
import { useStudentAuth } from "@/components/providers/StudentAuth";
import { PageHero } from "@/components/ui/PageHero";
import { btnGhost, btnPrimary, fieldClass, labelClass } from "@/components/ui/ui";

type PayState = "idle" | "processing" | "success" | "failed";

export function EnrollFlow({ slug }: { slug: string }) {
  const course = getCourse(slug);
  const router = useRouter();
  const { studentId, login } = useStudentAuth();
  const [batchId, setBatchId] = useState(course?.batches[0]?.id ?? "");
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState("");
  const [plan, setPlan] = useState<"full" | "emi">("full");
  const [pay, setPay] = useState<PayState>("idle");
  const [loginError, setLoginError] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);

  const quote = useMemo(
    () => calcPayable(course?.fee ?? 0, applied),
    [course, applied],
  );
  const emi = Math.ceil(quote.total / INSTALLMENT_RULES.parts);

  if (!course) {
    return (
      <PageHero
        eyebrow="enroll_missing"
        title="enroll_missing"
        description="enroll_missing_desc"
      />
    );
  }

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    const next = calcPayable(course.fee, code);
    if (!next.rule) {
      setApplied("");
      setLoginError("That coupon is not valid. Try SCHOLAR20, SCHOLAR10, or OPTECH10.");
      errorRef.current?.focus();
      return;
    }
    setApplied(code);
    setLoginError("");
  };

  const onGateLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const err = login(String(data.get("id") ?? ""), String(data.get("password") ?? ""));
    if (err) {
      setLoginError(err);
      errorRef.current?.focus();
    }
  };

  const payNow = (succeed: boolean) => {
    setPay("processing");
    window.setTimeout(() => setPay(succeed ? "success" : "failed"), 900);
  };

  if (!studentId) {
    return (
      <>
        <PageHero
          eyebrow="enroll_gate_eyebrow"
          title="enroll_gate_title"
          titleAccent="enroll_gate_title_accent"
          description="enroll_gate_desc"
        />
        <section className="px-6 py-16 md:px-10">
          <form
            onSubmit={onGateLogin}
            className="card-surface mx-auto flex max-w-lg flex-col gap-5 p-6 md:p-8"
          >
            {loginError ? (
              <div
                ref={errorRef}
                tabIndex={-1}
                role="alert"
                className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4"
              >
                <p id="error-title" className="font-sans text-sm font-semibold">
                  There is a problem
                </p>
                <p className="mt-1 font-sans text-sm text-zinc-400">{loginError}</p>
              </div>
            ) : null}
            <div>
              <label htmlFor="id" className={labelClass}>
                Student ID
              </label>
              <input
                id="id"
                name="id"
                autoComplete="username"
                required
                defaultValue={DEMO_STUDENT.id}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                defaultValue={DEMO_STUDENT.password}
                className={fieldClass}
              />
            </div>
            <button type="submit" className={btnPrimary}>
              Continue to {course.title}
              <ArrowUpRight size={14} weight="bold" />
            </button>
          </form>
        </section>
      </>
    );
  }

  if (pay === "success") {
    return (
      <section className="px-6 pb-24 pt-32 md:px-10">
        <div className="card-surface mx-auto max-w-xl p-8">
          <CheckCircle size={36} weight="fill" className="text-accent" />
          <h1 className="mt-4 font-sans text-3xl font-semibold tracking-tight">
            Payment confirmed
          </h1>
          <p className="mt-3 font-sans text-sm text-zinc-400">
            {course.title} is now on your dashboard. Receipt INV-2
            {Math.floor(Math.random() * 900 + 100)} is ready. Admin can see this under Admissions.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/student/dashboard" className={btnPrimary}>
              Open dashboard
            </Link>
            <button type="button" className={btnGhost} onClick={() => window.print()}>
              Download receipt
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="enroll_buy_eyebrow"
        title="enroll_buy_title"
        titleAccent="enroll_buy_title_accent"
        description="enroll_buy_desc"
        vars={{ course: course.title }}
      />
      <section className="px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-[1400px] gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <fieldset className="card-surface p-6">
              <legend className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
                Batch / timing
              </legend>
              <div className="mt-4 space-y-2">
                {course.batches.map((batch) => (
                  <label
                    key={batch.id}
                    className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/8 p-3 transition-colors duration-200 hover:border-white/15"
                  >
                    <input
                      type="radio"
                      name="batch"
                      checked={batchId === batch.id}
                      onChange={() => setBatchId(batch.id)}
                      className="mt-1 accent-[#d4a22f]"
                    />
                    <span>
                      <span className="block font-sans text-sm font-medium">
                        {batch.label}
                      </span>
                      <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        {batch.timing} · starts {batch.start}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="card-surface p-6">
              <label htmlFor="coupon" className={labelClass}>
                Coupon / scholarship / referral
              </label>
              <div className="flex gap-2">
                <input
                  id="coupon"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="SCHOLAR20"
                  autoComplete="off"
                  className={fieldClass}
                />
                <button type="button" className={btnGhost} onClick={applyCoupon}>
                  Apply
                </button>
              </div>
              {applied ? (
                <p className="mt-3 font-sans text-sm text-accent">
                  {quote.rule?.label} applied — {formatInr(quote.discount)} off
                </p>
              ) : null}
            </div>
          </div>

          <div className="card-surface flex flex-col gap-5 p-6 md:p-8">
            <h2 className="font-sans text-xl font-semibold">Order summary</h2>
            <dl className="space-y-2 font-sans text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">Course fee</dt>
                <dd>{formatInr(quote.fee)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Discount</dt>
                <dd>{formatInr(quote.discount)}</dd>
              </div>
              <div className="flex justify-between border-t border-white/8 pt-3 text-base font-semibold">
                <dt>Payable</dt>
                <dd>{formatInr(quote.total)}</dd>
              </div>
            </dl>

            <div className="flex gap-2">
              <button
                type="button"
                aria-pressed={plan === "full"}
                onClick={() => setPlan("full")}
                className={`${plan === "full" ? btnPrimary : btnGhost} flex-1`}
              >
                Full pay
              </button>
              <button
                type="button"
                aria-pressed={plan === "emi"}
                disabled={quote.total < INSTALLMENT_RULES.minFeeForEmi}
                onClick={() => setPlan("emi")}
                className={`${plan === "emi" ? btnPrimary : btnGhost} flex-1`}
              >
                EMI × {INSTALLMENT_RULES.parts}
              </button>
            </div>
            {plan === "emi" ? (
              <p className="font-sans text-sm text-zinc-400">
                {INSTALLMENT_RULES.parts} installments of {formatInr(emi)}
              </p>
            ) : null}

            {pay === "failed" ? (
              <div role="alert" className="flex items-start gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                <WarningCircle size={18} className="mt-0.5 text-red-400" />
                <p className="font-sans text-sm text-zinc-300">
                  Payment pending/failed. Retry with UPI, card, or netbanking — or pay cash at campus for admin enrollment.
                </p>
              </div>
            ) : null}

            <button
              type="button"
              disabled={pay === "processing"}
              onClick={() => payNow(true)}
              className={btnPrimary}
            >
              {pay === "processing" ? "Talking to Razorpay…" : "Pay with Razorpay"}
            </button>
            <button
              type="button"
              disabled={pay === "processing"}
              onClick={() => payNow(false)}
              className={btnGhost}
            >
              Simulate failed payment
            </button>
            <button type="button" className="text-left font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500" onClick={() => router.push("/contact")}>
              Offline cash? Ask admissions to enroll you (#13)
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
