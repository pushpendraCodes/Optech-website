"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, X } from "@phosphor-icons/react";
import { PageHero } from "@/components/ui/PageHero";
import { GALLERY_ALBUMS } from "@/lib/site-content";
import { VIDEOS } from "@/lib/optech";
import { useI18n } from "@/components/providers/I18nProvider";

export default function GalleryPage() {
  const { t } = useI18n();
  const [filter, setFilter] = useState<"all" | "photo" | "video">("all");
  const [open, setOpen] = useState<string | null>(null);
  const album = GALLERY_ALBUMS.find((item) => item.id === open);

  return (
    <>
      <PageHero
        eyebrow="gallery_eyebrow"
        title="gallery_title"
        titleAccent="gallery_title_accent"
        description="gallery_desc"
      />
      <section className="px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-8 flex flex-wrap gap-2">
            {(
              [
                ["all", "gallery_all"],
                ["photo", "gallery_photo"],
                ["video", "gallery_video"],
              ] as const
            ).map(([item, key]) => (
              <button
                key={item}
                type="button"
                aria-pressed={filter === item}
                onClick={() => setFilter(item)}
                className={`cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-200 ${
                  filter === item
                    ? "border-accent/40 bg-accent/15 text-accent"
                    : "border-white/10 text-zinc-400"
                }`}
              >
                {t(key)}
              </button>
            ))}
          </div>

          {filter !== "video" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {GALLERY_ALBUMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setOpen(item.id)}
                  className="card-surface cursor-pointer overflow-hidden p-0 text-left transition-colors duration-200 hover:border-white/15"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
                    <Image
                      src={item.cover}
                      alt={item.title}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-300 hover:scale-[1.04]"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-sans text-sm font-semibold">{item.title}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                      {t("gallery_photos", { n: item.photos.length })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : null}

          {filter !== "photo" ? (
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {VIDEOS.map((video) => (
                <article key={video.id} className="card-surface p-5">
                  <div className="mb-4 flex aspect-video items-center justify-center rounded-2xl bg-black/40 text-accent">
                    <Play size={22} weight="fill" />
                  </div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                    {video.category}
                  </p>
                  <h2 className="mt-2 font-sans text-base font-semibold">{video.title}</h2>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {album ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label={t("gallery_close")}
            className="absolute inset-0 cursor-pointer bg-black/80"
            onClick={() => setOpen(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="card-surface relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto p-6"
          >
            <button
              type="button"
              aria-label={t("gallery_close")}
              onClick={() => setOpen(null)}
              className="absolute right-4 top-4 cursor-pointer p-2 text-zinc-400"
            >
              <X size={16} weight="bold" />
            </button>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
              {t("gallery_lightbox")}
            </p>
            <p className="mt-2 font-sans text-lg font-semibold">{album.title}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {album.photos.map((src) => (
                <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-zinc-900">
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 40vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
