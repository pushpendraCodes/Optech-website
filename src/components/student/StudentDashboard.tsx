"use client";

import Link from "next/link";
import {
  ATTENDANCE_LOG,
  DEMO_STUDENT,
  FEE_HISTORY,
  QUIZZES,
  STUDENT_NOTIFICATIONS,
} from "@/lib/student-data";
import { NOTICES } from "@/lib/site-content";
import { Tx } from "@/components/i18n/Tx";
import { useGetStudentDashboardQuery, useGetStudentNoticesQuery } from "@/lib/api";
import { loc } from "@/lib/loc";
import { useStudentAuth } from "@/components/providers/StudentAuth";

export function StudentDashboard() {
  const { name, studentId } = useStudentAuth();
  const { data } = useGetStudentDashboardQuery(undefined, { skip: !studentId });
  const { data: noticeRes } = useGetStudentNoticesQuery(undefined, { skip: !studentId });
  const dash = data?.data;
  const board = (noticeRes?.data ?? []).slice(0, 3).map((row) => ({
    id: String(row._id ?? ""),
    title: loc(row.title as never),
    category: String(row.category ?? ""),
    date: row.createdAt ? String(row.createdAt).slice(0, 10) : "",
  }));
  const student = dash?.student as { user?: { name?: string } } | undefined;
  const enrollments = (dash?.enrollments as Record<string, unknown>[] | undefined) ?? [];
  const attendancePercent = Number(dash?.attendancePercent ?? 0);
  const unread = Number(dash?.unread ?? 0);
  const displayName = student?.user?.name || name || DEMO_STUDENT.name;
  const due = FEE_HISTORY.find((f) => f.status === "due");
  const present = ATTENDANCE_LOG.filter((a) => a.status === "present").length;
  const fallbackPct = Math.round((present / ATTENDANCE_LOG.length) * 100);
  const pct = dash ? attendancePercent : fallbackPct;

  return (
    <div className="mx-auto max-w-[1400px]">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
        <Tx k="st_module" />
      </p>
      <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight">
        <Tx k="st_welcome" vars={{ name: displayName }} />
      </h1>
      <p className="mt-2 font-sans text-sm text-zinc-400">
        <Tx k="st_dash_lead" />
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "st_att_label" as const, value: `${pct}%` },
          { label: "st_due_label" as const, value: due ? `₹${due.amount.toLocaleString("en-IN")}` : null },
          { label: "st_exam_label" as const, value: String(QUIZZES.filter((q) => q.open).length) },
          {
            label: "st_unread" as const,
            value: String(dash ? unread : STUDENT_NOTIFICATIONS.filter((n) => n.unread).length),
          },
        ].map((card) => (
          <article key={card.label} className="card-surface p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              <Tx k={card.label} />
            </p>
            <p className="mt-2 font-sans text-2xl font-semibold">
              {card.value ?? <Tx k="st_due_clear" />}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="card-surface p-5">
          <h2 className="font-sans text-lg font-semibold">
            <Tx k="st_enrolled" />
          </h2>
          <ul className="mt-4 space-y-4">
            {(enrollments.length
              ? enrollments.map((row) => {
                  const course = row.course as { title?: unknown; slug?: string } | undefined;
                  return {
                    slug: course?.slug || String(row._id),
                    title: loc(course?.title as never) || "Course",
                    progress: Number(row.progress ?? 0),
                    attendance: pct,
                    nextClass: String((row.batch as { timing?: string } | undefined)?.timing ?? ""),
                  };
                })
              : DEMO_STUDENT.courses
            ).map((course) => (
              <li key={course.slug}>
                <div className="flex justify-between gap-3">
                  <p className="font-sans text-sm font-medium">{course.title}</p>
                  <span className="font-mono text-[10px] text-accent">{course.progress}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-accent" style={{ width: `${course.progress}%` }} />
                </div>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                  <Tx k="st_att_label" /> {course.attendance}% · {course.nextClass}
                </p>
              </li>
            ))}
          </ul>
        </article>

        <article className="card-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-lg font-semibold">
              <Tx k="st_board" />
            </h2>
            <Link href="/notices" className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
              <Tx k="st_public_board" />
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {(board.length ? board : NOTICES.slice(0, 3)).map((notice) => (
              <li key={notice.id} className="border-b border-white/5 pb-3 last:border-0">
                <p className="font-sans text-sm font-medium">{notice.title}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                  {notice.category} · {notice.date}
                </p>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  );
}
