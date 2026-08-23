"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EyebrowBadge } from "@/components/ui/EyebrowBadge";
import { HudFrame } from "@/components/ui/HudFrame";
import {
  BEATS,
  CINE_FRAME_COUNT,
  CINE_INTRO_FADE_END,
  cineFramePath,
} from "@/lib/cinematic";
import { useI18n } from "@/components/providers/I18nProvider";

export function CinematicReveal() {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const introRef = useRef<HTMLDivElement | null>(null);
  const bigLeftTextRef = useRef<HTMLDivElement | null>(null);
  const outroRef = useRef<HTMLDivElement | null>(null);
  const progressFillRef = useRef<HTMLDivElement | null>(null);
  const seqReadoutRef = useRef<HTMLSpanElement | null>(null);

  const framesRef = useRef<HTMLImageElement[]>([]);
  const tickingRef = useRef(false);
  const loadedRef = useRef(false);
  const lastFrameRef = useRef(-1);
  const lastProgressRef = useRef(0);
  const prevVisibleIdsRef = useRef("");

  const [loadProgress, setLoadProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [visibleBeats, setVisibleBeats] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    let loadedCount = 0;
    const imgs: HTMLImageElement[] = [];

    for (let i = 1; i <= CINE_FRAME_COUNT; i++) {
      const img = new Image();
      img.src = cineFramePath(i);
      img.onload = () => {
        if (cancelled) return;
        loadedCount++;
        setLoadProgress(loadedCount / CINE_FRAME_COUNT);
        if (loadedCount === CINE_FRAME_COUNT) {
          loadedRef.current = true;
          setLoaded(true);
        }
      };
      img.onerror = () => {
        if (cancelled) return;
        loadedCount++;
        setLoadProgress(loadedCount / CINE_FRAME_COUNT);
        if (loadedCount === CINE_FRAME_COUNT) {
          loadedRef.current = true;
          setLoaded(true);
        }
      };
      imgs.push(img);
    }
    framesRef.current = imgs;

    return () => {
      cancelled = true;
    };
  }, []);

  const drawFrame = useCallback((index: number, _progress = 0) => {
    const canvas = canvasRef.current;
    const img = framesRef.current[index];
    if (!canvas || !img || !img.complete || !img.naturalWidth) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = cw / ch;

    let drawW: number;
    let drawH: number;
    if (canvasRatio > imgRatio) {
      drawH = ch;
      drawW = ch * imgRatio;
    } else {
      drawW = cw;
      drawH = cw / imgRatio;
    }

    const drawX = (cw - drawW) / 2;
    const drawY = (ch - drawH) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#0a0a0b";
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    drawFrame(
      lastFrameRef.current >= 0 ? lastFrameRef.current : 0,
      lastProgressRef.current,
    );
  }, [drawFrame]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => {
    if (!loaded) return;
    drawFrame(0, 0);
    lastFrameRef.current = 0;
  }, [loaded, drawFrame]);

  useEffect(() => {
    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      requestAnimationFrame(() => {
        tickingRef.current = false;
        const section = sectionRef.current;
        if (!section || !loadedRef.current) return;

        const rect = section.getBoundingClientRect();
        const scrollable = section.offsetHeight - window.innerHeight;
        const progress =
          scrollable <= 0
            ? 0
            : Math.min(1, Math.max(0, -rect.top / scrollable));

        lastProgressRef.current = progress;

        const frameIndex = Math.min(
          CINE_FRAME_COUNT - 1,
          Math.floor(progress * CINE_FRAME_COUNT),
        );
        lastFrameRef.current = frameIndex;
        drawFrame(frameIndex, progress);

        if (introRef.current) {
          const opacity = Math.max(0, 1 - progress / CINE_INTRO_FADE_END);
          introRef.current.style.opacity = String(opacity);
          introRef.current.style.transform = `translateX(${(1 - opacity) * -28}px) translateY(${(1 - opacity) * 12}px)`;
        }

        if (bigLeftTextRef.current) {
          const op = Math.min(1, Math.max(0, (progress - 0.1) / 0.08));
          bigLeftTextRef.current.style.opacity = String(op);
          bigLeftTextRef.current.style.transform = `translateX(${(1 - op) * -36}px) translateY(${(1 - op) * 14}px)`;
        }

        if (outroRef.current) {
          const op = Math.min(1, Math.max(0, (progress - 0.86) / 0.06));
          outroRef.current.style.opacity = String(op);
          outroRef.current.style.transform = `translateX(${(1 - op) * 24}px)`;
        }

        if (progressFillRef.current) {
          progressFillRef.current.style.transform = `scaleX(${progress})`;
        }

        if (seqReadoutRef.current) {
          const n = Math.min(CINE_FRAME_COUNT, frameIndex + 1);
          seqReadoutRef.current.textContent =
            `SEQ ${String(n).padStart(3, "0")} / ${CINE_FRAME_COUNT}`;
        }

        const newVisible = new Set<string>();
        for (const b of BEATS) {
          if (progress >= b.show && progress <= b.hide) newVisible.add(b.id);
        }
        const newIds = [...newVisible].sort().join(",");
        if (newIds !== prevVisibleIdsRef.current) {
          prevVisibleIdsRef.current = newIds;
          setVisibleBeats(newVisible);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [drawFrame]);

  return (
    <section
      ref={sectionRef}
      id="cinematic"
      className="scroll-animation-cine relative border-t border-white/5 bg-background"
    >
      <div
        className="sticky top-0 min-h-[100dvh] w-full overflow-hidden bg-background"
        style={{ height: "100dvh", willChange: "transform", transform: "translateZ(0)" }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          style={{ willChange: "contents", transform: "translateZ(0)" }}
        />

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 10%, transparent 30%, rgba(10,10,11,0.45) 70%, rgba(10,10,11,0.85) 100%)",
          }}
        />

        <div className="pointer-events-none absolute left-6 top-32 text-accent md:left-10 md:top-36">
          <HudFrame corner="tl" size={26} />
        </div>
        <div className="pointer-events-none absolute right-6 top-32 text-accent md:right-10 md:top-36">
          <HudFrame corner="tr" size={26} />
        </div>
        <div className="pointer-events-none absolute bottom-14 left-6 text-accent md:bottom-16 md:left-10">
          <HudFrame corner="bl" size={26} />
        </div>
        <div className="pointer-events-none absolute bottom-14 right-6 text-accent md:bottom-16 md:right-10">
          <HudFrame corner="br" size={26} />
        </div>

        <div
          ref={introRef}
          className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-start gap-5 px-6 pb-24 md:px-12 md:pb-28"
          style={{ transition: "opacity 80ms linear, transform 80ms linear" }}
        >
          <EyebrowBadge>{t("cine_eyebrow")}</EyebrowBadge>
          <h2 className="max-w-[16ch] font-sans text-5xl font-semibold leading-[0.95] tracking-tighter text-foreground md:text-7xl lg:text-8xl">
            {t("cine_h1")}
            <br />
            <span className="text-accent">{t("cine_h1_accent")}</span>
          </h2>
          <p className="max-w-[42ch] font-sans text-sm leading-relaxed text-zinc-400 md:text-base">
            {t("cine_lead")}
          </p>
        </div>

        <div
          ref={bigLeftTextRef}
          className="pointer-events-none absolute bottom-24 left-6 z-10 hidden max-w-[58%] flex-col gap-5 md:flex md:bottom-28 md:left-12"
          style={{ opacity: 0, transition: "opacity 80ms linear, transform 80ms linear" }}
        >
          <span className="inline-flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_rgba(212,162,47,0.85)]"
            />
            {t("cine_log")}
          </span>
          <h2 className="font-sans font-semibold leading-[0.88] tracking-tighter text-foreground text-[clamp(3.4rem,8.5vw,8rem)]">
            {t("cine_h2")}
            <br />
            <span className="text-accent">{t("cine_h2_accent")}</span>
          </h2>
          <p className="max-w-[36ch] font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
            {t("cine_path")}
          </p>
        </div>

        <div className="pointer-events-none absolute left-6 top-28 z-10 flex items-center gap-2 md:left-10 md:top-32">
          <div className="h-px w-8 bg-accent/60" />
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-400">
            {t("cine_log")}
          </span>
        </div>

        <div className="pointer-events-none absolute right-6 top-28 z-10 flex items-center gap-3 md:right-10 md:top-32">
          <span
            ref={seqReadoutRef}
            className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent"
          >
            SEQ 001 / {CINE_FRAME_COUNT}
          </span>
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_rgba(212,162,47,0.85)]"
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
          <div className="mx-6 mb-3 h-px bg-white/10 md:mx-10">
            <div
              ref={progressFillRef}
              className="h-full origin-left bg-accent"
              style={{ transform: "scaleX(0)", transition: "transform 80ms linear" }}
            />
          </div>
          <div className="mx-6 flex items-center justify-between pb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500 md:mx-10">
            <span>{t("cine_path")}</span>
            <span>{t("cine_play")}</span>
            <span>{t("cine_scroll")}</span>
          </div>
        </div>

        {BEATS.map((b, i) => {
          const visible = visibleBeats.has(b.id);
          const position =
            i === 0
              ? "top-[22%] right-6 md:right-12"
              : i === 1
                ? "top-1/2 -translate-y-1/2 right-6 md:right-12"
                : "bottom-24 right-6 md:bottom-28 md:right-12";
          return (
            <div
              key={b.id}
              className={`pointer-events-none absolute ${position} z-20 hidden w-[420px] max-w-[90vw] md:block`}
            >
              <figure
                className={`card-surface pointer-events-auto p-6 transition-all duration-400 ease-out ${
                  visible
                    ? "translate-x-0 opacity-100"
                    : "translate-x-8 opacity-0"
                }`}
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
                  {b.label}
                </span>
                <blockquote className="mt-3 font-sans text-xl font-medium leading-snug tracking-tight text-foreground">
                  &ldquo;{b.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-4 flex items-center justify-between">
                  <span className="font-sans text-sm text-zinc-300">{b.speaker}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-400">
                    {b.film}
                  </span>
                </figcaption>
              </figure>
            </div>
          );
        })}

        <div className="pointer-events-none absolute inset-x-0 top-[38%] z-20 flex flex-col gap-3 px-6 md:hidden">
          {BEATS.map((b) => {
            const visible = visibleBeats.has(b.id);
            return (
              <figure
                key={b.id}
                className={`card-surface pointer-events-auto p-5 transition-all duration-400 ease-out ${
                  visible
                    ? "translate-x-0 opacity-100"
                    : "translate-x-6 opacity-0"
                }`}
              >
                <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-accent">
                  {b.label}
                </span>
                <blockquote className="mt-2 font-sans text-base font-medium leading-snug text-foreground">
                  &ldquo;{b.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-3 flex items-center justify-between">
                  <span className="font-sans text-xs text-zinc-300">{b.speaker}</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400">
                    {b.film}
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>

        <div
          ref={outroRef}
          className="pointer-events-none absolute bottom-24 right-6 z-10 flex flex-col items-end gap-4 md:bottom-32 md:right-12"
          style={{ opacity: 0, transition: "opacity 80ms linear, transform 80ms linear" }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
            Next &mdash; explore
          </span>
          <a
            href="/courses"
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-5 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-foreground backdrop-blur-md transition-all duration-200 hover:bg-white/[0.12] active:translate-y-[1px]"
          >
            View courses
            <span aria-hidden>&rarr;</span>
          </a>
        </div>

        {!loaded && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-5 bg-background px-6">
            <EyebrowBadge>CAREER PATH // LOADING</EyebrowBadge>
            <div className="h-px w-60 bg-white/10 md:w-80">
              <div
                className="h-full bg-accent transition-[width] duration-150 ease-out"
                style={{ width: `${Math.round(loadProgress * 100)}%` }}
              />
            </div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-500">
              Rendering pathway &nbsp;&middot;&nbsp; {Math.round(loadProgress * 100)}%
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
