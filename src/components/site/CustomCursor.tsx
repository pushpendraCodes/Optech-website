"use client";

import { useEffect, useState } from "react";

export function CustomCursor() {
  const [pos, setPos] = useState({ x: -40, y: -40 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    setEnabled(true);
    const onMove = (e: PointerEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  if (!enabled) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[80] hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/50 md:block"
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`,
        boxShadow: "0 0 20px rgba(212,162,47,0.25)",
        transition: "transform 80ms linear",
      }}
    />
  );
}
