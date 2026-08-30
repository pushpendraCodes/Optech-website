"use client";

import { FEE_HISTORY } from "@/lib/student-data";
import { formatInr } from "@/lib/catalog";
import { useGetStudentFeesQuery } from "@/lib/api";
import { loc } from "@/lib/loc";
import { useStudentAuth } from "@/components/providers/StudentAuth";

export default function FeesPage() {
  const { studentId } = useStudentAuth();
  const { data } = useGetStudentFeesQuery(undefined, { skip: !studentId });
  const payload = data?.data as
    | { payments?: Record<string, unknown>[]; dues?: Record<string, unknown>[]; remaining?: number }
    | undefined;

  const rows = payload
    ? [
        ...(payload.payments ?? []).map((row) => ({
          id: String(row._id ?? ""),
          course: loc((row.course as { title?: unknown } | undefined)?.title as never) || "Course",
          amount: Number(row.amount ?? 0),
          status: "paid" as const,
          date: row.createdAt ? String(row.createdAt).slice(0, 10) : "",
          mode: String(row.mode ?? "online"),
        })),
        ...(payload.dues ?? []).map((row) => ({
          id: `due-${row._id ?? row.sequence}`,
          course: `Installment ${String(row.sequence ?? "")}`.trim(),
          amount: Number(row.amount ?? 0),
          status: String(row.status ?? "due") === "paid" ? ("paid" as const) : ("due" as const),
          date: row.dueDate ? String(row.dueDate).slice(0, 10) : "",
          mode: "Installment",
        })),
      ]
    : FEE_HISTORY;

  const due = rows.filter((f) => f.status === "due");
  const outstanding = payload?.remaining ?? due.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-sans text-3xl font-semibold tracking-tight">Fee history</h1>
      <p className="mt-2 font-sans text-sm text-zinc-400">
        Online and campus cash entries. Parent WhatsApp reminders are triggered by admin when a row is due.
      </p>
      {due.length ? (
        <div className="card-surface mt-6 border-accent/30 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Due</p>
          <p className="mt-2 font-sans text-xl font-semibold">{formatInr(outstanding)} outstanding</p>
        </div>
      ) : null}
      <ul className="mt-6 space-y-3">
        {rows.map((row) => (
          <li key={row.id} className="card-surface flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <p className="font-sans text-sm font-medium">
                {row.course} · {row.id}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                {row.date} · {row.mode}
              </p>
            </div>
            <div className="text-right">
              <p className="font-sans text-sm">{formatInr(row.amount)}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">{row.status}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
