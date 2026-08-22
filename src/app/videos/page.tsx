import type { Metadata } from "next";
import { Play } from "@phosphor-icons/react/dist/ssr";
import { PageHero } from "@/components/ui/PageHero";
import { Tx } from "@/components/i18n/Tx";
import { VIDEOS } from "@/lib/optech";

export const metadata: Metadata = {
  title: "Videos",
  description:
    "Watch course lectures and institute highlights from Optech Computer Institute, Deori. YouTube lessons uploaded regularly.",
};

function VideoCard({
  title,
  category,
  duration,
  views,
  body,
  youtubeId,
  featured = false,
}: {
  title: string;
  category: string;
  duration: string;
  views: string;
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
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
            {category}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            {duration} · {views}
          </span>
        </div>
        <h2
          className={`font-sans font-semibold tracking-tight text-foreground ${
            featured ? "text-2xl md:text-3xl" : "text-lg"
          }`}
        >
          {title}
        </h2>
        <p className="font-sans text-sm leading-relaxed text-zinc-400">{body}</p>
      </div>
    </article>
  );
}

export default function VideosPage() {
  const [featured, ...rest] = VIDEOS;

  return (
    <>
      <PageHero
        eyebrow="videos_eyebrow"
        title="videos_title"
        titleAccent="videos_title_accent"
        description="videos_desc"
      />

      <section className="px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-[1400px] gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featured && (
            <VideoCard
              key={featured.id}
              featured
              title={featured.title}
              category={featured.category}
              duration={featured.duration}
              views={featured.views}
              body={featured.body}
              youtubeId={featured.youtubeId}
            />
          )}
          {rest.map((video) => (
            <VideoCard
              key={video.id}
              title={video.title}
              category={video.category}
              duration={video.duration}
              views={video.views}
              body={video.body}
              youtubeId={video.youtubeId}
            />
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-[1400px] font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
          <Tx k="videos_foot" />
        </p>
      </section>
    </>
  );
}
