"use client";

import { useMemo, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useI18n } from "@/components/providers/I18nProvider";
import { selectClass } from "@/components/ui/ui";
import {
  ATTENDANCE_LOG,
  DEMO_STUDENT,
  type AttendanceRow,
  type AttendanceStatus,
} from "@/lib/student-data";
import type { MessageKey } from "@/lib/i18n";
import { useGetStudentAttendanceQuery, useGetStudentDashboardQuery } from "@/lib/api";
import { loc } from "@/lib/loc";
import { useStudentAuth } from "@/components/providers/StudentAuth";

const WEEKDAYS: MessageKey[] = [
  "st_wd_sun",
  "st_wd_mon",
  "st_wd_tue",
  "st_wd_wed",
  "st_wd_thu",
  "st_wd_fri",
  "st_wd_sat",
];

const STATUS_STYLE: Record<AttendanceStatus, string> = {
  present: "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30",
  late: "bg-accent/15 text-accent ring-accent/35",
  absent: "bg-red-400/15 text-red-300 ring-red-400/30",
};

const STATUS_DOT: Record<AttendanceStatus, string> = {
  present: "bg-emerald-400",
  late: "bg-accent",
  absent: "bg-red-400",
};

const STATUS_LABEL: Record<AttendanceStatus, MessageKey> = {
  present: "st_present",
  late: "st_late",
  absent: "st_absent",
};

function monthKey(date: string) {
  return date.slice(0, 7);
}

function parseMonth(value: string) {
  const [year, month] = value.split("-").map(Number);
  return { year, month: month - 1 };
}

function formatIsoDay(year: number, month: number, day: number) {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function dayStatus(rows: AttendanceRow[]): AttendanceStatus | null {
  if (!rows.length) return null;
  if (rows.some((row) => row.status === "absent")) return "absent";
  if (rows.some((row) => row.status === "late")) return "late";
  return "present";
}

export function AttendanceView() {
  const { t, locale } = useI18n();
  const { studentId } = useStudentAuth();
  const localeTag = locale === "hi" ? "hi-IN" : locale === "mr" ? "mr-IN" : "en-IN";
  const { data } = useGetStudentAttendanceQuery(undefined, { skip: !studentId });
  const { data: dash } = useGetStudentDashboardQuery(undefined, { skip: !studentId });

  const log = useMemo<AttendanceRow[]>(() => {
    if (!data?.data?.length) return ATTENDANCE_LOG;
    return data.data.map((row) => ({
      date: String(row.date ?? "").slice(0, 10),
      course: loc((row.course as { title?: unknown } | undefined)?.title as never) || "Course",
      status: (["present", "late", "absent"].includes(String(row.status))
        ? row.status
        : "present") as AttendanceStatus,
    }));
  }, [data]);

  const courseCards = useMemo(() => {
    const enrollments = (dash?.data?.enrollments as Record<string, unknown>[] | undefined) ?? [];
    if (enrollments.length) {
      return enrollments.map((row) => {
        const title = loc((row.course as { title?: unknown } | undefined)?.title as never) || "Course";
        const rows = log.filter((item) => item.course === title);
        const presentish = rows.filter((item) => item.status !== "absent").length;
        return {
          slug: String((row.course as { slug?: string } | undefined)?.slug ?? title),
          title,
          attendance: rows.length ? Math.round((presentish / rows.length) * 100) : Number(dash?.data?.attendancePercent ?? 0),
        };
      });
    }
    return DEMO_STUDENT.courses;
  }, [dash, log]);

  const months = useMemo(() => {
    const unique = [...new Set(log.map((row) => monthKey(row.date)).filter(Boolean))];
    return unique.sort();
  }, [log]);

  const [month, setMonth] = useState("");
  const [course, setCourse] = useState("all");
  const activeMonth = month && months.includes(month) ? month : (months[months.length - 1] ?? "2026-08");

  const courses = useMemo(() => [...new Set(log.map((row) => row.course))], [log]);

  const monthIndex = months.indexOf(activeMonth);
  const { year, month: monthNum } = parseMonth(activeMonth);

  const filtered = useMemo(
    () =>
      log.filter(
        (row) =>
          monthKey(row.date) === activeMonth && (course === "all" || row.course === course),
      ),
    [log, activeMonth, course],
  );

  const byDate = useMemo(() => {
    const map = new Map<string, AttendanceRow[]>();
    for (const row of filtered) {
      const list = map.get(row.date) ?? [];
      list.push(row);
      map.set(row.date, list);
    }
    return map;
  }, [filtered]);

  const present = filtered.filter((row) => row.status === "present").length;
  const late = filtered.filter((row) => row.status === "late").length;
  const absent = filtered.filter((row) => row.status === "absent").length;
  const rate = filtered.length ? Math.round(((present + late) / filtered.length) * 100) : 0;

  const firstWeekday = new Date(year, monthNum, 1).getDay();
  const daysInMonth = new Date(year, monthNum + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthLabel = new Date(year, monthNum, 1).toLocaleDateString(localeTag, {
    month: "long",
    year: "numeric",
  });

  const todayIso = formatIsoDay(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
  );

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-sans text-3xl font-semibold tracking-tight">{t("st_att_title")}</h1>
      <p className="mt-2 font-sans text-sm text-zinc-400">{t("st_att_lead")}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {courseCards.map((item) => (
          <article key={item.slug} className="card-surface p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              {item.title}
            </p>
            <p className="mt-2 font-sans text-2xl font-semibold">{item.attendance}%</p>
          </article>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="sr-only" htmlFor="att-month">
          {t("st_att_month")}
        </label>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            aria-label={t("st_att_prev_month")}
            disabled={monthIndex <= 0}
            onClick={() => setMonth(months[monthIndex - 1])}
            className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-zinc-900 text-foreground transition-colors duration-200 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CaretLeft size={18} weight="bold" />
          </button>
          <select
            id="att-month"
            value={activeMonth}
            onChange={(e) => setMonth(e.target.value)}
            className={selectClass}
          >
            {months.map((value) => {
              const parsed = parseMonth(value);
              const label = new Date(parsed.year, parsed.month, 1).toLocaleDateString(
                localeTag,
                { month: "long", year: "numeric" },
              );
              return (
                <option key={value} value={value}>
                  {label}
                </option>
              );
            })}
          </select>
          <button
            type="button"
            aria-label={t("st_att_next_month")}
            disabled={monthIndex >= months.length - 1}
            onClick={() => setMonth(months[monthIndex + 1])}
            className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-zinc-900 text-foreground transition-colors duration-200 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CaretRight size={18} weight="bold" />
          </button>
        </div>
        <select
          aria-label={t("st_att_all_courses")}
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          className={`sm:max-w-56 ${selectClass}`}
        >
          <option value="all">{t("st_att_all_courses")}</option>
          {courses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        {[
          { label: t("st_att_this_month"), value: monthLabel },
          { label: t("st_present"), value: String(present) },
          { label: t("st_late"), value: String(late) },
          { label: t("st_absent"), value: String(absent) },
        ].map((card) => (
          <article key={card.label} className="card-surface p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              {card.label}
            </p>
            <p className="mt-2 font-sans text-lg font-semibold capitalize">{card.value}</p>
          </article>
        ))}
      </div>

      <section className="card-surface mt-6 p-4 md:p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
              {t("st_att_month")}
            </p>
            <h2 className="mt-1 font-sans text-xl font-semibold capitalize">{monthLabel}</h2>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">
            {t("st_att_rate")} {rate}% · {filtered.length} {t("st_att_sessions")}
          </p>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center md:gap-2">
          {WEEKDAYS.map((day) => (
            <p
              key={day}
              className="pb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500"
            >
              {t(day)}
            </p>
          ))}
          {cells.map((day, index) => {
            if (!day) {
              return <div key={`pad-${index}`} className="min-h-16 md:min-h-20" />;
            }

            const iso = formatIsoDay(year, monthNum, day);
            const rows = byDate.get(iso) ?? [];
            const status = dayStatus(rows);
            const isToday = iso === todayIso;

            return (
              <div
                key={iso}
                className={`flex min-h-16 flex-col items-center justify-between rounded-2xl px-1 py-2 ring-1 md:min-h-20 ${
                  status
                    ? STATUS_STYLE[status]
                    : "bg-white/[0.02] text-zinc-600 ring-white/8"
                } ${isToday ? "ring-2 ring-accent" : ""}`}
              >
                <span className="font-mono text-[11px]">
                  {day}
                  {isToday ? (
                    <span className="ml-1 hidden text-[8px] uppercase tracking-[0.12em] text-accent md:inline">
                      {t("st_att_today")}
                    </span>
                  ) : null}
                </span>
                {status ? (
                  <div className="flex items-center gap-1">
                    {rows.map((row) => (
                      <span
                        key={`${row.date}-${row.course}`}
                        title={`${row.course} · ${t(STATUS_LABEL[row.status])}`}
                        className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[row.status]}`}
                      />
                    ))}
                  </div>
                ) : (
                  <span className="hidden font-mono text-[8px] uppercase tracking-[0.12em] md:inline">
                    {t("st_att_no_class")}
                  </span>
                )}
                {status ? (
                  <span className="font-mono text-[8px] uppercase tracking-[0.12em]">
                    {t(STATUS_LABEL[status])}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">
          {(["present", "late", "absent"] as const).map((status) => (
            <span key={status} className="inline-flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`} />
              {t(STATUS_LABEL[status])}
            </span>
          ))}
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-zinc-600" />
            {t("st_att_no_class")}
          </span>
        </div>
      </section>
    </div>
  );
}
