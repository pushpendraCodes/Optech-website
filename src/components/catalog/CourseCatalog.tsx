"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, MagnifyingGlass, Star } from "@phosphor-icons/react";
import {
  COURSE_CATEGORIES,
  COURSES,
  FEE_RANGES,
  formatInr,
  type CourseMode,
  type CourseTag,
} from "@/lib/catalog";
import { fieldClass, selectClass } from "@/components/ui/ui";
import { useI18n } from "@/components/providers/I18nProvider";

export function CourseCatalog() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [fee, setFee] = useState("any");
  const [mode, setMode] = useState<"all" | CourseMode>("all");
  const [tag, setTag] = useState<"all" | CourseTag>("all");

  const results = useMemo(() => {
    const range = FEE_RANGES.find((item) => item.id === fee) ?? FEE_RANGES[0];
    return COURSES.filter((course) => {
      const hay = `${course.title} ${course.body} ${course.category}`.toLowerCase();
      const matchQuery = hay.includes(query.trim().toLowerCase());
      const matchCat = category === "all" || course.category === category;
      const matchFee = course.fee >= range.min && course.fee <= range.max;
      const matchMode = mode === "all" || course.mode === mode;
      const matchTag = tag === "all" || course.tags.includes(tag);
      return matchQuery && matchCat && matchFee && matchMode && matchTag;
    });
  }, [query, category, fee, mode, tag]);

  return (
    <section className="px-6 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-[1400px]">
        <div className="card-surface mb-8 grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-5">
          <label className="relative lg:col-span-2">
            <span className="sr-only">{t("courses_search")}</span>
            <MagnifyingGlass
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("courses_search_ph")}
              className={`${fieldClass} pl-10`}
            />
          </label>
          <select
            aria-label={t("courses_category")}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={selectClass}
          >
            <option value="all">{t("courses_all_cat")}</option>
            {COURSE_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            aria-label={t("courses_fee")}
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            className={selectClass}
          >
            {FEE_RANGES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <select
            aria-label={t("courses_mode")}
            value={mode}
            onChange={(e) => setMode(e.target.value as typeof mode)}
            className={selectClass}
          >
            <option value="all">{t("courses_mode_all")}</option>
            <option value="offline">{t("courses_offline")}</option>
            <option value="online">{t("courses_online")}</option>
          </select>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {(
            [
              ["all", "courses_all"],
              ["Popular", "courses_popular"],
              ["New", "courses_new"],
              ["Trending", "courses_trending"],
            ] as const
          ).map(([item, key]) => (
            <button
              key={item}
              type="button"
              aria-pressed={tag === item}
              onClick={() => setTag(item)}
              className={`cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-200 ${
                tag === item
                  ? "border-accent/40 bg-accent/15 text-accent"
                  : "border-white/10 text-zinc-400 hover:text-foreground"
              }`}
            >
              {t(key)}
            </button>
          ))}
        </div>

        <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
          {t(results.length === 1 ? "courses_count" : "courses_count_plural", {
            n: results.length,
          })}
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((course) => (
            <article
              key={course.slug}
              className="card-surface flex h-full flex-col gap-5 p-6 transition-colors duration-200 hover:border-white/15"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
                  {course.tags[0] ?? course.badge}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  {course.mode === "online" ? t("courses_online") : t("courses_offline")} · {course.level}
                </span>
              </div>
              <div className="flex h-28 items-end rounded-2xl border border-white/8 bg-[radial-gradient(circle_at_20%_20%,rgba(212,162,47,0.16),transparent_55%)] p-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                  {course.category}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-3">
                <h2 className="font-sans text-2xl font-semibold tracking-tight text-foreground">
                  {course.title}
                </h2>
                <p className="font-sans text-sm leading-relaxed text-zinc-400">
                  {course.body}
                </p>
                <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                  <span>{course.duration}</span>
                  <span>{formatInr(course.fee)}</span>
                  <span className="inline-flex items-center gap-1 text-accent">
                    <Star size={12} weight="fill" />
                    {course.rating} · {course.reviewCount}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Link
                  href={`/courses/${course.slug}`}
                  className="group inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-300 transition-colors duration-200 hover:text-accent"
                >
                  {t("courses_view")}
                  <ArrowUpRight size={12} weight="bold" />
                </Link>
                <Link
                  href={`/courses/${course.slug}/enroll`}
                  className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent transition-opacity duration-200 hover:opacity-80"
                >
                  {t("courses_enroll")}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
