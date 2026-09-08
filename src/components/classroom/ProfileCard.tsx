"use client";

import type { ClassroomBatch, ClassroomStudent } from "./types";

interface ProfileCardProps {
  student: ClassroomStudent | null;
  batch: ClassroomBatch;
  currentTask?: string;
  onClose?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export function ProfileCard({
  student,
  batch,
  currentTask,
  onClose,
  style,
  className = "",
}: ProfileCardProps) {
  if (!student) return null;

  return (
    <div
      style={{
        ...style,
        background: "rgba(9, 14, 28, 0.88)",
        borderColor: "#38bdf8",
        boxShadow:
          "0 0 30px rgba(56, 189, 248, 0.35), 0 20px 40px rgba(0,0,0,0.8), inset 0 0 20px rgba(56, 189, 248, 0.12)",
      }}
      className={`relative z-40 flex items-center gap-4 rounded-2xl border-2 p-3.5 sm:p-4 text-left backdrop-blur-xl transition-all duration-300 animate-in fade-in zoom-in-95 ${className}`}
    >
      {/* Avatar column */}
      <div className="relative shrink-0">
        <div className="relative h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-full border-2 border-[#38bdf8]/80 shadow-[0_0_15px_rgba(56,189,248,0.4)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={student.photo}
            alt={student.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                student.name,
              )}&background=1e293b&color=38bdf8&size=160`;
            }}
          />
        </div>
        {/* Status Dot */}
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#0a1020]">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
        </span>
      </div>

      {/* Details column */}
      <div className="min-w-0 pr-2">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-base sm:text-lg font-bold tracking-tight text-white">
            {student.name}
          </h3>
          {onClose && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="ml-auto text-white/40 hover:text-white transition-colors"
              title="Close"
              type="button"
            >
              ✕
            </button>
          )}
        </div>

        <p className="truncate text-xs font-medium text-sky-200/90">
          {student.course}
        </p>

        <p className="text-[11px] text-white/50">
          {student.batch}
        </p>

        <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span>Currently Learning</span>
        </div>

        {currentTask && (
          <p className="mt-1 line-clamp-1 text-[10px] text-sky-300/60">
            Task: {currentTask}
          </p>
        )}
      </div>
    </div>
  );
}
