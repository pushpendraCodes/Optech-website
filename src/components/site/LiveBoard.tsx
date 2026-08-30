"use client";

import Link from "next/link";
import { Play } from "@phosphor-icons/react";
import { LIVE_CLASS } from "@/lib/site-content";
import { btnPrimary } from "@/components/ui/ui";
import { Tx } from "@/components/i18n/Tx";
import { useGetLiveQuery } from "@/lib/api";
import { loc } from "@/lib/loc";

export function LiveBoard() {
  const { data } = useGetLiveQuery();
  const first = data?.data?.[0] as
    | {
        title?: string;
        youtubeId?: string;
        isLive?: boolean;
        startsAt?: string;
        course?: { title?: unknown; slug?: string };
      }
    | undefined;
  const live = first
    ? {
        title: first.title || LIVE_CLASS.title,
        course: loc(first.course?.title as never) || LIVE_CLASS.course,
        start: first.startsAt ? new Date(first.startsAt).toLocaleString("en-IN") : LIVE_CLASS.start,
        youtubeId: first.youtubeId || "",
        isLive: Boolean(first.isLive),
        joinUrl: "/student/login",
      }
    : LIVE_CLASS;

  return (
    <section className="px-6 py-16 md:px-10 md:py-20">
      <div className="card-surface mx-auto max-w-[1400px] overflow-hidden">
        <div className="relative aspect-video bg-black/50">
          {live.youtubeId ? (
            <iframe
              title={live.title}
              src={`https://www.youtube.com/embed/${live.youtubeId}`}
              className="absolute inset-0 h-full w-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <Play size={28} weight="fill" className="text-accent" />
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
                {live.isLive ? <Tx k="live_now" /> : <Tx k="live_standby" />}
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
              {live.course} · {live.start}
            </p>
            <h2 className="mt-2 font-sans text-2xl font-semibold">{live.title}</h2>
          </div>
          <Link href={live.joinUrl} className={btnPrimary}>
            <Tx k="live_join" />
          </Link>
        </div>
      </div>
    </section>
  );
}
