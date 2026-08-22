import Link from "next/link";
import { DEMO_STUDENT } from "@/lib/student-data";

export const metadata = { title: "My courses" };

export default function StudentCoursesPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <h1 className="font-sans text-3xl font-semibold tracking-tight">My courses</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {DEMO_STUDENT.courses.map((course) => (
          <article key={course.slug} className="card-surface p-6">
            <h2 className="font-sans text-xl font-semibold">{course.title}</h2>
            <p className="mt-2 font-sans text-sm text-zinc-400">
              Progress {course.progress}% · Attendance {course.attendance}%
            </p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              Next · {course.nextClass}
            </p>
            <div className="mt-4 flex gap-4">
              <Link href="/student/notes" className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                Notes
              </Link>
              <Link href="/live" className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                Live class
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
