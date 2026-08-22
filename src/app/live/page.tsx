import type { Metadata } from "next";
import Link from "next/link";
import { Play } from "@phosphor-icons/react/dist/ssr";
import { PageHero } from "@/components/ui/PageHero";
import { LIVE_CLASS } from "@/lib/site-content";
import { btnPrimary } from "@/components/ui/ui";
import { Tx } from "@/components/i18n/Tx";

export const metadata: Metadata = {
  title: "Live Class",
  description: "Join scheduled YouTube live classes from Optech Deori.",
};

export default function LivePage() {
  return (
    <>
      <PageHero
        eyebrow="live_eyebrow"
        title="live_title"
        titleAccent="live_title_accent"
        description="live_desc"
      />
      <section className="px-6 py-16 md:px-10 md:py-20">
        <div className="card-surface mx-auto max-w-[1400px] overflow-hidden">
          <div className="relative aspect-video bg-black/50">
            {LIVE_CLASS.youtubeId ? (
              <iframe
                title={LIVE_CLASS.title}
                src={`https://www.youtube.com/embed/${LIVE_CLASS.youtubeId}`}
                className="absolute inset-0 h-full w-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <Play size={28} weight="fill" className="text-accent" />
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
                  {LIVE_CLASS.isLive ? <Tx k="live_now" /> : <Tx k="live_standby" />}
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
                {LIVE_CLASS.course} · {LIVE_CLASS.start}
              </p>
              <h2 className="mt-2 font-sans text-2xl font-semibold">{LIVE_CLASS.title}</h2>
            </div>
            <Link href={LIVE_CLASS.joinUrl} className={btnPrimary}>
              <Tx k="live_join" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
