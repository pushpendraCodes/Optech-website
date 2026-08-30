"use client";

import { DEMO_STUDENT } from "@/lib/student-data";
import { INSTITUTE } from "@/lib/optech";
import { btnGhost } from "@/components/ui/ui";
import { useGetStudentIdCardQuery } from "@/lib/api";
import { useStudentAuth } from "@/components/providers/StudentAuth";

export default function IdCardPage() {
  const { studentId, name } = useStudentAuth();
  const { data } = useGetStudentIdCardQuery(undefined, { skip: !studentId });
  const card = data?.data as
    | { name?: string; studentCode?: string; roll?: string; course?: string; validTill?: string; pdf?: string }
    | undefined;
  const displayName = card?.name || name || DEMO_STUDENT.name;
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const downloadPdf = () => {
    if (!card?.pdf) {
      window.print();
      return;
    }
    const bytes = Uint8Array.from(atob(card.pdf), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${card.studentCode || "id-card"}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-sans text-3xl font-semibold tracking-tight">Digital ID card</h1>
      <p className="mt-2 font-sans text-sm text-zinc-400">
        Auto-generated on admission. QR is ready for future attendance scan.
      </p>
      <article className="card-surface mt-6 overflow-hidden">
        <div className="border-b border-white/8 bg-accent/10 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
          {INSTITUTE.name} · Student ID
        </div>
        <div className="flex gap-4 p-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] font-mono text-lg text-accent">
            {initials}
          </div>
          <div>
            <p className="font-sans text-xl font-semibold">{displayName}</p>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-400">
              {card?.roll || DEMO_STUDENT.roll} · {card?.course || DEMO_STUDENT.courses[0].title}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              Valid till {card?.validTill || DEMO_STUDENT.validTill}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-white/8 px-5 py-4">
          <div className="grid grid-cols-5 gap-1" aria-hidden>
            {Array.from({ length: 25 }).map((_, i) => (
              <span key={i} className={`h-2 w-2 ${i % 3 === 0 ? "bg-foreground" : "bg-transparent"}`} />
            ))}
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            {card?.studentCode || studentId || DEMO_STUDENT.id}
          </p>
        </div>
      </article>
      <button type="button" className={`${btnGhost} mt-5`} onClick={downloadPdf}>
        Download PDF / image
      </button>
    </div>
  );
}
