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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let sim: ReturnType<typeof createAuroraFluid> | null = null;
    try {
      sim = createAuroraFluid(canvas);
    } catch {
      /* WebGL not supported or disabled */
    }
    return () => {
      try {
        sim?.destroy();
      } catch {
        /* ignore */
      }
    };
  }, [skip]);

  if (skip) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[45]"
      style={{ mixBlendMode: "screen", width: "100%", height: "100%" }}
    />
  );
}
