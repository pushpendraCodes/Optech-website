"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, X } from "@phosphor-icons/react";
import { HOME_POPUP, SIDE_ADS } from "@/lib/site-content";
import { btnPrimary } from "@/components/ui/ui";
import { useI18n } from "@/components/providers/I18nProvider";

const MAIN_KEY = "optech-main-popup";
const SIDE_KEY = "optech-side-ad";
const ROTATE_MS = 5000;

export function HomeOverlays() {
  const [showMain, setShowMain] = useState(false);
  const [showSide, setShowSide] = useState(false);
  const [adIndex, setAdIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    if (!sessionStorage.getItem(MAIN_KEY)) {
      const timer = window.setTimeout(() => setShowMain(true), 700);
      return () => window.clearTimeout(timer);
    }
    if (!sessionStorage.getItem(SIDE_KEY)) setShowSide(true);
  }, []);

  useEffect(() => {
    if (!showSide || paused || SIDE_ADS.length < 2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const timer = window.setInterval(() => {
      setAdIndex((i) => (i + 1) % SIDE_ADS.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [showSide, paused]);

  const closeMain = () => {
    sessionStorage.setItem(MAIN_KEY, "1");
    setShowMain(false);
    if (!sessionStorage.getItem(SIDE_KEY)) setShowSide(true);
  };

  const closeSide = () => {
    sessionStorage.setItem(SIDE_KEY, "1");
    setShowSide(false);
  };

  const ad = SIDE_ADS[adIndex];

  return (
    <>
      {showMain ? (
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

            <div className="relative min-h-[220px] bg-[radial-gradient(circle_at_20%_15%,rgba(212,162,47,0.32),transparent_52%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.06),transparent_45%)] p-8 md:min-h-[420px] md:p-12">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent">
                {HOME_POPUP.eyebrow}
              </p>
              <h2
                id="home-popup-title"
                className="mt-5 max-w-[16ch] font-sans text-4xl font-semibold leading-[0.98] tracking-tighter text-foreground md:text-6xl"
              >
                {HOME_POPUP.title}
              </h2>
              <p className="mt-6 max-w-[42ch] font-sans text-base leading-relaxed text-zinc-300 md:text-lg">
                {HOME_POPUP.body}
              </p>
            </div>

            <div className="flex flex-col justify-center gap-6 border-t border-white/8 p-8 md:border-l md:border-t-0 md:p-10">
              <ul className="space-y-3">
                {HOME_POPUP.points.map((point) => (
                  <li key={point} className="flex gap-3 font-sans text-sm text-zinc-300">
                    <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {point}
                  </li>
                ))}
              </ul>
              <Link href={HOME_POPUP.href} onClick={closeMain} className={`${btnPrimary} self-start px-6 py-3`}>
                {HOME_POPUP.cta}
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

      {showSide ? (
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
              <div className="relative h-[180px] bg-[radial-gradient(circle_at_30%_20%,rgba(212,162,47,0.28),transparent_55%)]">
                <span className="absolute left-3 top-3 font-mono text-[9px] uppercase tracking-[0.2em] text-accent/80">
                  300 × 250
                </span>
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

            {SIDE_ADS.length > 1 ? (
              <div className="flex items-center justify-center gap-1.5 border-t border-white/8 py-2">
                {SIDE_ADS.map((item, i) => (
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
