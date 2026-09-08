"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, X } from "@phosphor-icons/react";
import { useI18n } from "@/components/providers/I18nProvider";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useGetAdsQuery } from "@/lib/api";

const ROTATE_MS = 6000;

type AdItem = {
  id: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  image: string;
  isVideo: boolean;
};

function isAdVideo(image?: { url?: string; resourceType?: string }) {
  if (!image?.url) return false;
  if (image.resourceType === "video") return true;
  const url = image.url.toLowerCase();
  return /\.(mp4|webm|mov)(\?|$)/i.test(url) || url.includes("/video/upload/");
}

function mapSlot(slot?: string): "box1" | "box2" | null {
  if (slot === "box1" || slot === "home-between" || !slot) return "box1";
  if (slot === "box2" || slot === "side") return "box2";
  return null;
}

function FixedAdBox({
  label,
  items,
  dismissKey,
  side,
}: {
  label: string;
  items: AdItem[];
  dismissKey: string;
  side: "left" | "right";
}) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ad = items[index] ?? items[0];

  useEffect(() => {
    if (sessionStorage.getItem(dismissKey)) {
      setHidden(true);
      return;
    }
    const timer = window.setTimeout(() => setHidden(false), side === "left" ? 900 : 1100);
    return () => window.clearTimeout(timer);
  }, [dismissKey, side]);

  useEffect(() => {
    setIndex(0);
  }, [items]);

  useEffect(() => {
    if (hidden || paused || items.length < 2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || ad?.isVideo) return;
    const timer = window.setTimeout(() => {
      setIndex((i) => (i + 1) % items.length);
    }, ROTATE_MS);
    return () => window.clearTimeout(timer);
  }, [hidden, paused, items.length, ad?.isVideo, index]);

  useEffect(() => {
    if (hidden || !ad?.isVideo) return;
    const el = videoRef.current;
    if (!el) return;
    el.muted = true;
    el.currentTime = 0;
    const play = el.play();
    if (play && typeof play.catch === "function") play.catch(() => undefined);
  }, [hidden, ad?.id, ad?.isVideo, index]);

  if (hidden || !ad) return null;

  const sideClass =
    side === "left"
      ? "left-3 bottom-24 md:left-6"
      : "right-3 bottom-[22rem] md:right-6 md:bottom-24";

  return (
    <aside
      className={`fixed z-[55] w-[min(300px,calc(100vw-1.5rem))] ${sideClass}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="overflow-hidden rounded-[4px] border border-white/12 bg-[#1a1a1d] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)]">
        <div className="flex items-center justify-between bg-black/40 px-2.5 py-1.5">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">
            {t("ad_sponsored")} · {label}
          </p>
          <button
            type="button"
            onClick={() => {
              sessionStorage.setItem(dismissKey, "1");
              setHidden(true);
            }}
            aria-label={t("ad_dismiss")}
            className="cursor-pointer rounded-sm p-1 text-zinc-500 transition-colors duration-200 hover:text-foreground"
          >
            <X size={14} weight="bold" />
          </button>
        </div>

        <Link href={ad.href} className="block">
          <div className="relative h-[220px] w-full overflow-hidden bg-zinc-950 md:h-[250px]">
            {ad.image ? (
              ad.isVideo ? (
                <video
                  ref={videoRef}
                  src={ad.image}
                  className="absolute inset-0 h-full w-full object-cover"
                  muted
                  playsInline
                  loop={items.length < 2}
                  controls
                  preload="auto"
                  onEnded={() => {
                    if (items.length < 2 || paused) return;
                    setIndex((i) => (i + 1) % items.length);
                  }}
                />
              ) : (
                <Image
                  src={ad.image}
                  alt=""
                  fill
                  sizes="300px"
                  className="object-cover object-center"
                />
              )
            ) : (
              <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(212,162,47,0.28),transparent_55%)]">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-accent/80">
                  {label}
                </span>
              </div>
            )}
          </div>
          <div className="min-h-[70px] px-3 py-3">
            <p className="font-sans text-[15px] font-semibold leading-snug text-foreground">{ad.title}</p>
            {ad.body ? (
              <p className="mt-1 line-clamp-2 font-sans text-xs leading-relaxed text-zinc-400">{ad.body}</p>
            ) : null}
            <span className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
              {ad.cta}
              <ArrowUpRight size={11} weight="bold" />
            </span>
          </div>
        </Link>

        {items.length > 1 ? (
          <div className="flex items-center justify-center gap-1.5 border-t border-white/8 py-2">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Show ${label} ad ${i + 1}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className={`h-1.5 cursor-pointer rounded-full transition-all duration-200 ${
                  i === index ? "w-5 bg-accent" : "w-1.5 bg-white/25 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </aside>
  );
}

/** Fixed left (Box 1) and right (Box 2) ad panels — not in page flow. */
export function HomeAdBanner() {
  const { data } = useGetAdsQuery();
  const site = useSiteSettings();

  const { box1, box2 } = useMemo(() => {
    const rows = data?.data ?? [];
    const toItem = (item: (typeof rows)[number]): AdItem => ({
      id: item._id,
      title: item.title,
      body: item.body ?? "",
      href: item.href || "/courses",
      cta: item.cta || "View",
      image: item.image?.url ?? "",
      isVideo: isAdVideo(item.image),
    });

    return {
      box1: rows.filter((item) => mapSlot(item.slot) === "box1").map(toItem),
      box2: rows.filter((item) => mapSlot(item.slot) === "box2").map(toItem),
    };
  }, [data]);

  const showBox1 = site.adBox1Enabled && box1.length > 0;
  const showBox2 = site.adBox2Enabled && box2.length > 0;
  if (!showBox1 && !showBox2) return null;

  return (
    <>
      {showBox1 ? (
        <FixedAdBox label="Box 1" items={box1} dismissKey="optech-ad-box1" side="left" />
      ) : null}
      {showBox2 ? (
        <FixedAdBox label="Box 2" items={box2} dismissKey="optech-ad-box2" side="right" />
      ) : null}
    </>
  );
}
