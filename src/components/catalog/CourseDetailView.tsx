"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Play, Star } from "@phosphor-icons/react";
import { PageHero } from "@/components/ui/PageHero";
import { formatInr } from "@/lib/catalog";
import { btnGhost, btnPrimary } from "@/components/ui/ui";
import { Tx } from "@/components/i18n/Tx";
import { useGetCourseQuery } from "@/lib/api";
import { loc } from "@/lib/loc";

function youtubeId(url: string) {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return u.pathname.split("/").filter(Boolean)[0] ?? "";
    if (host === "youtube.com" || host === "m.youtube.com") {
      return u.searchParams.get("v") || u.pathname.match(/\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] || "";
    }
  } catch {
    /* ignore */
  }
  return "";
}

export function CourseDetailView({ slug }: { slug: string }) {
  const { data, isLoading, isError } = useGetCourseQuery(slug);
  const api = data?.data;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-10">
        <div className="h-64 animate-pulse rounded-3xl border border-white/10 bg-white/3" />
      </div>
    );
  }

  if (!api) {
    return (
      <PageHero
        eyebrow="enroll_missing"
        title="enroll_missing"
        description="enroll_missing_desc"
      />
    );
  }

  const course = {
    slug: api.slug,
    title: loc(api.title),
    body: loc(api.description),
    category: loc(api.category?.name) || String(api.category?.slug ?? ""),
    mode: api.mode ?? "offline",
    fee: api.fee,
    duration: api.duration ?? "",
    certificate: api.certificate ?? "",
    rating: 4.8,
    reviewCount: 0,
    demoVideo: api.demoVideo ?? "",
    thumbnail: api.thumbnail?.url ?? "",
    syllabus: api.syllabus ?? [],
    batches: (api.batches ?? []).map((batch) => ({
      id: batch._id,
      label: batch.label,
      timing: batch.timing,
      seats: batch.seats,
      start: batch.start ? String(batch.start).slice(0, 10) : "",
    })),
    staff: (api.instructors ?? []).map((member) => ({
      name: member.name,
      role: member.role ?? "",
      bio: member.bio ?? "",
      photo: member.photo?.url ?? "",
    })),
  };

  const demoId = course.demoVideo ? youtubeId(course.demoVideo) : "";

  return (
    <>
      <PageHero
        rawEyebrow={`${course.category.toUpperCase()} // ${course.mode.toUpperCase()}`}
        rawTitle={
          <>
            {course.title} <span className="text-accent">{formatInr(course.fee)}</span>
          </>
        }
        rawDescription={course.body}
      />

      <section className="px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="flex flex-col gap-10">
            {course.thumbnail ? (
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
                <Image src={course.thumbnail} alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" priority />
              </div>
            ) : null}

            <div>
              <h2 className="font-sans text-2xl font-semibold tracking-tight">
                <Tx k="detail_syllabus" />
              </h2>
              <div className="mt-6 grid gap-4">
                {course.syllabus.length ? (
                  course.syllabus.map((mod, i) => (
                    <article key={`${mod.title}-${i}`} className="card-surface p-5">
                      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
                        {String(i + 1).padStart(2, "0")}
                      </p>
                      <h3 className="mt-2 font-sans text-lg font-semibold">{mod.title}</h3>
                      <p className="mt-2 font-sans text-sm text-zinc-400">{mod.topics.join(" · ")}</p>
                    </article>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500">Syllabus coming soon.</p>
                )}
              </div>
            </div>

            <div>
              <h2 className="font-sans text-2xl font-semibold tracking-tight">
                <Tx k="detail_faculty" />
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {course.staff.length ? (
                  course.staff.map((member) => (
                    <Link
                      key={member.name}
                      href="/staff"
                      className="card-surface flex gap-4 p-5 transition-colors duration-200 hover:border-white/15"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-900">
                        {member.photo ? (
                          <Image src={member.photo} alt="" fill sizes="64px" className="object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center font-mono text-xs text-accent">
                            {member.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-sans text-base font-semibold">{member.name}</p>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">{member.role}</p>
                        {member.bio ? <p className="mt-2 font-sans text-sm text-zinc-400">{member.bio}</p> : null}
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500">Faculty details coming soon.</p>
                )}
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
            <div className="card-surface p-6">
              <div className="flex items-center gap-2 text-accent">
                <Star size={16} weight="fill" />
                <span className="font-mono text-sm">
                  {course.rating} · <Tx k="detail_ratings" vars={{ n: course.reviewCount }} />
                </span>
              </div>
              <dl className="mt-5 space-y-3 font-sans text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-500">
                    <Tx k="courses_duration" />
                  </dt>
                  <dd>{course.duration}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-500">
                    <Tx k="detail_fee" />
                  </dt>
                  <dd>{formatInr(course.fee)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-500">
                    <Tx k="detail_mode" />
                  </dt>
                  <dd className="capitalize">{course.mode}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-500">
                    <Tx k="detail_cert" />
                  </dt>
                  <dd className="max-w-[16ch] text-right">{course.certificate || "—"}</dd>
                </div>
              </dl>
              <div className="mt-6 flex flex-col gap-3">
                <Link href={`/courses/${course.slug}/enroll`} className={btnPrimary}>
                  <Tx k="detail_enroll" />
                  <ArrowUpRight size={14} weight="bold" />
                </Link>
                <Link href="/calculator" className={btnGhost}>
                  <Tx k="courses_fee_cta" />
                </Link>
              </div>
            </div>

            <div className="card-surface p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
                <Tx k="detail_batches" />
              </p>
              <ul className="mt-4 space-y-3">
                {course.batches.length ? (
                  course.batches.map((batch) => (
                    <li key={batch.id} className="border-t border-white/8 pt-3">
                      <p className="font-sans text-sm font-medium">{batch.label}</p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        {batch.timing} · <Tx k="detail_seats" vars={{ n: batch.seats }} /> · {batch.start}
                      </p>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-zinc-500">No open batches listed.</li>
                )}
              </ul>
            </div>

            <div className="card-surface overflow-hidden p-0">
              {demoId ? (
                <div className="aspect-video w-full bg-black">
                  <iframe
                    title={`${course.title} demo`}
                    src={`https://www.youtube.com/embed/${demoId}`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : null}
              <div className="flex items-center gap-3 p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-accent">
                  <Play size={16} weight="fill" />
                </span>
                <div>
                  <p className="font-sans text-sm">
                    <Tx k="detail_demo" />
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                    {demoId ? "YouTube demo" : <Tx k="detail_pending" />}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
