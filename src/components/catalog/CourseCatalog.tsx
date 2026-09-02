"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, MagnifyingGlass, Star } from "@phosphor-icons/react";
import { FEE_RANGES, formatInr, type CourseMode, type CourseRecord, type CourseTag } from "@/lib/catalog";
import { fieldClass, selectClass } from "@/components/ui/ui";
import { useI18n } from "@/components/providers/I18nProvider";
import { useGetCategoriesQuery, useGetCoursesQuery } from "@/lib/api";
import { loc } from "@/lib/loc";

function toRecord(course: Record<string, unknown>): CourseRecord {
  const tags = (course.tags as CourseTag[] | undefined) ?? [];
  const thumb =
    course.thumbnail && typeof course.thumbnail === "object" && "url" in (course.thumbnail as object)
      ? String((course.thumbnail as { url?: string }).url ?? "")
      : "";
  return {
    slug: String(course.slug),
    title: loc(course.title as never),
    badge: tags[0] ?? "Course",
    tags,
    category: loc((course.category as { name?: unknown } | undefined)?.name as never) || "Course",
    duration: String(course.duration ?? ""),
    durationMonths: Number(course.durationMonths ?? 0),
    level: String(course.mode ?? "offline"),
    mode: (course.mode as CourseMode) ?? "offline",
    fee: Number(course.fee ?? 0),
    rating: 4.8,
    reviewCount: 0,
    body: loc(course.description as never),
    certificate: String(course.certificate ?? ""),
    demoVideo: String(course.demoVideo ?? ""),
    thumbnail: thumb,
    syllabus: (course.syllabus as CourseRecord["syllabus"]) ?? [],
    batches: [],
  };
}

export function CourseCatalog() {
  const { t } = useI18n();
  const { data, isLoading } = useGetCoursesQuery();
  const { data: catRes } = useGetCategoriesQuery();
  const categories = (catRes?.data ?? []).map((item) => loc(item.name as never) || item.slug);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [fee, setFee] = useState("any");
  const [mode, setMode] = useState<"all" | CourseMode>("all");
  const [tag, setTag] = useState<"all" | CourseTag>("all");

  const catalog = useMemo(() => (data?.data ?? []).map((row) => toRecord(row as never)), [data?.data]);

  const results = useMemo(() => {
    const range = FEE_RANGES.find((item) => item.id === fee) ?? FEE_RANGES[0];
    return catalog.filter((course) => {
      const hay = `${course.title} ${course.body} ${course.category}`.toLowerCase();
      const matchQuery = hay.includes(query.trim().toLowerCase());
      const matchCat =
        category === "all" ||
        course.category === category ||
        course.category.toLowerCase() === category.toLowerCase();
      const matchFee = course.fee >= range.min && course.fee <= range.max;
      const matchMode = mode === "all" || course.mode === mode;
      const matchTag = tag === "all" || course.tags.includes(tag);
      return matchQuery && matchCat && matchFee && matchMode && matchTag;
    });
  }, [catalog, category, fee, mode, query, tag]);

  return (
    <section className="px-6 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 grid gap-3 lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
          <label className="relative block">
            <MagnifyingGlass
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="search"
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
            {categories.map((item) => (
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
            onChange={(e) => setMode(e.target.value as "all" | CourseMode)}
            className={selectClass}
          >
            <option value="all">{t("courses_mode_all")}</option>
            <option value="offline">{t("courses_offline")}</option>
            <option value="online">{t("courses_online")}</option>
          </select>
          <select
            aria-label={t("courses_all")}
            value={tag}
            onChange={(e) => setTag(e.target.value as "all" | CourseTag)}
            className={selectClass}
          >
            <option value="all">{t("courses_all")}</option>
            <option value="Popular">{t("courses_popular")}</option>
            <option value="New">{t("courses_new")}</option>
            <option value="Trending">{t("courses_trending")}</option>
          </select>
        </div>

        <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          {results.length === 1 ? t("courses_count", { n: results.length }) : t("courses_count_plural", { n: results.length })}
        </p>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="card-surface h-64 animate-pulse" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <p className="font-sans text-sm text-zinc-400">No courses published yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {results.map((course) => (
              <Link
                key={course.slug}
                href={`/courses/${course.slug}`}
                className="card-surface group flex flex-col overflow-hidden p-0 transition-colors duration-200 hover:border-white/15"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-zinc-950">
                  {course.thumbnail ? (
                    <Image
                      src={course.thumbnail}
                      alt=""
                      fill
                      sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                      {course.badge}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-zinc-500">
                      <Star size={12} weight="fill" className="text-accent" />
                      {course.rating}
                    </span>
                  </div>
                  <h2 className="font-sans text-lg font-semibold tracking-tight">{course.title}</h2>
                  <p className="line-clamp-2 flex-1 font-sans text-sm text-zinc-400">{course.body}</p>
                  <div className="flex items-center justify-between gap-3 border-t border-white/8 pt-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                      {course.duration} · {course.mode}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
                      {formatInr(course.fee)}
                      <ArrowUpRight size={12} weight="bold" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
