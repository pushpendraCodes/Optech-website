"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Play,
  ArrowsOut,
} from "@phosphor-icons/react";
import { EyebrowBadge } from "@/components/ui/EyebrowBadge";
import { AnimatedItem, AnimatedSection } from "@/components/ui/AnimatedSection";
import { useI18n } from "@/components/providers/I18nProvider";
import { useGetAlumniQuery } from "@/lib/api";

const AUTO_MS = 3200;
const TRANSITION_MS = 900;
const SWIPE_THRESHOLD = 40;

type AlumniSlide = {
  id: string;
  name: string;
  batch: string;
  role: string;
  story: string;
  photo: string;
  youtubeId: string;
  featured: boolean;
};

function youtubeIdFrom(row: Record<string, unknown>) {
  const id = String(row.youtubeId ?? "").trim();
  if (id) return id;
  const url = String(row.youtubeUrl ?? "").trim();
  if (!url) return "";
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return u.pathname.split("/").filter(Boolean)[0] ?? "";
    if (host.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const match = u.pathname.match(/\/(?:embed|shorts|live)\/([^/?]+)/);
      return match?.[1] ?? "";
    }
  } catch {
    return "";
  }
  return "";
}

function circularOffset(index: number, active: number, length: number) {
  if (length <= 0) return 0;
  let diff = index - active;
  while (diff > length / 2) diff -= length;
  while (diff < -length / 2) diff += length;
  return diff;
}

function cardVisual(offset: number) {
  const abs = Math.abs(offset);
  if (abs === 0) {
    return {
      scale: 1.12,
      opacity: 1,
      blur: 0,
      brightness: 1.05,
      z: 40,
      y: 0,
      rotateY: 0,
      shadow:
        "0 36px 70px -18px rgba(0,0,0,0.82), 0 0 40px -12px rgba(212,162,47,0.28), inset 0 1px 0 rgba(255,255,255,0.12)",
    };
  }
  if (abs === 1) {
    return {
      scale: 0.86,
      opacity: 0.78,
      blur: 0.4,
      brightness: 0.72,
      z: 30,
      y: 28,
      rotateY: offset < 0 ? 18 : -18,
      shadow: "0 20px 44px -24px rgba(0,0,0,0.7)",
    };
  }
  if (abs === 2) {
    return {
      scale: 0.74,
      opacity: 0.45,
      blur: 1.2,
      brightness: 0.55,
      z: 20,
      y: 48,
      rotateY: offset < 0 ? 28 : -28,
      shadow: "0 14px 30px -22px rgba(0,0,0,0.65)",
    };
  }
  return {
    scale: 0.64,
    opacity: 0,
    blur: 2,
    brightness: 0.4,
    z: 10,
    y: 64,
    rotateY: 0,
    shadow: "none",
  };
}

function AlumniCarouselCard({
  person,
  offset,
  index,
  total,
  reduced,
  playing,
  onPlay,
}: {
  person: AlumniSlide;
  offset: number;
  index: number;
  total: number;
  reduced: boolean;
  playing: boolean;
  onPlay: () => void;
}) {
  const visual = cardVisual(offset);
  const abs = Math.abs(offset);
  const isCenter = abs === 0;
  const hideClass =
    abs > 2 ? "hidden lg:block" : abs > 1 ? "hidden md:block" : "block";
  const thumb = person.youtubeId
    ? `https://i.ytimg.com/vi/${person.youtubeId}/hqdefault.jpg`
    : person.photo;

  return (
    <article
      className={`absolute left-1/2 top-0 w-[min(280px,72vw)] sm:w-[300px] md:w-[340px] lg:w-[360px] ${hideClass}`}
      style={{
        transform: `translate3d(calc(-50% + ${offset * 62}%), ${visual.y}px, 0) rotateY(${visual.rotateY}deg) scale(${visual.scale})`,
        opacity: visual.opacity,
        zIndex: visual.z,
        filter: reduced
          ? undefined
          : `blur(${visual.blur}px) brightness(${visual.brightness})`,
        transition: reduced
          ? undefined
          : `transform ${TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${TRANSITION_MS}ms ease, filter ${TRANSITION_MS}ms ease`,
        willChange: "transform, opacity, filter",
        pointerEvents: isCenter ? "auto" : "none",
        transformStyle: "preserve-3d",
      }}
      aria-hidden={!isCenter}
    >
      <div
        className="flex h-full flex-col overflow-hidden rounded-[28px] border border-white/15 bg-white/[0.06] backdrop-blur-xl"
        style={{ boxShadow: visual.shadow }}
      >
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-zinc-900">
          {isCenter && playing && person.youtubeId ? (
            <iframe
              title={`${person.name} video`}
              src={`https://www.youtube.com/embed/${person.youtubeId}?autoplay=1&rel=0`}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : thumb ? (
            <Image
              src={thumb}
              alt={isCenter ? person.name : ""}
              fill
              sizes="360px"
              className="object-cover"
              priority={isCenter}
            />
          ) : (
            <div className="flex h-full items-center justify-center font-mono text-3xl text-accent/70">
              {person.name
                .split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
          )}

          {isCenter ? (
            <>
              <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-center bg-gradient-to-b from-black/45 to-transparent px-3 pt-3">
                {person.youtubeId && !playing ? (
                  <button
                    type="button"
                    onClick={onPlay}
                    className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-md transition hover:bg-black/60"
                    aria-label={`Play ${person.name} video`}
                  >
                    <Play size={18} weight="fill" />
                  </button>
                ) : (
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white/80 backdrop-blur-md">
                    <ArrowsOut size={16} />
                  </span>
                )}
              </div>
              {person.photo && person.youtubeId ? (
                <div className="absolute bottom-3 left-3 h-12 w-12 overflow-hidden rounded-full border-2 border-white/40 shadow-lg">
                  <Image src={person.photo} alt="" fill sizes="48px" className="object-cover" />
                </div>
              ) : null}
            </>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-2 bg-black/45 px-5 py-4 backdrop-blur-md">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-sans text-xl font-semibold tracking-tight text-foreground md:text-2xl">
              {person.name}
            </h3>
            {isCenter ? (
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                {index + 1} / {total}
              </span>
            ) : null}
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            {person.batch ? `Batch ${person.batch}` : "Alumni"}
            {person.role ? ` · ${person.role}` : ""}
          </p>
          {isCenter && person.story ? (
            <p className="mt-1 line-clamp-3 font-sans text-sm leading-relaxed text-zinc-300">
              {person.story}
            </p>
          ) : null}
          {!isCenter && person.role ? (
            <p className="line-clamp-1 font-sans text-xs text-zinc-400">{person.role}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function HomeAlumni() {
  const { t } = useI18n();
  const { data, isLoading } = useGetAlumniQuery();
  const people = useMemo<AlumniSlide[]>(() => {
    return (data?.data ?? []).map((row) => {
      const photo =
        row.photo && typeof row.photo === "object" && "url" in (row.photo as object)
          ? String((row.photo as { url?: string }).url ?? "")
          : "";
      return {
        id: String(row._id ?? row.name ?? ""),
        name: String(row.name ?? ""),
        batch: String(row.batchYear ?? ""),
        role: String(row.role ?? ""),
        story: String(row.story ?? ""),
        photo,
        youtubeId: youtubeIdFrom(row as Record<string, unknown>),
        featured: Boolean(row.featured),
      };
    });
  }, [data]);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [playing, setPlaying] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const length = people.length;
  const current = people[active];

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (length === 0) return;
    setActive((i) => i % length);
  }, [length]);

  useEffect(() => {
    setPlaying(false);
  }, [active]);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (length < 2) return;
      setPlaying(false);
      setActive((i) => (i + dir + length) % length);
    },
    [length],
  );

  useEffect(() => {
    if (paused || reduced || playing || length < 2) return;
    const timer = window.setInterval(() => go(1), AUTO_MS);
    return () => window.clearInterval(timer);
  }, [paused, reduced, playing, length, go]);

  const beginDrag = (x: number) => {
    dragStartX.current = x;
  };

  const endDrag = (x: number) => {
    if (dragStartX.current == null) return;
    const delta = x - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    go(delta < 0 ? 1 : -1);
  };

  if (!isLoading && length === 0) return null;

  return (
    <section
      id="alumni"
      className="relative overflow-hidden border-t border-white/5 bg-background px-6 py-24 md:px-10 md:py-32"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        dragStartX.current = null;
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(48% 55% at 50% 45%, rgba(212,162,47,0.12) 0%, transparent 68%), radial-gradient(30% 40% at 20% 80%, rgba(255,255,255,0.04) 0%, transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-[1400px]">
        <AnimatedSection className="mb-12 flex max-w-[42rem] flex-col gap-5 md:mb-14">
          <AnimatedItem>
            <EyebrowBadge>{t("alumni_eyebrow")}</EyebrowBadge>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-sans text-4xl font-semibold leading-[0.98] tracking-tighter text-foreground md:text-5xl">
              {t("alumni_title")}{" "}
              <span className="text-accent">{t("alumni_title_accent")}</span>
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-base leading-relaxed text-zinc-400 md:text-lg">
              {t("alumni_desc")}
            </p>
          </AnimatedItem>
        </AnimatedSection>

        {isLoading ? (
          <div className="mx-auto h-[480px] max-w-md animate-pulse rounded-[28px] bg-white/[0.04]" />
        ) : (
          <>
            <div
              className="relative mx-auto touch-pan-y select-none [perspective:1400px]"
              style={{ height: "clamp(460px, 78vw, 560px)" }}
              onTouchStart={(e) => beginDrag(e.touches[0]?.clientX ?? 0)}
              onTouchEnd={(e) => endDrag(e.changedTouches[0]?.clientX ?? 0)}
              onPointerDown={(e) => {
                if (e.pointerType === "mouse") beginDrag(e.clientX);
              }}
              onPointerUp={(e) => {
                if (e.pointerType === "mouse") endDrag(e.clientX);
              }}
              role="region"
              aria-roledescription="carousel"
              aria-label={t("alumni_eyebrow")}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 z-50 w-10 bg-gradient-to-r from-background via-background/80 to-transparent sm:w-20 md:w-28"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-0 z-50 w-10 bg-gradient-to-l from-background via-background/80 to-transparent sm:w-20 md:w-28"
              />

              <div className="relative mx-auto h-[82%] w-full max-w-[1180px]">
                {people.map((person, index) => (
                  <AlumniCarouselCard
                    key={person.id}
                    person={person}
                    offset={circularOffset(index, active, length)}
                    index={index}
                    total={length}
                    reduced={reduced}
                    playing={playing && index === active}
                    onPlay={() => setPlaying(true)}
                  />
                ))}
              </div>

              {current && length > 0 ? (
                <div className="absolute bottom-0 left-1/2 z-50 flex w-[min(420px,92%)] -translate-x-1/2 items-center gap-3 rounded-full border border-white/15 bg-black/55 px-3 py-2.5 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                  <button
                    type="button"
                    aria-label="Previous alumni"
                    onClick={(e) => {
                      e.stopPropagation();
                      go(-1);
                    }}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-foreground transition hover:bg-white/[0.12]"
                  >
                    <ArrowLeft size={16} weight="bold" />
                  </button>

                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/20 bg-zinc-800">
                    {current.photo ? (
                      <Image src={current.photo} alt="" fill sizes="40px" className="object-cover" />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-sm font-semibold text-foreground">
                      {current.name}
                    </p>
                    <p className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">
                      {current.batch ? `Batch ${current.batch}` : "Alumni"}
                      {current.featured ? " · Featured" : ""}
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label="Next alumni"
                    onClick={(e) => {
                      e.stopPropagation();
                      go(1);
                    }}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-foreground transition hover:bg-white/[0.12]"
                  >
                    <ArrowRight size={16} weight="bold" />
                  </button>
                </div>
              ) : null}

              <p className="sr-only" aria-live="polite">
                {current?.name}
                {current?.role ? `, ${current.role}` : ""}
              </p>
            </div>

            <div className="mt-10 flex justify-center md:mt-12">
              <Link
                href="/alumni"
                className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-foreground transition-all duration-200 hover:bg-white/[0.08]"
              >
                {t("alumni_dir")}
                <ArrowUpRight
                  size={14}
                  weight="bold"
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
