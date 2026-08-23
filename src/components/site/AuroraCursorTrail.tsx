"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { AURORA_CONFIG } from "@/lib/aurora";
import { createAuroraFluid } from "@/lib/aurora-fluid";

export function AuroraCursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  const skip = pathname.startsWith("/student");

  useEffect(() => {
    if (!AURORA_CONFIG.enabled || skip) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const narrow = window.matchMedia("(max-width: 768px)").matches;
    if (!fine || reduce || coarse || narrow) return;

    const sim = createAuroraFluid(canvas);
    return () => sim?.destroy();
  }, [skip]);

  if (skip) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[45] hidden md:block"
      style={{ mixBlendMode: "screen", width: "100%", height: "100%" }}
    />
  );
}
