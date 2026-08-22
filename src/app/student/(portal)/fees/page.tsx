import { FEE_HISTORY } from "@/lib/student-data";
import { formatInr } from "@/lib/catalog";

export const metadata = { title: "Fees" };

export default function FeesPage() {
  const due = FEE_HISTORY.filter((f) => f.status === "due");
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-sans text-3xl font-semibold tracking-tight">Fee history</h1>
      <p className="mt-2 font-sans text-sm text-zinc-400">
        Online and campus cash entries. Parent WhatsApp reminders are triggered by admin when a row is due.
      </p>
      {due.length ? (
        <div className="card-surface mt-6 border-accent/30 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Due</p>
          <p className="mt-2 font-sans text-xl font-semibold">
            {formatInr(due.reduce((s, r) => s + r.amount, 0))} outstanding
          </p>
        </div>
      ) : null}
      <ul className="mt-6 space-y-3">
        {FEE_HISTORY.map((row) => (
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
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                {row.status}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
