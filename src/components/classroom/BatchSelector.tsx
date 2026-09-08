"use client";

import type { ClassroomBatch } from "./types";

interface BatchSelectorProps {
  batches: ClassroomBatch[];
  activeBatch: ClassroomBatch;
  onSelect: (batch: ClassroomBatch) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function BatchSelector({
  batches,
  activeBatch,
  onSelect,
  className = "",
  style,
}: BatchSelectorProps) {
  if (!batches || batches.length === 0) return null;

  return (
    <div
      style={{
        ...style,
        background: "rgba(9, 14, 28, 0.85)",
        borderColor: "rgba(255, 255, 255, 0.12)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
      }}
      className={`inline-flex items-center gap-1.5 rounded-full border p-1.5 backdrop-blur-xl transition-all duration-300 ${className}`}
    >
      {batches.map((b) => {
        const isActive = b.id === activeBatch.id;
        return (
          <button
            key={b.id}
            type="button"
            onClick={() => onSelect(b)}
            className={`relative rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-300 ${
              isActive
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            {b.course}
            {b.isLive ? <span className="ml-1 text-[9px] text-red-300">●</span> : null}
          </button>
        );
      })}
    </div>
  );
}
