import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { NOTICES } from "@/lib/site-content";
import { Tx } from "@/components/i18n/Tx";

export const metadata: Metadata = {
  title: "Notice Board",
  description: "Public notices from Optech Computer Institute, Deori.",
};

export default function NoticesPage() {
  const ordered = [...NOTICES].sort((a, b) => Number(b.pinned) - Number(a.pinned));
  return (
    <>
      <PageHero
        eyebrow="notices_eyebrow"
        title="notices_title"
        titleAccent="notices_title_accent"
        description="notices_desc"
      />
      <section className="px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3">
          {ordered.map((notice) => (
            <article key={notice.id} className="card-surface p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
                  {notice.category}
                </span>
                {notice.pinned ? (
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    <Tx k="notices_pinned" />
                  </span>
                ) : null}
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
                  {notice.date} · {notice.audience}
                </span>
              </div>
              <h2 className="mt-3 font-sans text-xl font-semibold">{notice.title}</h2>
              <p className="mt-2 font-sans text-sm text-zinc-400">{notice.body}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
