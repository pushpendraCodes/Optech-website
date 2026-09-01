"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowUpRight, X } from "@phosphor-icons/react";
import { btnPrimary } from "@/components/ui/ui";
import { useI18n } from "@/components/providers/I18nProvider";
import { useGetAdsQuery, useGetPopupsQuery } from "@/lib/api";

const MAIN_KEY = "optech-main-popup";
const SIDE_KEY = "optech-side-ad";
const ROTATE_MS = 5000;

export function HomeOverlays() {
  const [showMain, setShowMain] = useState(false);
  const [showSide, setShowSide] = useState(false);
  const [adIndex, setAdIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const { t } = useI18n();
  const { data: popupData } = useGetPopupsQuery();
  const { data: adsData } = useGetAdsQuery();

  // Public API returns at most one active main popup
  const apiPopup = popupData?.data?.[0];
  const popup = apiPopup
    ? {
        title: apiPopup.title,
        body: apiPopup.body ?? "",
        href: apiPopup.href || "/courses",
        cta: apiPopup.cta || "Learn more",
        image: apiPopup.image?.url ?? "",
        points: [] as string[],
        eyebrow: "Announcement",
      }
    : null;

  const sideAds =
    adsData?.data?.filter((item) => item.slot === "side").map((item) => ({
      id: item._id,
      label: "Sponsored",
      title: item.title,
      body: item.body ?? "",
      href: item.href || "/courses",
      cta: item.cta || "View",
      image: item.image?.url ?? "",
    })) ?? [];
  const ads = sideAds;
  const ad = ads[adIndex] ?? ads[0];

  useEffect(() => {
    if (!popup) return;
    if (!sessionStorage.getItem(MAIN_KEY)) {
      const timer = window.setTimeout(() => setShowMain(true), 700);
      return () => window.clearTimeout(timer);
    }
    if (!sessionStorage.getItem(SIDE_KEY) && ads.length) setShowSide(true);
  }, [popup, ads.length]);

  useEffect(() => {
    if (!showSide || paused || ads.length < 2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const timer = window.setInterval(() => {
      setAdIndex((i) => (i + 1) % ads.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [showSide, paused, ads.length]);

  const closeMain = () => {
    sessionStorage.setItem(MAIN_KEY, "1");
    setShowMain(false);
    if (!sessionStorage.getItem(SIDE_KEY)) setShowSide(true);
  };

  const closeSide = () => {
    sessionStorage.setItem(SIDE_KEY, "1");
    setShowSide(false);
  };

  return (
    <>
      {showMain && popup ? (
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
              aria-label={t("popup_close")}
              className="absolute right-4 top-4 z-10 cursor-pointer rounded-full border border-white/10 bg-black/40 p-2.5 text-zinc-300 transition-colors duration-200 hover:text-foreground"
            >
              <X size={18} weight="bold" />
            </button>

            <div className="relative aspect-[4/3] min-h-[220px] overflow-hidden bg-zinc-950 md:aspect-auto md:min-h-[420px]">
              {popup.image ? (
                <Image
                  src={popup.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 55vw, 100vw"
                  className="object-contain"
                  priority
                />
              ) : (
                <div className="p-8 md:p-12">
                  <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent">
                    {popup.eyebrow}
                  </p>
                  <h2
                    id="home-popup-title"
                    className="mt-5 max-w-[16ch] font-sans text-4xl font-semibold leading-[0.98] tracking-tighter text-foreground md:text-6xl"
                  >
                    {popup.title}
                  </h2>
                  <p className="mt-6 max-w-[42ch] font-sans text-base leading-relaxed text-zinc-300 md:text-lg">
                    {popup.body}
                  </p>
                </div>
              )}
              {popup.image ? (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 md:p-8">
                  <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent">
                    {popup.eyebrow}
                  </p>
                  <h2
                    id="home-popup-title"
                    className="mt-2 max-w-[18ch] font-sans text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl"
                  >
                    {popup.title}
                  </h2>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col justify-center gap-6 border-t border-white/8 p-8 md:border-l md:border-t-0 md:p-10">
              {popup.image ? (
                <p className="font-sans text-base leading-relaxed text-zinc-300">{popup.body}</p>
              ) : null}
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
      ) : null}

      {showSide && ad ? (
        <aside
          className="fixed bottom-24 left-4 z-[55] w-[300px] md:left-8"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="overflow-hidden rounded-[4px] border border-white/12 bg-[#1a1a1d] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)]">
            <div className="flex items-center justify-between bg-black/40 px-2.5 py-1">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">
                {t("ad_sponsored")} · {ad.label}
              </p>
              <button
                type="button"
                onClick={closeSide}
                aria-label={t("ad_dismiss")}
                className="cursor-pointer rounded-sm p-1 text-zinc-500 transition-colors duration-200 hover:text-foreground"
              >
                <X size={12} weight="bold" />
              </button>
            </div>

            <Link href={ad.href} className="block">
              <div className="relative h-[250px] w-full overflow-hidden bg-zinc-950">
                {ad.image ? (
                  <Image
                    src={ad.image}
                    alt=""
                    fill
                    sizes="300px"
                    className="object-cover object-center"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(212,162,47,0.28),transparent_55%)]">
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-accent/80">
                      300 × 250
                    </span>
                  </div>
                )}
              </div>
              <div className="min-h-[70px] px-3 py-3">
                <p className="font-sans text-[15px] font-semibold leading-snug text-foreground">
                  {ad.title}
                </p>
                <p className="mt-1 font-sans text-xs leading-relaxed text-zinc-400">
                  {ad.body}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                  {ad.cta}
                  <ArrowUpRight size={11} weight="bold" />
                </span>
              </div>
            </Link>

            {ads.length > 1 ? (
              <div className="flex items-center justify-center gap-1.5 border-t border-white/8 py-2">
                {ads.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`Show ad ${i + 1}`}
                    aria-current={i === adIndex}
                    onClick={() => setAdIndex(i)}
                    className={`h-1.5 cursor-pointer rounded-full transition-all duration-200 ${
                      i === adIndex ? "w-5 bg-accent" : "w-1.5 bg-white/25 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </aside>
      ) : null}
    </>
  );
}
