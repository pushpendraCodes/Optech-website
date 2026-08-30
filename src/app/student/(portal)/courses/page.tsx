"use client";

import Link from "next/link";
import { DEMO_STUDENT } from "@/lib/student-data";
import { useGetStudentDashboardQuery } from "@/lib/api";
import { loc } from "@/lib/loc";
import { useStudentAuth } from "@/components/providers/StudentAuth";

export default function StudentCoursesPage() {
  const { studentId } = useStudentAuth();
  const { data } = useGetStudentDashboardQuery(undefined, { skip: !studentId });
  const pct = Number(data?.data?.attendancePercent ?? 0);
  const enrollments = (data?.data?.enrollments as Record<string, unknown>[] | undefined) ?? [];
  const courses = enrollments.length
    ? enrollments.map((row) => {
        const course = row.course as { title?: unknown; slug?: string } | undefined;
        const batch = row.batch as { timing?: string; label?: string } | undefined;
        return {
          slug: course?.slug || String(row._id),
          title: loc(course?.title as never) || "Course",
          progress: Number(row.progress ?? 0),
          attendance: pct,
          nextClass: batch?.timing || batch?.label || "",
        };
      })
    : DEMO_STUDENT.courses;

  return (
    <div className="mx-auto max-w-[1400px]">
      <h1 className="font-sans text-3xl font-semibold tracking-tight">My courses</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {courses.map((course) => (
          <article key={course.slug} className="card-surface p-6">
            <h2 className="font-sans text-xl font-semibold">{course.title}</h2>
            <p className="mt-2 font-sans text-sm text-zinc-400">
              Progress {course.progress}% · Attendance {course.attendance}%
            </p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              Next · {course.nextClass || "See live classes"}
            </p>
            <div className="mt-4 flex gap-4">
              <Link href="/student/notes" className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                Notes
              </Link>
              <Link href="/student/live" className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                Live class
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
