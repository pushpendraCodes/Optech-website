"use client";

import { Play } from "@phosphor-icons/react";
import { PageHero } from "@/components/ui/PageHero";
import { Tx } from "@/components/i18n/Tx";
import { useGetVideosQuery } from "@/lib/api";

type VideoItem = {
  id: string;
  title: string;
  category: string;
  body: string;
  youtubeId: string;
  featured?: boolean;
};

function VideoCard({
  title,
  category,
  body,
  youtubeId,
  featured = false,
}: {
  title: string;
  category: string;
  body: string;
  youtubeId: string;
  featured?: boolean;
}) {
  const hasVideo = Boolean(youtubeId.trim());

  return (
    <article
      className={`card-surface overflow-hidden ${
        featured ? "md:col-span-2 lg:col-span-2" : ""
      }`}
    >
      <div
        className={`relative w-full overflow-hidden bg-black/40 ${
          featured ? "aspect-[16/9]" : "aspect-video"
        }`}
      >
        {hasVideo ? (
          <iframe
            title={title}
            src={`https://www.youtube.com/embed/${youtubeId}`}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_30%_20%,rgba(212,162,47,0.18),transparent_55%)]">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-accent">
              <Play size={22} weight="fill" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-400">
              <Tx k="videos_pending" />
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3 p-5 md:p-6">
        {category ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
            {category}
          </span>
        ) : null}
        <h2
          className={`font-sans font-semibold tracking-tight text-foreground ${
            featured ? "text-2xl md:text-3xl" : "text-lg"
          }`}
        >
          {title}
        </h2>
        {body ? (
          <p className="font-sans text-sm leading-relaxed text-zinc-400">{body}</p>
        ) : null}
      </div>
    </article>
  );
}

function mapApiVideos(rows: Record<string, unknown>[]): VideoItem[] {
  return rows.map((row) => ({
    id: String(row._id ?? row.youtubeId ?? row.title),
    title: String(row.title ?? ""),
    category: String(row.category ?? ""),
    body: String(row.description ?? ""),
    youtubeId: String(row.youtubeId ?? ""),
    featured: Boolean(row.featured),
  }));
}

export default function VideosPage() {
  const { data, isLoading, isError } = useGetVideosQuery();
  const videos = data?.data?.length ? mapApiVideos(data.data) : [];
  const featured = videos.find((video) => video.featured) ?? videos[0];
  const rest = featured ? videos.filter((video) => video.id !== featured.id) : [];

  return (
    <>
      <PageHero
        eyebrow="videos_eyebrow"
        title="videos_title"
        titleAccent="videos_title_accent"
        description="videos_desc"
      />

      <section className="px-6 py-16 md:px-10 md:py-24">
        {isLoading ? (
          <div className="mx-auto grid max-w-[1400px] gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="card-surface animate-pulse overflow-hidden"
              >
                <div className="aspect-video bg-white/5" />
                <div className="space-y-3 p-5 md:p-6">
                  <div className="h-3 w-24 rounded bg-white/10" />
                  <div className="h-5 w-3/4 rounded bg-white/10" />
                  <div className="h-4 w-full rounded bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <p className="mx-auto max-w-[1400px] text-center font-sans text-sm text-zinc-400">
            <Tx k="videos_error" />
          </p>
        ) : videos.length === 0 ? (
          <p className="mx-auto max-w-[1400px] text-center font-sans text-sm text-zinc-400">
            <Tx k="videos_empty" />
          </p>
        ) : (
          <div className="mx-auto grid max-w-[1400px] gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featured ? (
              <VideoCard
                key={featured.id}
                featured
                title={featured.title}
                category={featured.category}
                body={featured.body}
                youtubeId={featured.youtubeId}
              />
            ) : null}
            {rest.map((video) => (
              <VideoCard
                key={video.id}
                title={video.title}
                category={video.category}
                body={video.body}
                youtubeId={video.youtubeId}
              />
            ))}
          </div>
        )}

        <p className="mx-auto mt-10 max-w-[1400px] font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
          <Tx k="videos_foot" />
        </p>
      </section>
    </>
  );
}
