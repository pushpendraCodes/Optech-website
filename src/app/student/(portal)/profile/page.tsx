"use client";

import { DEMO_STUDENT } from "@/lib/student-data";
import { useGetStudentDashboardQuery, useGetStudentProfileQuery } from "@/lib/api";
import { loc } from "@/lib/loc";
import { useStudentAuth } from "@/components/providers/StudentAuth";

export default function ProfilePage() {
  const { studentId, name } = useStudentAuth();
  const { data } = useGetStudentProfileQuery(undefined, { skip: !studentId });
  const { data: dash } = useGetStudentDashboardQuery(undefined, { skip: !studentId });
  const profile = data?.data as
    | {
        studentCode?: string;
        rollNumber?: string;
        parentPhone?: string;
        referralCode?: string;
        validTill?: string;
        user?: { name?: string; email?: string; phone?: string };
        batch?: { label?: string };
      }
    | undefined;
  const enrollments = (dash?.data?.enrollments as Record<string, unknown>[] | undefined) ?? [];
  const courses = enrollments
    .map((row) => loc((row.course as { title?: unknown } | undefined)?.title as never))
    .filter(Boolean)
    .join(", ");
  const displayName = profile?.user?.name || name || DEMO_STUDENT.name;
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const rows = [
    ["Student ID", profile?.studentCode || DEMO_STUDENT.id],
    ["Roll no.", profile?.rollNumber || DEMO_STUDENT.roll],
    ["Email", profile?.user?.email || DEMO_STUDENT.email],
    ["Phone", profile?.user?.phone || DEMO_STUDENT.phone],
    ["Parent phone", profile?.parentPhone || DEMO_STUDENT.parentPhone],
    ["Batch", profile?.batch?.label || DEMO_STUDENT.batch],
    ["Courses", courses || DEMO_STUDENT.courses.map((c) => c.title).join(", ")],
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-sans text-3xl font-semibold tracking-tight">Profile</h1>
      <div className="card-surface mt-6 flex flex-col gap-6 p-6 md:flex-row">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-accent/10 font-mono text-xl text-accent">
          {initials}
        </div>
        <dl className="grid flex-1 gap-3 sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{k}</dt>
              <dd className="mt-1 font-sans text-sm">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
