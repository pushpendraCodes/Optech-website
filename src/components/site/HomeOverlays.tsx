"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { btnPrimary } from "@/components/ui/ui";
import { useI18n } from "@/components/providers/I18nProvider";
import { useGetPopupsQuery } from "@/lib/api";

const MAIN_KEY = "optech-main-popup";
const MEDIA_IMAGE_MS = 4500;

type PopupMedia = { url: string; isVideo: boolean };

function isPopupVideo(image?: { url?: string; resourceType?: string; format?: string }) {
  if (!image?.url) return false;
  if (image.resourceType === "video") return true;
  const url = image.url.toLowerCase();
  return /\.(mp4|webm|mov)(\?|$)/i.test(url) || url.includes("/video/upload/");
}

function AutoScrollBody({ text }: { text: string }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content || !text.trim()) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let frame = 0;
    let dir: 1 | -1 = 1;
    let paused = false;
    let pauseUntil = 0;

    const tick = () => {
      const max = content.scrollHeight - viewport.clientHeight;
      if (max <= 8) {
        frame = window.requestAnimationFrame(tick);
        return;
      }
      const now = Date.now();
      if (!paused && now >= pauseUntil) {
        viewport.scrollTop += dir * 0.45;
        if (viewport.scrollTop >= max - 1) {
          dir = -1;
          pauseUntil = now + 1400;
        } else if (viewport.scrollTop <= 0) {
          dir = 1;
          pauseUntil = now + 1400;
        }
      }
      frame = window.requestAnimationFrame(tick);
    };

    const onEnter = () => {
      paused = true;
    };
    const onLeave = () => {
      paused = false;
    };
    viewport.addEventListener("pointerenter", onEnter);
    viewport.addEventListener("pointerleave", onLeave);
    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
      viewport.removeEventListener("pointerenter", onEnter);
      viewport.removeEventListener("pointerleave", onLeave);
    };
  }, [text]);

  if (!text.trim()) return null;

  return (
    <div ref={viewportRef} className="max-h-[11rem] overflow-y-auto pr-1 [scrollbar-width:thin]">
      <p ref={contentRef} className="font-sans text-base leading-relaxed text-zinc-300">
        {text}
      </p>
    </div>
  );
}

function PopupMediaCarousel({
  items,
  active,
  title,
  eyebrow,
}: {
  items: PopupMedia[];
  active: boolean;
  title: string;
  eyebrow: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const current = items[index] ?? items[0];
  const multi = items.length > 1;

  useEffect(() => {
    setIndex(0);
  }, [items]);

  useEffect(() => {
    if (!active || !current || paused || items.length < 2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || current.isVideo) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % items.length), MEDIA_IMAGE_MS);
    return () => window.clearTimeout(timer);
  }, [active, current, paused, items.length, index]);

  useEffect(() => {
    if (!active || !current?.isVideo) return;
    const el = videoRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.muted = true;
    el.currentTime = 0;
    if (!reduce) {
      const play = el.play();
      if (play && typeof play.catch === "function") play.catch(() => undefined);
    }
  }, [active, current?.url, current?.isVideo, index]);

  if (!current) {
    return (
      <div className="p-8 md:p-12">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent">{eyebrow}</p>
        <h2
          id="home-popup-title"
          className="mt-5 max-w-[16ch] font-sans text-4xl font-semibold leading-[0.98] tracking-tighter text-foreground md:text-6xl"
        >
          {title}
        </h2>
      </div>
    );
  }

  return (
    <div
      className="relative aspect-[4/3] min-h-[220px] overflow-hidden bg-zinc-950 md:aspect-auto md:min-h-[420px]"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div
        className="flex h-full w-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {items.map((item, i) => (
          <div key={`${item.url}-${i}`} className="relative h-full w-full shrink-0">
            {item.isVideo ? (
              <video
                ref={i === index ? videoRef : undefined}
                src={item.url}
                className="absolute inset-0 h-full w-full object-contain"
                muted
                playsInline
                controls={i === index}
                loop={!multi}
                preload="metadata"
                onEnded={() => {
                  if (!multi || paused) return;
                  setIndex((prev) => (prev + 1) % items.length);
                }}
              />
            ) : (
              <Image
                src={item.url}
                alt=""
                fill
                sizes="(min-width: 768px) 55vw, 100vw"
                className="object-contain"
                priority={i === 0}
              />
            )}
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 md:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent">{eyebrow}</p>
        <h2
          id="home-popup-title"
          className="mt-2 max-w-[18ch] font-sans text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl"
        >
          {title}
        </h2>
      </div>

      {multi ? (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-2 py-1.5 backdrop-blur-sm">
          {items.map((item, i) => (
            <button
              key={`${item.url}-dot-${i}`}
              type="button"
              aria-label={`Show media ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={`h-1.5 cursor-pointer rounded-full transition-all duration-200 ${
                i === index ? "w-5 bg-accent" : "w-1.5 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function HomeOverlays() {
  const [showMain, setShowMain] = useState(false);
  const { t } = useI18n();
  const { data: popupData } = useGetPopupsQuery();

  const apiPopup = popupData?.data?.[0];
  const mediaItems = useMemo<PopupMedia[]>(() => {
    if (!apiPopup) return [];
    const raw =
      Array.isArray(apiPopup.media) && apiPopup.media.length
        ? apiPopup.media
        : apiPopup.image
          ? [apiPopup.image]
          : [];
    return raw
      .filter((item) => Boolean(item?.url))
      .map((item) => ({
        url: String(item.url),
        isVideo: isPopupVideo(item),
      }));
  }, [apiPopup]);

  const popup = apiPopup
    ? {
        title: apiPopup.title,
        body: apiPopup.body ?? "",
        href: apiPopup.href || "/courses",
        cta: apiPopup.cta || "Learn more",
        media: mediaItems,
        points: [] as string[],
        eyebrow: "Announcement",
      }
    : null;

  useEffect(() => {
    if (!popup) return;
    if (!sessionStorage.getItem(MAIN_KEY)) {
      const timer = window.setTimeout(() => setShowMain(true), 700);
      return () => window.clearTimeout(timer);
    }
  }, [popup]);

  const closeMain = () => {
    sessionStorage.setItem(MAIN_KEY, "1");
    setShowMain(false);
  };

  if (!showMain || !popup) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-8">
      <button
        type="button"
        aria-label={t("popup_close_bg")}
        className="absolute inset-0 cursor-pointer bg-black/78 backdrop-blur-md"
        onClick={closeMain}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="home-popup-title"
        className="card-surface relative z-10 grid w-full max-w-5xl overflow-hidden md:grid-cols-[1.15fr_0.85fr]"
      >
        <button
          type="button"
          onClick={closeMain}
          className="absolute right-4 top-4 z-10 cursor-pointer rounded-full border border-white/10 bg-black/45 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-200 transition-colors duration-200 hover:border-white/20 hover:bg-black/60 hover:text-foreground"
        >
          {t("popup_close")}
        </button>

        <PopupMediaCarousel
          items={popup.media}
          active={showMain}
          title={popup.title}
          eyebrow={popup.eyebrow}
        />

        <div className="flex flex-col justify-center gap-6 border-t border-white/8 p-8 md:border-l md:border-t-0 md:p-10">
          {popup.media.length ? <AutoScrollBody text={popup.body} /> : null}
          {popup.points.length ? (
            <ul className="space-y-3">
              {popup.points.map((point) => (
                <li key={point} className="flex gap-3 font-sans text-sm text-zinc-300">
                  <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {point}
                </li>
              ))}
            </ul>
          ) : null}
          <Link href={popup.href} onClick={closeMain} className={`${btnPrimary} self-start px-6 py-3`}>
            {popup.cta}
            <ArrowUpRight size={14} weight="bold" />
          </Link>
          <button
            type="button"
            onClick={closeMain}
            className="cursor-pointer self-start font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500 transition-colors duration-200 hover:text-zinc-300"
          >
            {t("popup_continue")}
          </button>
        </div>
      </div>
    </div>
  );
}
