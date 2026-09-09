"use client";

import { useState, useEffect, useCallback, useMemo, Suspense, lazy } from "react";
import type { ClassroomBatch, ClassroomStudent } from "./types";
import {
  getActiveBatches,
  getNextBatch,
  getTodaysBatches,
  pickPrimaryBatch,
  formatTime,
  isBatchLiveNow,
  createDemoBatch30,
} from "./types";
import { LiveBanner } from "./LiveBanner";
import { ProfileCard } from "./ProfileCard";
import { EmptyState } from "./EmptyState";

const ClassroomScene = lazy(() => import("./ClassroomScene"));

function CanvasFallback({ color }: { color: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center" style={{ background: "#050810" }}>
      <div className="text-center">
        <div
          className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-solid"
          style={{
            borderTopColor: "transparent",
            borderRightColor: color,
            borderBottomColor: color,
            borderLeftColor: color,
          }}
        />
        <p className="text-sm text-white/30">Loading 3D classroom...</p>
      </div>
    </div>
  );
}

function StudentGrid({
  batch,
  selectedId,
  onPick,
}: {
  batch: ClassroomBatch;
  selectedId: string | null;
  onPick: (s: ClassroomStudent) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {batch.students.map((s) => {
        const active = selectedId === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onPick(s)}
            className="cursor-pointer rounded-2xl border p-3 text-left transition-colors"
            style={{
              background: active ? `${batch.color}18` : "rgba(10,14,26,0.86)",
              borderColor: active ? `${batch.color}66` : "rgba(255,255,255,0.08)",
            }}
          >
            <span className="relative mx-auto mb-3 block aspect-square w-full max-w-[140px] overflow-hidden rounded-full border-2 border-white/12">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.photo}
                alt={s.name}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    s.name,
                  )}&background=1a2240&color=fff&size=160`;
                }}
              />
              <span className="absolute right-1 bottom-1 h-3 w-3 rounded-full border-2 border-[#0a1020] bg-emerald-400" />
            </span>
            <p className="truncate text-center text-sm font-bold text-white sm:text-base">{s.name}</p>
            <p className="mt-0.5 truncate text-center text-[11px] font-medium text-white/50">
              {s.course || batch.course}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function CourseTicker({
  batches,
  nextBatch,
  activeId,
  onSelect,
}: {
  batches: ClassroomBatch[];
  nextBatch: ClassroomBatch | null;
  activeId: string;
  onSelect: (b: ClassroomBatch) => void;
}) {
  const items = useMemo(() => {
    const chips: Array<{
      id: string;
      kind: "live" | "next" | "course";
      label: string;
      meta: string;
      batch: ClassroomBatch;
    }> = [];

    for (const b of batches) {
      const live = isBatchLiveNow(b);
      chips.push({
        id: `${b.id}-course`,
        kind: live ? "live" : "course",
        label: live ? `LIVE NOW · ${b.course}` : `New course · ${b.course}`,
        meta: `${b.name} · ${b.students.length} enrolled · ${formatTime(b.startTime)}–${formatTime(b.endTime)}`,
        batch: b,
      });
    }

    if (nextBatch && !isBatchLiveNow(nextBatch)) {
      chips.unshift({
        id: `${nextBatch.id}-next`,
        kind: "next",
        label: `Next batch · ${nextBatch.course}`,
        meta: `${nextBatch.name} starts ${formatTime(nextBatch.startTime)} · ${nextBatch.students.length} already enrolled`,
        batch: nextBatch,
      });
    }

    if (chips.length === 0) return [];
    return [...chips, ...chips];
  }, [batches, nextBatch]);

  if (items.length === 0) return null;

  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-amber-950/25 via-[#0a1020]/90 to-sky-950/25">
      <div className="flex items-center gap-3 border-b border-white/8 px-3 py-1.5">
        <span className="shrink-0 rounded-full bg-[#D4A22F]/15 px-2 py-0.5 font-mono text-[9px] font-bold tracking-[0.22em] text-[#F6CB65] uppercase">
          Today
        </span>
        <p className="truncate text-[11px] text-white/45">
          New courses · next batch · enrolled students
        </p>
      </div>
      <div className="overflow-hidden py-2.5">
        <div className="live-course-marquee flex w-max gap-3">
          {items.map((item, i) => {
            const active = item.batch.id === activeId;
            const tone =
              item.kind === "live"
                ? "border-red-400/40 bg-red-500/15 text-red-200"
                : item.kind === "next"
                  ? "border-[#D4A22F]/40 bg-[#D4A22F]/12 text-[#F6CB65]"
                  : "border-sky-400/25 bg-sky-500/10 text-sky-200";
            return (
              <button
                key={`${item.id}-${i}`}
                type="button"
                onClick={() => onSelect(item.batch)}
                className={`inline-flex cursor-pointer items-center gap-2.5 rounded-full border px-3.5 py-1.5 whitespace-nowrap transition-colors ${tone} ${
                  active ? "ring-1 ring-white/25" : ""
                }`}
              >
                <span className="text-[11px] font-bold tracking-wide uppercase">{item.label}</span>
                <span className="h-3 w-px bg-white/20" />
                <span className="text-[11px] text-white/70">{item.meta}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function LiveClassroom({
  data,
  onExitDemo,
}: {
  data: ClassroomBatch[];
  onExitDemo?: () => void;
}) {
  const [demoMode, setDemoMode] = useState(false);
  const isForcedDemo = data.length === 1 && data[0]?.id === "demo-batch-30";
  const showingDemo = demoMode || isForcedDemo;

  const todayBatches = useMemo(() => {
    if (showingDemo) return [createDemoBatch30()];
    return getTodaysBatches(data ?? []);
  }, [data, showingDemo]);

  const [nextBatch, setNextBatch] = useState<ClassroomBatch | null>(() => getNextBatch(todayBatches));
  const [selectedBatch, setSelectedBatch] = useState<ClassroomBatch | null>(() => pickPrimaryBatch(todayBatches));
  const [hoveredStudent, setHoveredStudent] = useState<ClassroomStudent | null>(null);
  const [show3d, setShow3d] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1.1);

  const syncSelection = useCallback((batches: ClassroomBatch[]) => {
    setNextBatch(getNextBatch(batches));
    setSelectedBatch((prev) => {
      if (prev) {
        const found = batches.find((b) => b.id === prev.id);
        if (found && isBatchLiveNow(found)) return { ...found, isLive: true };
        const live = getActiveBatches(batches);
        if (found && live.length === 0) return { ...found, isLive: false };
      }
      return pickPrimaryBatch(batches);
    });
  }, []);

  useEffect(() => {
    syncSelection(todayBatches);
  }, [todayBatches, syncSelection]);

  const handleBatchSelect = useCallback(
    (batch: ClassroomBatch) => {
      if (selectedBatch && batch.id === selectedBatch.id) return;
      setHoveredStudent(null);
      setSelectedBatch({ ...batch, isLive: isBatchLiveNow(batch) });
      setShowBanner(true);
    },
    [selectedBatch],
  );

  const handleStudentPick = useCallback((student: ClassroomStudent) => {
    setHoveredStudent((prev) => (prev?.id === student.id ? null : student));
  }, []);

  const handleStudentHover = useCallback((student: ClassroomStudent | null) => {
    setHoveredStudent(student);
  }, []);

  if (todayBatches.length === 0 || !selectedBatch) {
    return (
      <section
        className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 pt-28 pb-16"
        style={{ background: "#050810" }}
      >
        <EmptyState nextBatch={nextBatch} />
      </section>
    );
  }

  const isLive = isBatchLiveNow(selectedBatch);

  return (
    <section
      className="relative min-h-dvh w-full overflow-x-hidden pt-28 md:pt-32 pb-12"
      style={{ background: "#050810" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${selectedBatch.color}14 0%, transparent 55%)`,
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <div className="mb-1.5 flex items-center gap-2.5">
              {isLive && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                </span>
              )}
              <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase sm:text-xs">
                {showingDemo ? "Demo Preview · 30 Students" : isLive ? "Live Classroom Session" : "Virtual Classroom"}
              </span>
            </div>
            <h1 className="text-2xl leading-tight font-black text-white sm:text-3xl">
              Virtual{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${selectedBatch.color}, ${selectedBatch.accentColor})`,
                }}
              >
                Classroom
              </span>
            </h1>
            <p className="mt-1 text-sm text-white/45">
              {selectedBatch.students.length} students · {selectedBatch.course}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setShow3d((v) => !v);
                setHoveredStudent(null);
              }}
              className="cursor-pointer rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em]"
              style={{
                borderColor: show3d ? "rgba(96,165,250,0.55)" : "rgba(255,255,255,0.12)",
                background: show3d ? "rgba(59,130,246,0.18)" : "rgba(255,255,255,0.04)",
                color: show3d ? "#93c5fd" : "rgba(255,255,255,0.7)",
              }}
            >
              {show3d ? "Close 3D" : "3D Classroom View"}
            </button>
            <button
              type="button"
              onClick={() => {
                setHoveredStudent(null);
                setShow3d(false);
                if (showingDemo) {
                  setDemoMode(false);
                  onExitDemo?.();
                } else {
                  setDemoMode(true);
                }
              }}
              className="cursor-pointer rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em]"
              style={{
                borderColor: showingDemo ? "rgba(96,165,250,0.55)" : "rgba(255,255,255,0.12)",
                background: showingDemo ? "rgba(59,130,246,0.18)" : "rgba(255,255,255,0.04)",
                color: showingDemo ? "#93c5fd" : "rgba(255,255,255,0.55)",
              }}
            >
              {showingDemo ? "Exit demo" : "Preview 30 students"}
            </button>
          </div>
        </div>

        {showBanner ? (
          <div className="mb-5">
            <LiveBanner
              batch={selectedBatch}
              isLive={isLive}
              compact
              onClose={() => setShowBanner(false)}
            />
          </div>
        ) : null}

        <CourseTicker
          batches={todayBatches}
          nextBatch={nextBatch}
          activeId={selectedBatch.id}
          onSelect={handleBatchSelect}
        />

        {show3d ? (
          <div
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
            style={{
              height: "min(72vh, 760px)",
              minHeight: 420,
              border: `1px solid ${selectedBatch.color}33`,
            }}
          >
            <div className="absolute inset-0 z-0">
              <Suspense fallback={<CanvasFallback color={selectedBatch.color} />}>
                <ClassroomScene
                  batch={selectedBatch}
                  onStudentHover={handleStudentHover}
                  hoveredStudent={hoveredStudent}
                  orbitActive
                  zoomLevel={zoomLevel}
                />
              </Suspense>
            </div>
            <div className="pointer-events-none absolute inset-0 z-50">
              <button
                type="button"
                onClick={() => setShow3d(false)}
                aria-label="Close 3D view"
                className="pointer-events-auto absolute top-3 right-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/60 text-white/80 backdrop-blur-md hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="pointer-events-auto absolute bottom-3 left-3">
                <div className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-[#0a1020]/92 p-1.5">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((v) => Math.max(0.7, +(v - 0.15).toFixed(2)))}
                    className="cursor-pointer rounded-full p-1.5 text-white/70 hover:text-white"
                    aria-label="Zoom out"
                  >
                    −
                  </button>
                  <span className="min-w-9 text-center font-mono text-[10px] text-white/65">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((v) => Math.min(1.8, +(v + 0.15).toFixed(2)))}
                    className="cursor-pointer rounded-full p-1.5 text-white/70 hover:text-white"
                    aria-label="Zoom in"
                  >
                    +
                  </button>
                </div>
              </div>
              {hoveredStudent ? (
                <div className="pointer-events-auto absolute top-14 right-3 max-w-72">
                  <ProfileCard
                    student={hoveredStudent}
                    batch={selectedBatch}
                    onClose={() => setHoveredStudent(null)}
                  />
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <StudentGrid
            batch={selectedBatch}
            selectedId={hoveredStudent?.id ?? null}
            onPick={handleStudentPick}
          />
        )}

        {hoveredStudent && !show3d ? (
          <div className="mt-4">
            <ProfileCard
              student={hoveredStudent}
              batch={selectedBatch}
              onClose={() => setHoveredStudent(null)}
              className="w-full max-w-xl"
            />
          </div>
        ) : null}

      </div>
    </section>
  );
}
