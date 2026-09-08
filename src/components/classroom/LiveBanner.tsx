"use client";

import { useEffect, useState, useMemo } from "react";
import type { ClassroomBatch } from "./types";
import { formatTime, getProgress } from "./types";

interface LiveBannerProps {
  batch: ClassroomBatch;
  isLive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function LiveBanner({
  batch,
  isLive = false,
  className = "",
  style,
}: LiveBannerProps) {
  const [progress, setProgress] = useState(() => getProgress(batch.startTime, batch.endTime));
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const updateProgress = () => {
      setProgress(getProgress(batch.startTime, batch.endTime));
    };

    updateProgress();
    const interval = setInterval(updateProgress, 1000);
    return () => clearInterval(interval);
  }, [batch.startTime, batch.endTime]);

  const start = useMemo(() => formatTime(batch.startTime), [batch.startTime]);
  const end = useMemo(() => formatTime(batch.endTime), [batch.endTime]);

  const displayProgress = isLive ? Math.max(0, Math.min(100, progress)) : 0;

  return (
    <div
      style={{
        ...style,
        background: "rgba(9, 14, 28, 0.85)",
        borderColor: "rgba(255, 255, 255, 0.12)",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.75), 0 0 30px rgba(0, 0, 0, 0.5)",
      }}
      className={`rounded-2xl border p-4 sm:p-5 backdrop-blur-xl transition-all duration-300 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Row: status badge */}
      <div className="flex items-center justify-between gap-3">
        {isLive ? (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-red-400 uppercase border border-red-500/30">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-400" />
            </span>
            <span>LIVE</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-white/45 uppercase border border-white/10">
            <span>Scheduled</span>
          </div>
        )}

        <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">
          {batch.room || "Lab 01"}
        </span>
      </div>

      {/* Main Title: Course — Batch */}
      <div className="mt-2.5">
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
          {batch.course} — {batch.name}
        </h2>
      </div>

      {/* Info Row: Time & Students */}
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/70">
        <div className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium text-white/80">{start} – {end}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="font-medium text-white/80">{batch.students?.length || 18} Students</span>
        </div>
      </div>

      {/* Progress timeline bar */}
      <div className="mt-4 pt-1">
        <div className="relative flex items-center">
          {/* Background track */}
          <div className="h-1.5 w-full rounded-full bg-white/10" />

          {/* Active green progress fill */}
          <div
            className="absolute left-0 top-0 h-1.5 rounded-full transition-all duration-700"
            style={{
              width: `${displayProgress}%`,
              background: "linear-gradient(90deg, #10B981, #22C55E)",
              boxShadow: "0 0 10px #22C55E",
            }}
          />

          {/* Circular scrubber handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full border-2 border-[#090e1c] bg-white transition-all duration-700 cursor-pointer"
            style={{
              left: `calc(${displayProgress}% - 7px)`,
              boxShadow: "0 0 10px #22C55E, 0 0 4px #fff",
            }}
          />
        </div>

        {/* Time labels below bar */}
        <div className="mt-1.5 flex justify-between text-[10px] font-medium text-white/40">
          <span>{start}</span>
          {isHovered && (
            <span className="text-emerald-400 font-semibold animate-in fade-in">
              {displayProgress}% elapsed
            </span>
          )}
          <span>{end}</span>
        </div>
      </div>
    </div>
  );
}
