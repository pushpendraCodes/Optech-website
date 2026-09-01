"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BookOpen,
  CaretDown,
  ChartLine,
  Clock,
  GraduationCap,
  House,
  MagnifyingGlass,
  Note,
  PlayCircle,
  Question,
  Certificate,
} from "@phosphor-icons/react";
import { Tx } from "@/components/i18n/Tx";
import { useGetStudentDashboardQuery } from "@/lib/api";
import { loc } from "@/lib/loc";
import { useStudentAuth } from "@/components/providers/StudentAuth";
import { btnGhost, btnPrimary } from "@/components/ui/ui";

type CourseItem = {
  id: string;
  slug: string;
  title: string;
  progress: number;
  attendance: number;
  batchLabel: string;
  batchTiming: string;
  duration: string;
  mode: string;
};

type FilterKey = "all" | "active" | "completed";

function ProgressRing({ value, size = 72 }: { value: number; size?: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-sm font-medium text-accent">
        {pct}%
      </span>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/3 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className="mt-2 font-sans text-2xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
    </article>
  );
}

function CourseCard({
  course,
  expanded,
  onToggle,
}: {
  course: CourseItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  const status =
    course.progress >= 100 ? "Completed" : course.progress >= 50 ? "In progress" : "Getting started";
  const statusTone =
    course.progress >= 100
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : course.progress >= 50
        ? "border-accent/30 bg-accent/10 text-accent"
        : "border-sky-500/30 bg-sky-500/10 text-sky-300";

  const actions = [
    { href: "/student/notes", label: "Notes", icon: Note },
    { href: "/student/live", label: "Live class", icon: PlayCircle },
    { href: "/student/quizzes", label: "Quizzes", icon: Question },
    { href: "/student/attendance", label: "Attendance", icon: ChartLine },
    { href: "/student/certificates", label: "Certificate", icon: Certificate },
  ];

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 transition hover:border-accent/25">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,162,47,0.1),transparent_55%)] opacity-0 transition group-hover:opacity-100" />
      <button
        type="button"
        onClick={onToggle}
        className="relative flex w-full cursor-pointer flex-col gap-5 p-6 text-left md:flex-row md:items-center"
      >
        <ProgressRing value={course.progress} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] ${statusTone}`}>
              {status}
            </span>
            {course.batchLabel ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-400">
                {course.batchLabel}
              </span>
            ) : null}
          </div>
          <h2 className="mt-2 font-sans text-xl font-semibold tracking-tight">{course.title}</h2>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-400">
            {course.batchTiming ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} className="text-zinc-500" aria-hidden />
                {course.batchTiming}
              </span>
            ) : null}
            {course.duration ? (
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap size={14} className="text-zinc-500" aria-hidden />
                {course.duration}
              </span>
            ) : null}
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-accent transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(0, course.progress))}%` }}
            />
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3 md:pl-2">
          <div className="text-right">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              <Tx k="st_att_label" />
            </p>
            <p className="font-sans text-lg font-semibold text-zinc-200">{course.attendance}%</p>
          </div>
          <CaretDown
            size={18}
            className={`text-zinc-500 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            aria-hidden
          />
        </div>
      </button>

      <div
        className={`grid transition-all duration-300 ease-out ${
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-white/8 px-6 pb-6 pt-2">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              Quick actions
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {actions.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href + label}
                  href={href}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/3 px-3 py-4 text-center transition hover:border-accent/30 hover:bg-accent/5"
                >
                  <Icon size={20} className="text-accent" aria-hidden />
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-400">{label}</span>
                </Link>
              ))}
            </div>
            {course.slug ? (
              <Link
                href={`/courses/${course.slug}`}
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
              >
                <BookOpen size={14} aria-hidden />
                View course on website
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function StudentCoursesPage() {
  const { studentId } = useStudentAuth();
  const { data, isLoading } = useGetStudentDashboardQuery(undefined, { skip: !studentId });
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const attendancePct = Number(data?.data?.attendancePercent ?? 0);
  const enrollments = (data?.data?.enrollments as Record<string, unknown>[] | undefined) ?? [];

  const courses: CourseItem[] = useMemo(() => {
    return enrollments.map((row) => {
      const course = row.course as
        | { title?: unknown; slug?: string; duration?: string; mode?: string }
        | undefined;
      const batch = row.batch as { timing?: string; label?: string } | undefined;
      return {
        id: String(row._id ?? course?.slug ?? "course"),
        slug: course?.slug || String(row._id),
        title: loc(course?.title as never) || "Course",
        progress: Number(row.progress ?? 0),
        attendance: attendancePct,
        batchLabel: batch?.label || "",
        batchTiming: batch?.timing || "",
        duration: course?.duration || "",
        mode: course?.mode || "",
      };
    });
  }, [enrollments, attendancePct]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesSearch =
        !q ||
        course.title.toLowerCase().includes(q) ||
        course.batchLabel.toLowerCase().includes(q) ||
        course.batchTiming.toLowerCase().includes(q);
      const matchesFilter =
        filter === "all" ||
        (filter === "completed" && course.progress >= 100) ||
        (filter === "active" && course.progress < 100);
      return matchesSearch && matchesFilter;
    });
  }, [courses, filter, search]);

  const avgProgress =
    courses.length > 0
      ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length)
      : 0;

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "In progress" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
        <Tx k="st_module" />
      </p>
      <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight">
        <Tx k="st_my_courses" />
      </h1>
      <p className="mt-2 font-sans text-sm text-zinc-400">
        Track progress, batch timing, and jump to notes, live classes, quizzes, and certificates.
      </p>

      {isLoading ? (
        <div className="mt-8 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-24 animate-pulse rounded-2xl border border-white/10 bg-white/3" />
            ))}
          </div>
          <div className="h-48 animate-pulse rounded-3xl border border-white/10 bg-white/3" />
        </div>
      ) : courses.length === 0 ? (
        <div className="card-surface mt-8 flex flex-col items-center gap-4 p-10 text-center">
          <BookOpen size={36} className="text-zinc-600" aria-hidden />
          <p className="font-sans text-lg font-semibold">No courses enrolled yet</p>
          <p className="max-w-sm text-sm text-zinc-400">
            Browse our catalog and enroll to see your courses, progress, and study materials here.
          </p>
          <Link href="/courses" className={btnPrimary}>
            <House size={14} aria-hidden />
            Browse courses
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <StatCard label="Enrolled" value={String(courses.length)} hint="Active admissions" />
            <StatCard label="Avg progress" value={`${avgProgress}%`} hint="Across all courses" />
            <StatCard label="Attendance" value={`${attendancePct}%`} hint="Overall this term" />
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {filters.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={`cursor-pointer rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition ${
                    filter === key
                      ? "border-accent/40 bg-accent/15 text-accent"
                      : "border-white/10 bg-white/3 text-zinc-400 hover:border-white/20 hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="relative block w-full sm:max-w-xs">
              <MagnifyingGlass
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                aria-hidden
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="w-full rounded-2xl border border-white/10 bg-zinc-900 py-2.5 pl-10 pr-4 font-sans text-sm text-foreground outline-none transition focus:border-accent/40 focus:ring-2 focus:ring-accent/20"
              />
            </label>
          </div>

          {filtered.length === 0 ? (
            <div className="card-surface mt-6 p-8 text-center">
              <p className="text-sm text-zinc-400">No courses match your search or filter.</p>
              <button
                type="button"
                className={`${btnGhost} mt-4`}
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="relative mt-6 space-y-4">
              {filtered.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  expanded={expandedId === course.id}
                  onToggle={() => setExpandedId((prev) => (prev === course.id ? null : course.id))}
                />
              ))}
            </div>
          )}

          <section className="mt-8 overflow-hidden rounded-3xl border border-accent/20 bg-linear-to-br from-accent/10 via-zinc-950 to-zinc-950 p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Need another course?</p>
            <p className="mt-2 font-sans text-sm text-zinc-400">
              Explore new batches on the public catalog or ask campus staff about add-on enrollments.
            </p>
            <Link href="/courses" className={`${btnGhost} mt-4`}>
              <BookOpen size={14} aria-hidden />
              View all courses
            </Link>
          </section>
        </>
      )}
    </div>
  );
}
