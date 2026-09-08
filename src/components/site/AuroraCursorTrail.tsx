"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AURORA_CONFIG } from "@/lib/aurora";
import { createAuroraFluid } from "@/lib/aurora-fluid";

function shouldEnableAurora() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (window.matchMedia("(max-width: 767px)").matches) return false;
  if (window.matchMedia("(pointer: coarse)").matches) return false;
  if ("connection" in navigator) {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return false;
  }
  return true;
}

export function AuroraCursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  const skip = pathname.startsWith("/student") || pathname === "/live" || pathname.startsWith("/live/");
  const [hiddenOverControl, setHiddenOverControl] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(shouldEnableAurora());
  }, []);

  useEffect(() => {
    if (!AURORA_CONFIG.enabled || skip || !enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let sim: ReturnType<typeof createAuroraFluid> | null = null;
    try {
      sim = createAuroraFluid(canvas, {
        onSuppressChange: (suppressed) => setHiddenOverControl(suppressed),
      });
    } catch {
      /* WebGL not supported or disabled */
    }
    return () => {
      try {
        sim?.destroy();
      } catch {
        /* ignore */
      }
      setHiddenOverControl(false);
    };
  }, [skip, enabled]);

  if (skip || !enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[45] transition-opacity duration-200 ease-out"
      style={{
        mixBlendMode: "screen",
        width: "100%",
        height: "100%",
        opacity: hiddenOverControl ? 0 : 1,
      }}
    />
  );
}
