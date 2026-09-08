"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Globe, LinkedinLogo, XLogo } from "@phosphor-icons/react";
import { EyebrowBadge } from "@/components/ui/EyebrowBadge";
import { AnimatedItem, AnimatedSection } from "@/components/ui/AnimatedSection";
import { useI18n } from "@/components/providers/I18nProvider";
import { useGetStaffQuery } from "@/lib/api";

const AUTO_MS = 2600;
const TRANSITION_MS = 850;
const SWIPE_THRESHOLD = 40;

type CarouselMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
};

function isHttp(url?: string) {
  return Boolean(url && /^https?:\/\//i.test(url));
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
      scale: 1.22,
      opacity: 1,
      blur: 0,
      brightness: 1.05,
      z: 40,
      y: 0,
      shadow:
        "0 32px 64px -16px rgba(0,0,0,0.88), 0 0 48px -8px rgba(212,162,47,0.38), inset 0 1px 0 rgba(255,255,255,0.08)",
    };
  }
  if (abs === 1) {
    return {
      scale: 0.88,
      opacity: 0.68,
      blur: 0.8,
      brightness: 0.7,
      z: 30,
      y: 22,
      shadow: "0 18px 40px -22px rgba(0,0,0,0.75)",
    };
  }
  if (abs === 2) {
    return {
      scale: 0.76,
      opacity: 0.38,
      blur: 1.6,
      brightness: 0.52,
      z: 20,
      y: 40,
      shadow: "0 12px 28px -20px rgba(0,0,0,0.7)",
    };
  }
  return {
    scale: 0.66,
    opacity: 0,
    blur: 2.5,
    brightness: 0.4,
    z: 10,
    y: 52,
    shadow: "none",
  };
}

function StaffCarouselCard({
  member,
  offset,
  reduced,
}: {
  member: CarouselMember;
  offset: number;
  reduced: boolean;
}) {
  const visual = cardVisual(offset);
  const abs = Math.abs(offset);
  const hideClass =
    abs > 2 ? "hidden lg:block" : abs > 1 ? "hidden md:block" : "block";

  return (
    <article
      className={`absolute left-1/2 top-0 w-[min(220px,58vw)] sm:w-[240px] md:w-[260px] lg:w-[272px] ${hideClass}`}
      style={{
        transform: `translate3d(calc(-50% + ${offset * 72}%), ${visual.y}px, 0) scale(${visual.scale})`,
        opacity: visual.opacity,
        zIndex: visual.z,
        filter: reduced
          ? undefined
          : `blur(${visual.blur}px) brightness(${visual.brightness})`,
        transition: reduced
          ? undefined
          : `transform ${TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${TRANSITION_MS}ms ease, filter ${TRANSITION_MS}ms ease`,
        willChange: "transform, opacity, filter",
        pointerEvents: abs === 0 ? "auto" : "none",
      }}
      aria-hidden={abs !== 0}
    >
      <div
        className="overflow-hidden rounded-[22px] border border-white/10 bg-zinc-950"
        style={{ boxShadow: visual.shadow }}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-900">
          {member.photo ? (
            <Image
              src={member.photo}
              alt={abs === 0 ? member.name : ""}
              fill
              sizes="(min-width: 1024px) 272px, (min-width: 768px) 260px, 58vw"
              className="object-cover"
              priority={abs === 0}
            />
          ) : (
            <div className="flex h-full items-center justify-center font-mono text-3xl text-accent/70">
              {member.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/92 via-black/40 to-transparent px-4 pb-4 pt-20">
            <p className="font-sans text-lg font-semibold tracking-tight text-foreground md:text-xl">
              {member.name}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
              {member.role || "Faculty"}
            </p>
          </div>
        </div>

        {abs === 0 ? (
          <div className="border-t border-white/8 px-4 py-3">
            {member.bio ? (
              <p className="line-clamp-2 font-sans text-xs leading-relaxed text-zinc-400">{member.bio}</p>
            ) : null}
            <div className="mt-2.5 flex min-h-[18px] items-center gap-3 text-zinc-500">
              {isHttp(member.linkedin) ? (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${member.name} LinkedIn`}
                  className="transition-colors hover:text-foreground"
                >
                  <LinkedinLogo size={16} />
                </a>
              ) : null}
              {isHttp(member.twitter) ? (
                <a
                  href={member.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${member.name} X`}
                  className="transition-colors hover:text-foreground"
                >
                  <XLogo size={16} />
                </a>
              ) : null}
              {isHttp(member.website) ? (
                <a
                  href={member.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${member.name} website`}
                  className="transition-colors hover:text-foreground"
                >
                  <Globe size={16} />
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function HomeStaff() {
  const { t } = useI18n();
  const { data, isLoading } = useGetStaffQuery();
  const members = useMemo<CarouselMember[]>(
    () =>
      (data?.data ?? []).map((member) => ({
        id: member._id,
        name: member.name,
        role: member.role ?? "",
        bio: member.bio ?? member.focus ?? "",
        photo: member.photo?.url ?? "",
        linkedin: member.linkedin,
        twitter: member.twitter,
        website: member.website,
      })),
    [data],
  );

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const length = members.length;

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

  const go = useCallback(
    (dir: 1 | -1) => {
      if (length < 2) return;
      setActive((i) => (i + dir + length) % length);
    },
    [length],
  );

  useEffect(() => {
    if (paused || reduced || length < 2) return;
    const timer = window.setInterval(() => go(1), AUTO_MS);
    return () => window.clearInterval(timer);
  }, [paused, reduced, length, go]);

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
      id="staff"
      className="relative overflow-hidden border-t border-white/5 bg-background px-6 py-24 md:px-10 md:py-32"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        dragStartX.current = null;
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/3 h-[55%] opacity-70"
        style={{
          background:
            "radial-gradient(42% 60% at 50% 55%, rgba(212,162,47,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1400px]">
        <AnimatedSection className="mb-12 flex max-w-[42rem] flex-col gap-5 md:mb-16">
          <AnimatedItem>
            <EyebrowBadge>{t("staff_eyebrow")}</EyebrowBadge>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-sans text-4xl font-semibold leading-[0.98] tracking-tighter text-foreground md:text-5xl">
              {t("staff_title")}{" "}
              <span className="text-accent">{t("staff_title_accent")}</span>
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-base leading-relaxed text-zinc-400 md:text-lg">
              {t("staff_desc")}
            </p>
          </AnimatedItem>
        </AnimatedSection>

        {isLoading ? (
          <div className="mx-auto h-[440px] max-w-sm animate-pulse rounded-[22px] bg-white/[0.04]" />
        ) : (
          <div
            className="relative mx-auto touch-pan-y select-none"
            style={{ height: "clamp(420px, 72vw, 540px)" }}
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
            aria-label={t("staff_team")}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 z-50 w-12 bg-gradient-to-r from-background via-background/85 to-transparent sm:w-20 md:w-32"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 z-50 w-12 bg-gradient-to-l from-background via-background/85 to-transparent sm:w-20 md:w-32"
            />

            <div className="relative mx-auto h-[88%] w-full max-w-[1120px]">
              {members.map((member, index) => (
                <StaffCarouselCard
                  key={member.id}
                  member={member}
                  offset={circularOffset(index, active, length)}
                  reduced={reduced}
                />
              ))}
            </div>

            {length > 1 ? (
              <div className="absolute bottom-1 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1.5">
                {members.map((member, i) => (
                  <button
                    key={member.id}
                    type="button"
                    aria-label={`Show ${member.name}`}
                    aria-current={i === active}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActive(i);
                    }}
                    className={`h-1.5 cursor-pointer rounded-full transition-all duration-300 ${
                      i === active ? "w-5 bg-accent" : "w-1.5 bg-white/25 hover:bg-white/45"
                    }`}
                  />
                ))}
              </div>
            ) : null}

            <p className="sr-only" aria-live="polite">
              {members[active]?.name}
              {members[active]?.role ? `, ${members[active]?.role}` : ""}
            </p>
          </div>
        )}

        <div className="mt-10 flex justify-center md:mt-12">
          <Link
            href="/staff"
            className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-foreground transition-all duration-200 hover:bg-white/[0.08]"
          >
            {t("staff_team")}
            <ArrowUpRight
              size={14}
              weight="bold"
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
