import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Play, Star } from "@phosphor-icons/react/dist/ssr";
import { PageHero } from "@/components/ui/PageHero";
import { COURSES, formatInr, getCourse, staffForCourse } from "@/lib/catalog";
import { REVIEWS } from "@/lib/optech";
import { btnGhost, btnPrimary } from "@/components/ui/ui";
import { Tx } from "@/components/i18n/Tx";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return COURSES.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
  return {
    title: course ? course.title : "Course",
    description: course?.body,
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();
  const staff = staffForCourse(course);

  return (
    <>
      <PageHero
        rawEyebrow={`${course.category.toUpperCase()} // ${course.mode.toUpperCase()}`}
        rawTitle={
          <>
            {course.title}{" "}
            <span className="text-accent">{formatInr(course.fee)}</span>
          </>
        }
        rawDescription={course.body}
      />

      <section className="px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="flex flex-col gap-10">
            <div>
              <h2 className="font-sans text-2xl font-semibold tracking-tight">
                <Tx k="detail_syllabus" />
              </h2>
              <div className="mt-6 grid gap-4">
                {course.syllabus.map((mod, i) => (
                  <article key={mod.title} className="card-surface p-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-2 font-sans text-lg font-semibold">
                      {mod.title}
                    </h3>
                    <p className="mt-2 font-sans text-sm text-zinc-400">
                      {mod.topics.join(" · ")}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-sans text-2xl font-semibold tracking-tight">
                <Tx k="detail_faculty" />
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {staff.map((member) => (
                  <Link
                    key={member.name}
                    href="/staff"
                    className="card-surface p-5 transition-colors duration-200 hover:border-white/15"
                  >
                    <p className="font-sans text-base font-semibold">{member.name}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                      {member.role}
                    </p>
                    <p className="mt-2 font-sans text-sm text-zinc-400">{member.bio}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-sans text-2xl font-semibold tracking-tight">
                <Tx k="detail_reviews" />
              </h2>
              <div className="mt-6 grid gap-4">
                {REVIEWS.map((review) => (
                  <figure key={review.name} className="card-surface p-5">
                    <p className="font-sans text-sm leading-relaxed text-zinc-300">
                      “{review.quote}”
                    </p>
                    <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      {review.name} · {review.role}
                    </figcaption>
                  </figure>
                ))}
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
                  <dt className="text-zinc-500"><Tx k="courses_duration" /></dt>
                  <dd>{course.duration}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-500"><Tx k="detail_fee" /></dt>
                  <dd>{formatInr(course.fee)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-500"><Tx k="detail_mode" /></dt>
                  <dd className="capitalize">{course.mode}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-500"><Tx k="detail_cert" /></dt>
                  <dd className="max-w-[16ch] text-right">{course.certificate}</dd>
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
                {course.batches.map((batch) => (
                  <li key={batch.id} className="border-t border-white/8 pt-3">
                    <p className="font-sans text-sm font-medium">{batch.label}</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                      {batch.timing} · <Tx k="detail_seats" vars={{ n: batch.seats }} /> · {batch.start}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card-surface flex items-center gap-3 p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-accent">
                <Play size={16} weight="fill" />
              </span>
              <div>
                <p className="font-sans text-sm"><Tx k="detail_demo" /></p>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                  {course.demoVideo ? <Tx k="videos_pending" /> : <Tx k="detail_pending" />}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
