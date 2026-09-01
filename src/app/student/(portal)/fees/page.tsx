"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  CalendarBlank,
  CheckCircle,
  Clock,
  CurrencyInr,
  Receipt,
  WarningCircle,
} from "@phosphor-icons/react";
import { Tx } from "@/components/i18n/Tx";
import { formatInr } from "@/lib/catalog";
import { useGetStudentFeesQuery } from "@/lib/api";
import { loc } from "@/lib/loc";
import { useStudentAuth } from "@/components/providers/StudentAuth";

type InstallmentRow = {
  id: string;
  sequence: number;
  amount: number;
  dueDate?: string;
  status: string;
};

type CourseFee = {
  enrollmentId: string;
  title: string;
  feePlan: string;
  listFee: number;
  discount: number;
  couponCode?: string;
  agreedFee: number;
  paid: number;
  due: number;
  installments: InstallmentRow[];
};

type PaymentRow = {
  id: string;
  course: string;
  amount: number;
  listFee: number;
  discount: number;
  couponCode?: string;
  mode: string;
  date: string;
};

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function statusTone(status: string) {
  if (status === "paid") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  if (status === "overdue") return "border-red-500/30 bg-red-500/10 text-red-300";
  return "border-amber-500/30 bg-amber-500/10 text-amber-300";
}

function StatCard({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/3 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className={`mt-2 font-sans text-2xl font-semibold tracking-tight ${accent ? "text-accent" : ""}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
    </article>
  );
}

function CourseFeeCard({ course }: { course: CourseFee }) {
  const progress = course.agreedFee > 0 ? Math.min(100, Math.round((course.paid / course.agreedFee) * 100)) : 0;
  const pending = course.installments.filter((i) => i.status === "due" || i.status === "overdue");

  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
      <header className="border-b border-white/8 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
              <BookOpen size={18} aria-hidden />
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-sans text-lg font-semibold">{course.title}</h3>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                {course.feePlan === "installment" ? "Installment plan" : "Full fee"} · {progress}% paid
              </p>
            </div>
          </div>
          {course.due > 0 ? (
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-amber-300">
              {formatInr(course.due)} due
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-emerald-300">
              <CheckCircle size={12} aria-hidden />
              Clear
            </span>
          )}
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/8">
          <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className="grid gap-px bg-white/5 sm:grid-cols-4">
        {[
          ["List fee", formatInr(course.listFee)],
          ["Discount", course.discount > 0 ? `−${formatInr(course.discount)}` : "—"],
          ["Agreed fee", formatInr(course.agreedFee)],
          ["Paid", formatInr(course.paid)],
        ].map(([label, value]) => (
          <div key={label} className="bg-zinc-950 px-4 py-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-600">{label}</p>
            <p className="mt-1 text-sm font-medium text-zinc-200">{value}</p>
          </div>
        ))}
      </div>

      {course.couponCode ? (
        <p className="border-t border-white/8 px-5 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
          Coupon: <span className="text-accent">{course.couponCode}</span>
        </p>
      ) : null}

      {course.installments.length > 0 ? (
        <div className="border-t border-white/8 px-5 py-4">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Installment schedule</p>
          <div className="space-y-2">
            {course.installments.map((inst) => (
              <div
                key={inst.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/8 bg-white/2 px-3 py-2.5"
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                    Part {inst.sequence}
                  </span>
                  <span className="text-zinc-300">{formatInr(inst.amount)}</span>
                  {inst.dueDate ? (
                    <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                      <CalendarBlank size={12} aria-hidden />
                      {formatDate(String(inst.dueDate))}
                    </span>
                  ) : null}
                </div>
                <span className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] ${statusTone(inst.status)}`}>
                  {inst.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : pending.length === 0 && course.due > 0 ? (
        <div className="border-t border-white/8 px-5 py-4">
          <p className="text-sm text-zinc-400">
            Outstanding balance: <span className="font-semibold text-amber-300">{formatInr(course.due)}</span>
          </p>
        </div>
      ) : null}
    </article>
  );
}

export default function FeesPage() {
  const { studentId } = useStudentAuth();
  const { data, isLoading, isError, refetch } = useGetStudentFeesQuery(undefined, { skip: !studentId });
  const [tab, setTab] = useState<"courses" | "history">("courses");

  const payload = data?.data as
    | {
        summary?: {
          totalPaid?: number;
          totalDue?: number;
          totalOverdue?: number;
          nextDueDate?: string;
          nextDueAmount?: number;
        };
        courses?: Record<string, unknown>[];
        payments?: Record<string, unknown>[];
        remaining?: number;
      }
    | undefined;

  const summary = payload?.summary;

  const courses: CourseFee[] = useMemo(() => {
    if (!payload?.courses?.length) return [];
    return payload.courses.map((row) => ({
        enrollmentId: String(row.enrollmentId ?? ""),
        title: loc((row.course as { title?: unknown } | undefined)?.title as never) || "Course",
        feePlan: String(row.feePlan ?? "full"),
        listFee: Number(row.listFee ?? 0),
        discount: Number(row.discount ?? 0),
        couponCode: row.couponCode ? String(row.couponCode) : undefined,
        agreedFee: Number(row.agreedFee ?? 0),
        paid: Number(row.paid ?? 0),
        due: Number(row.due ?? 0),
        installments: ((row.installments as Record<string, unknown>[] | undefined) ?? []).map((inst) => ({
          id: String(inst.id ?? inst._id ?? ""),
          sequence: Number(inst.sequence ?? 0),
          amount: Number(inst.amount ?? 0),
          dueDate: inst.dueDate ? String(inst.dueDate) : undefined,
          status: String(inst.status ?? "due"),
        })),
      }));
  }, [payload?.courses]);

  const payments: PaymentRow[] = useMemo(() => {
    if (!payload?.payments?.length) return [];
    return payload.payments.map((row) => ({
        id: String(row.id ?? row._id ?? ""),
        course: loc((row.course as { title?: unknown } | undefined)?.title as never) || "Course",
        amount: Number(row.amount ?? 0),
        listFee: Number(row.listFee ?? row.amount ?? 0),
        discount: Number(row.discount ?? 0),
        couponCode: row.couponCode ? String(row.couponCode) : undefined,
        mode: String(row.mode ?? "online"),
        date: formatDate(row.createdAt ? String(row.createdAt) : undefined),
      }));
  }, [payload?.payments]);

  const totalDue = summary?.totalDue ?? payload?.remaining ?? courses.reduce((s, c) => s + c.due, 0);
  const totalPaid = summary?.totalPaid ?? courses.reduce((s, c) => s + c.paid, 0);
  const totalOverdue = summary?.totalOverdue ?? 0;
  const nextDueDate = summary?.nextDueDate ? formatDate(String(summary.nextDueDate)) : null;
  const nextDueAmount = summary?.nextDueAmount != null ? Number(summary.nextDueAmount) : null;

  return (
    <div className="mx-auto max-w-4xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
        <Tx k="st_module" />
      </p>
      <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight">
        <Tx k="st_fees_title" />
      </h1>
      <p className="mt-2 font-sans text-sm text-zinc-400">
        <Tx k="st_fees_lead" />
      </p>

      {isLoading ? (
        <div className="mt-8 space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-20 animate-pulse rounded-2xl border border-white/10 bg-white/3" />
            ))}
          </div>
          <div className="h-48 animate-pulse rounded-3xl border border-white/10 bg-white/3" />
        </div>
      ) : isError ? (
        <div className="card-surface mt-8 p-8 text-center">
          <p className="text-sm text-zinc-400">Could not load fee details. Try again later.</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-4 rounded-full border border-white/10 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-300"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Total paid" value={formatInr(totalPaid)} />
            <StatCard label="Outstanding" value={formatInr(totalDue)} accent={totalDue > 0} />
            <StatCard label="Overdue" value={formatInr(totalOverdue)} accent={totalOverdue > 0} />
            <StatCard
              label="Next due"
              value={nextDueAmount != null && nextDueAmount > 0 ? formatInr(nextDueAmount) : "Clear"}
              hint={nextDueDate && nextDueAmount ? nextDueDate : undefined}
            />
          </div>

          {totalDue > 0 ? (
            <div className="mt-4 overflow-hidden rounded-3xl border border-amber-500/25 bg-linear-to-br from-amber-500/10 via-zinc-950 to-zinc-950 p-5">
              <div className="flex items-start gap-3">
                <WarningCircle size={22} className="shrink-0 text-amber-400" aria-hidden />
                <div>
                  <p className="font-sans font-semibold text-amber-200">
                    <Tx k="st_outstanding" vars={{ amount: formatInr(totalDue) }} />
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Pay at campus or complete online checkout for pending installments. Admin can record cash payments.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTab("courses")}
              className={`cursor-pointer rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition ${
                tab === "courses"
                  ? "border-accent/40 bg-accent/15 text-accent"
                  : "border-white/10 bg-white/3 text-zinc-400 hover:border-white/20"
              }`}
            >
              Course-wise ({courses.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("history")}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition ${
                tab === "history"
                  ? "border-accent/40 bg-accent/15 text-accent"
                  : "border-white/10 bg-white/3 text-zinc-400 hover:border-white/20"
              }`}
            >
              <Receipt size={12} aria-hidden />
              Payment history ({payments.length})
            </button>
          </div>

          {tab === "courses" ? (
            courses.length === 0 ? (
              <div className="card-surface mt-6 p-10 text-center">
                <CurrencyInr size={36} className="mx-auto text-zinc-600" aria-hidden />
                <p className="mt-4 font-sans text-lg font-semibold">No enrolled courses with fees</p>
                <p className="mt-2 text-sm text-zinc-400">Fee details appear after you enroll in a course.</p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {courses.map((course) => (
                  <CourseFeeCard key={course.enrollmentId} course={course} />
                ))}
              </div>
            )
          ) : payments.length === 0 ? (
            <div className="card-surface mt-6 p-10 text-center">
              <Receipt size={32} className="mx-auto text-zinc-600" aria-hidden />
              <p className="mt-4 text-sm text-zinc-400">No payments recorded yet.</p>
            </div>
          ) : (
            <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
              <header className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
                <Receipt size={16} className="text-accent" aria-hidden />
                <h2 className="font-sans text-sm font-semibold">Payment history</h2>
              </header>
              <div>
                {payments.map((row) => (
                  <div
                    key={row.id}
                    className="flex flex-col gap-2 border-b border-white/5 px-4 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-sans text-sm font-medium text-zinc-100">{row.course}</p>
                      <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
                        <span className="inline-flex items-center gap-1">
                          <CalendarBlank size={12} aria-hidden />
                          {row.date}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} aria-hidden />
                          {row.mode}
                        </span>
                        <span className="font-mono">{row.id}</span>
                      </p>
                      {row.discount > 0 ? (
                        <p className="mt-1 text-xs text-emerald-400">
                          Discount {formatInr(row.discount)}
                          {row.couponCode ? ` · ${row.couponCode}` : ""}
                        </p>
                      ) : null}
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-sans text-lg font-semibold text-accent">{formatInr(row.amount)}</p>
                      {row.listFee > row.amount ? (
                        <p className="text-xs text-zinc-500 line-through">{formatInr(row.listFee)}</p>
                      ) : null}
                      <span className="mt-1 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-emerald-300">
                        Paid
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
