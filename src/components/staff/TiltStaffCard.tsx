"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Globe, LinkedinLogo, XLogo } from "@phosphor-icons/react";
import { STAFF } from "@/lib/optech";

type Member = (typeof STAFF)[number];

const MAX_TILT = 9; // deg — keep it subtle/premium, not a gimmick
const MAX_PARALLAX = 12; // px, image drifts opposite the card tilt
const GLARE_OPACITY = 0.35;

export function TiltStaffCard({ member }: { member: Member }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const [pose, setPose] = useState({ rotateX: 0, rotateY: 0, scale: 1 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(fine && !reduced);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!enabled || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;

      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        setPose({
          rotateY: (px - 0.5) * MAX_TILT * 2,
          rotateX: (0.5 - py) * MAX_TILT * 2,
          scale: 1.045,
        });
        setGlare({ x: px * 100, y: py * 100, opacity: GLARE_OPACITY });
      });
    },
    [enabled]
  );

  const handleLeave = useCallback(() => {
    if (frame.current) cancelAnimationFrame(frame.current);
    setPose({ rotateX: 0, rotateY: 0, scale: 1 });
    setGlare((g) => ({ ...g, opacity: 0 }));
  }, []);

  const parallaxX = enabled ? ((glare.x - 50) / 50) * -MAX_PARALLAX : 0;
  const parallaxY = enabled ? ((glare.y - 50) / 50) * -MAX_PARALLAX : 0;
  const lifted = pose.scale > 1;

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="group flex flex-col text-left [perspective:1200px]"
    >
      <div
        className="relative overflow-hidden rounded-[20px] bg-zinc-900 will-change-transform"
        style={{
          transform: `rotateX(${pose.rotateX}deg) rotateY(${pose.rotateY}deg) scale(${pose.scale})`,
          transition: enabled
            ? "transform 260ms cubic-bezier(0.22,1,0.36,1), box-shadow 260ms ease"
            : undefined,
          boxShadow: lifted
            ? "0 32px 60px -18px rgba(0,0,0,0.75), 0 12px 26px -10px rgba(0,0,0,0.5)"
            : "0 10px 24px -16px rgba(0,0,0,0.55)",
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className="transition-transform duration-300 ease-out"
          style={{
            transform: `translate3d(${parallaxX}px, ${parallaxY}px, 0) scale(1.08)`,
          }}
        >
          <Image
            src={member.photo}
            alt={member.name}
            width={480}
            height={520}
            className="aspect-[4/5] h-auto w-full object-cover"
          />
        </div>

        {/* dynamic light/reflection that follows the cursor */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: glare.opacity,
            background: `radial-gradient(220px circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.55), transparent 60%)`,
            mixBlendMode: "overlay",
          }}
        />
      </div>

      <h3 className="mt-4 font-sans text-xl font-semibold tracking-tight text-foreground">
        {member.name}
      </h3>
      <p className="mt-1 font-sans text-sm text-accent">{member.role}</p>
      <p className="mt-3 font-sans text-sm leading-relaxed text-zinc-400">{member.bio}</p>
      <div className="mt-4 flex items-center gap-3 text-zinc-500">
        <a
          href={member.linkedin}
          aria-label={`${member.name} LinkedIn`}
          className="cursor-pointer transition-colors duration-200 hover:text-foreground"
        >
          <LinkedinLogo size={18} />
        </a>
        <a
          href={member.twitter}
          aria-label={`${member.name} X`}
          className="cursor-pointer transition-colors duration-200 hover:text-foreground"
        >
          <XLogo size={18} />
        </a>
        <a
          href={member.website}
          aria-label={`${member.name} website`}
          className="cursor-pointer transition-colors duration-200 hover:text-foreground"
        >
          <Globe size={18} />
        </a>
      </div>
    </article>
  );
}