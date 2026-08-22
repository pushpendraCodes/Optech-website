import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Tx } from "@/components/i18n/Tx";
import { ALUMNI } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Alumni",
  description: "Optech Deori alumni directory and featured success stories.",
};

export default function AlumniPage() {
  return (
    <>
      <PageHero
        eyebrow="alumni_eyebrow"
        title="alumni_title"
        titleAccent="alumni_title_accent"
        description="alumni_desc"
      />
      <section className="px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-[1400px] gap-4 md:grid-cols-2">
          {ALUMNI.map((person) => (
            <article key={person.name} className="card-surface p-6">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
                  {person.featured ? <Tx k="alumni_featured" /> : <Tx k="alumni_dir" />}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  <Tx k="alumni_batch" vars={{ year: person.batch }} />
                </p>
              </div>
              <h2 className="mt-3 font-sans text-xl font-semibold">{person.name}</h2>
              <p className="mt-1 font-sans text-sm text-zinc-400">
                {person.course} · {person.role}
              </p>
              <p className="mt-4 font-sans text-sm leading-relaxed text-zinc-300">
                {person.story}
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
