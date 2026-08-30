"use client";

import { CERTIFICATES } from "@/lib/student-data";
import { useGetStudentDashboardQuery } from "@/lib/api";
import { loc } from "@/lib/loc";
import { useStudentAuth } from "@/components/providers/StudentAuth";

export default function CertificatesPage() {
  const { studentId } = useStudentAuth();
  const { data } = useGetStudentDashboardQuery(undefined, { skip: !studentId });
  const enrollments = (data?.data?.enrollments as Record<string, unknown>[] | undefined) ?? [];
  const items = enrollments.length
    ? enrollments.map((row) => ({
        id: String(row._id),
        title: loc((row.course as { title?: unknown } | undefined)?.title as never) || "Course",
        issued: row.updatedAt ? String(row.updatedAt).slice(0, 10) : "In progress",
        kind: Number(row.progress ?? 0) >= 100 ? "Course" : "In progress",
      }))
    : CERTIFICATES;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-sans text-3xl font-semibold tracking-tight">Certificates</h1>
      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="card-surface flex items-center justify-between p-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">{item.kind}</p>
              <p className="mt-1 font-sans text-lg font-semibold">{item.title}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Issued {item.issued}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
