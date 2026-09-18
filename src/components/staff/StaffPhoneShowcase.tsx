"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Globe, LinkedinLogo, XLogo } from "@phosphor-icons/react";

export type ShowcaseMember = {
  id?: string;
  name: string;
  role?: string;
  focus?: string;
  bio?: string;
  photo: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
};

const AUTO_MS = 3400;

function isHttp(url?: string) {
  return Boolean(url && /^https?:\/\//i.test(url));
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function wrapIndex(index: number, length: number) {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

function useTilt(intensity = 12) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const [pose, setPose] = useState({ rx: 0, ry: 0, scale: 1, gx: 50, gy: 50, glare: 0 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(fine && !reduced);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!enabled || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        setPose({
          ry: (px - 0.5) * intensity * 2,
          rx: (0.5 - py) * intensity * 2,
          scale: 1.07,
          gx: px * 100,
          gy: py * 100,
          glare: 0.45,
        });
      });
    },
    [enabled, intensity],
  );

  const onLeave = useCallback(() => {
    if (frame.current) cancelAnimationFrame(frame.current);
    setPose({ rx: 0, ry: 0, scale: 1, gx: 50, gy: 50, glare: 0 });
  }, []);

  return { ref, pose, enabled, onMove, onLeave };
}

function Portrait({ member }: { member: ShowcaseMember }) {
  if (member.photo) {
    return (
      <Image
        src={member.photo}
        alt={member.name}
        fill
        sizes="280px"
        className="object-cover"
      />
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-zinc-900 font-mono text-2xl text-accent/80">
      {initials(member.name)}
    </div>
  );
}

function Glare({ x, y, opacity }: { x: number; y: number; opacity: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        opacity,
        background: `radial-gradient(180px circle at ${x}% ${y}%, rgba(255,255,255,0.55), transparent 58%)`,
        mixBlendMode: "overlay",
      }}
    />
  );
}

function SocialLinks({ member, size = 18 }: { member: ShowcaseMember; size?: number }) {
  const links = [
    { href: member.linkedin, label: "LinkedIn", Icon: LinkedinLogo },
    { href: member.twitter, label: "X", Icon: XLogo },
    { href: member.website, label: "website", Icon: Globe },
  ].filter((link) => isHttp(link.href));

  if (links.length === 0) return null;

  return (
    <div className="flex items-center justify-center gap-3 text-zinc-500">
      {links.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${member.name} ${label}`}
          className="cursor-pointer transition-colors duration-200 hover:text-foreground"
        >
          <Icon size={size} />
        </a>
      ))}
    </div>
  );
}

function SideCard({ member, onSelect }: { member: ShowcaseMember; onSelect: () => void }) {
  const tilt = useTilt(12);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Show ${member.name}`}
      className="group relative block w-[19vw] max-w-[220px] min-w-[84px] flex-none cursor-pointer [perspective:1200px]"
    >
      <div
        ref={tilt.ref}
        onMouseMove={tilt.onMove}
        onMouseLeave={tilt.onLeave}
        className="relative w-full overflow-hidden rounded-[18px] bg-zinc-900 ring-1 ring-white/10 will-change-transform sm:rounded-[22px] md:rounded-[26px]"
        style={{
          aspectRatio: "9 / 16",
          transform: `rotateX(${tilt.pose.rx}deg) rotateY(${tilt.pose.ry}deg) scale(${tilt.pose.scale}) translateZ(0)`,
          transformStyle: "preserve-3d",
          transition: tilt.enabled
            ? "transform 280ms cubic-bezier(0.22,1,0.36,1), box-shadow 280ms ease"
            : undefined,
          boxShadow:
            tilt.pose.scale > 1
              ? "0 30px 48px -18px rgba(0,0,0,0.75)"
              : "0 16px 28px -16px rgba(0,0,0,0.55)",
        }}
      >
        <Portrait member={member} />
        <Glare x={tilt.pose.gx} y={tilt.pose.gy} opacity={tilt.pose.glare} />
      </div>
    </button>
  );
}

function PhoneCard({ member }: { member: ShowcaseMember }) {
  const tilt = useTilt(9);

  return (
    <div className="relative z-10 w-[27vw] max-w-[310px] min-w-[148px] flex-none [perspective:1400px]">
      <div
        ref={tilt.ref}
        onMouseMove={tilt.onMove}
        onMouseLeave={tilt.onLeave}
        className="relative will-change-transform"
        style={{
          transform: `rotateX(${tilt.pose.rx}deg) rotateY(${tilt.pose.ry}deg) scale(${tilt.pose.scale}) translateZ(28px)`,
          transformStyle: "preserve-3d",
          transition: tilt.enabled
            ? "transform 280ms cubic-bezier(0.22,1,0.36,1)"
            : undefined,
        }}
      >
        <div
          className="relative rounded-[1.85rem] bg-[#111113] p-[6px] sm:rounded-[2.35rem] sm:p-[8px] md:rounded-[2.65rem] md:p-[9px]"
          style={{
            boxShadow:
              "0 42px 70px -24px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.14), inset 0 1px 0 rgba(255,255,255,0.18)",
          }}
        >
          <div className="pointer-events-none absolute top-[9px] left-1/2 z-20 h-[16px] w-[64px] -translate-x-1/2 rounded-full bg-black sm:top-[11px] sm:h-[20px] sm:w-[82px] md:top-[12px] md:h-[22px] md:w-[90px]" />
          <div
            className="relative w-full overflow-hidden rounded-[1.55rem] bg-zinc-900 sm:rounded-[1.95rem] md:rounded-[2.15rem]"
            style={{ aspectRatio: "9 / 16.8" }}
          >
            <Portrait member={member} />
            <Glare x={tilt.pose.gx} y={tilt.pose.gy} opacity={tilt.pose.glare} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function StaffPhoneShowcase({ members }: { members: ShowcaseMember[] }) {
  const people = useMemo(() => members.filter((member) => member.name), [members]);
  const length = people.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (length === 0) return;
    setActive((index) => wrapIndex(index, length));
  }, [length]);

  useEffect(() => {
    if (paused || reduced || length < 2) return;
    const timer = window.setInterval(() => {
      setActive((index) => wrapIndex(index + 1, length));
    }, AUTO_MS);
    return () => window.clearInterval(timer);
  }, [paused, reduced, length]);

  if (length === 0) return null;

  const featured = people[wrapIndex(active, length)];
  const sideCount = Math.min(4, Math.max(0, length - 1));
  const leftCount = Math.floor(sideCount / 2);
  const rightCount = sideCount - leftCount;
  const left = Array.from({ length: leftCount }, (_, i) =>
    people[wrapIndex(active - leftCount + i, length)],
  );
  const right = Array.from({ length: rightCount }, (_, i) =>
    people[wrapIndex(active + 1 + i, length)],
  );

  const selectMember = (member: ShowcaseMember) => {
    const index = people.findIndex((item) => (item.id ?? item.photo ?? item.name) === (member.id ?? member.photo ?? member.name));
    if (index >= 0) setActive(index);
  };

  return (
    <div
      className="mx-auto w-full max-w-[1100px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="px-1 py-4 sm:px-2 sm:py-6 md:py-8">
        <div
          className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4"
          role="region"
          aria-roledescription="carousel"
          aria-label="Staff"
        >
          {left.map((member, index) => (
            <SideCard
              key={`left-${member.id ?? member.photo ?? member.name}-${index}`}
              member={member}
              onSelect={() => selectMember(member)}
            />
          ))}
          {featured ? <PhoneCard member={featured} /> : null}
          {right.map((member, index) => (
            <SideCard
              key={`right-${member.id ?? member.photo ?? member.name}-${index}`}
              member={member}
              onSelect={() => selectMember(member)}
            />
          ))}
        </div>

        {featured ? (
          <div className="mx-auto mt-8 max-w-xl text-center sm:mt-10">
            <p className="font-sans text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {featured.name}
            </p>
            {featured.role ? (
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
                {featured.role}
              </p>
            ) : null}
            {featured.focus ? (
              <p className="mt-3 font-sans text-sm text-zinc-300">{featured.focus}</p>
            ) : null}
            {featured.bio ? (
              <p className="mt-3 font-sans text-sm leading-relaxed text-zinc-400 sm:text-base">
                {featured.bio}
              </p>
            ) : null}
            <div className="mt-5">
              <SocialLinks member={featured} />
            </div>
          </div>
        ) : null}

        {length > 1 ? (
          <div className="mt-7 flex items-center justify-center gap-1.5">
            {people.map((member, index) => (
              <button
                key={member.id ?? member.photo ?? `${member.name}-${index}`}
                type="button"
                aria-label={`Show ${member.name}`}
                aria-current={index === wrapIndex(active, length)}
                onClick={() => setActive(index)}
                className={`h-1.5 cursor-pointer rounded-full transition-all duration-300 ${
                  index === wrapIndex(active, length)
                    ? "w-5 bg-accent"
                    : "w-1.5 bg-white/25 hover:bg-white/45"
                }`}
              />
            ))}
          </div>
        ) : null}

        <p className="sr-only" aria-live="polite">
          {featured?.name}
          {featured?.role ? `, ${featured.role}` : ""}
        </p>
      </div>
    </div>
  );
}
