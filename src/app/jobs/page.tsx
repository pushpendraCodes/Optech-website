"use client";

import { useMemo, useState } from "react";
import { PageHero } from "@/components/ui/PageHero";
import { JOBS } from "@/lib/site-content";
import { selectClass } from "@/components/ui/ui";
import { useI18n } from "@/components/providers/I18nProvider";

export default function JobsPage() {
  const { t } = useI18n();
  const [course, setCourse] = useState("all");
  const [location, setLocation] = useState("all");
  const courses = [...new Set(JOBS.map((j) => j.course))];
  const locations = [...new Set(JOBS.map((j) => j.location))];
  const list = useMemo(
    () =>
      JOBS.filter(
        (job) =>
          (course === "all" || job.course === course) &&
          (location === "all" || job.location === location),
      ),
    [course, location],
  );

  return (
    <>
      <PageHero
        eyebrow="jobs_eyebrow"
        title="jobs_title"
        titleAccent="jobs_title_accent"
        description="jobs_desc"
      />
      <section className="px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-8 grid gap-3 sm:grid-cols-2">
            <select
              aria-label={t("jobs_course")}
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className={selectClass}
            >
              <option value="all">{t("jobs_all_courses")}</option>
              {courses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <select
              aria-label={t("jobs_location")}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={selectClass}
            >
              <option value="all">{t("jobs_all_loc")}</option>
              {locations.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {list.map((job) => (
              <article key={job.id} className="card-surface flex flex-col gap-4 p-6">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                    {job.type} · {job.course}
                  </p>
                  <h2 className="mt-2 font-sans text-xl font-semibold">{job.title}</h2>
                  <p className="mt-1 font-sans text-sm text-zinc-400">
                    {job.employer} · {job.location}
                  </p>
                </div>
                <p className="font-sans text-sm leading-relaxed text-zinc-300">{job.description}</p>
                <p className="border-t border-white/10 pt-3 font-sans text-sm text-zinc-400">
                  <span className="text-zinc-200">Contact:</span> {job.contact}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
