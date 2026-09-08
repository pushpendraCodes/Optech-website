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
import { WallClock } from "./WallClock";

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

function StudentRoster({
  batch,
  hoveredId,
  onPick,
}: {
  batch: ClassroomBatch;
  hoveredId: string | null;
  onPick: (s: ClassroomStudent) => void;
}) {
  return (
    <div className="mt-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-white sm:text-xl">Students in Class</h2>
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{ background: `${batch.color}33`, color: batch.accentColor }}
          >
            {batch.students.length} enrolled
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-white/45">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Active
          </span>
        </div>
      </div>
      <div
        className="rounded-2xl border border-white/8 p-3 sm:p-4"
        style={{ background: "rgba(8,12,24,0.72)" }}
      >
        <div className="flex flex-wrap gap-2.5">
          {batch.students.map((s) => {
            const active = hoveredId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onMouseEnter={() => onPick(s)}
                onFocus={() => onPick(s)}
                onClick={() => onPick(s)}
                className="inline-flex items-center gap-2.5 rounded-full border px-2.5 py-1.5 transition-all cursor-pointer"
                style={{
                  background: active ? `${batch.color}22` : "rgba(18,24,40,0.9)",
                  borderColor: active ? `${batch.color}66` : "rgba(255,255,255,0.08)",
                  boxShadow: active ? `0 0 18px ${batch.color}33` : "none",
                }}
              >
                <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.photo}
                    alt={s.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        s.name,
                      )}&background=1a2240&color=fff&size=72`;
                    }}
                  />
                  <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-[#0a1020] bg-emerald-400" />
                </span>
                <span className="pr-1 text-sm font-medium text-white">{s.name.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ScheduleStrip({
  batches,
  activeId,
  onSelect,
}: {
  batches: ClassroomBatch[];
  activeId: string;
  onSelect: (b: ClassroomBatch) => void;
}) {
  if (batches.length === 0) return null;
  return (
    <div className="mt-8">
      <p className="mb-3 text-[11px] font-semibold tracking-[0.2em] text-white/35 uppercase">
        Today&apos;s Schedule
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {batches.map((b) => {
          const active = b.id === activeId;
          const live = Boolean(b.isLive);
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onSelect(b)}
              className="rounded-2xl border p-4 text-left transition-all cursor-pointer"
              style={{
                background: active ? `${b.color}14` : "rgba(10,14,26,0.8)",
                borderColor: active ? `${b.color}55` : "rgba(255,255,255,0.08)",
                boxShadow: active ? `0 0 28px ${b.color}18` : "none",
              }}
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: live ? "#22c55e" : b.color }} />
                <span className="text-base font-bold text-white">{b.course}</span>
                {live ? (
                  <span className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-red-400 uppercase">
                    Live
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-white/40">
                {b.name} · {b.room}
              </p>
              <p className="mt-2 text-sm font-semibold" style={{ color: b.accentColor }}>
                {formatTime(b.startTime)} – {formatTime(b.endTime)}
              </p>
              <p className="mt-3 text-xs text-white/35">{b.students.length} students</p>
            </button>
          );
        })}
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [orbitActive, setOrbitActive] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.0);

  const syncSelection = useCallback((batches: ClassroomBatch[]) => {
    setNextBatch(getNextBatch(batches));
    setSelectedBatch((prev) => {
      if (prev) {
        const found = batches.find((b) => b.id === prev.id);
        if (found && isBatchLiveNow(found)) return { ...found, isLive: true };
        const live = getActiveBatches(batches);
        // Keep manual selection if still on today's list and nothing else is live
        if (found && live.length === 0) return { ...found, isLive: false };
      }
      return pickPrimaryBatch(batches);
    });
  }, []);

  useEffect(() => {
    syncSelection(todayBatches);
  }, [todayBatches, syncSelection]);

  useEffect(() => {
    const interval = setInterval(() => syncSelection(todayBatches), 1000);
    return () => clearInterval(interval);
  }, [todayBatches, syncSelection]);

  const handleBatchSelect = useCallback(
    (batch: ClassroomBatch) => {
      if (!selectedBatch || batch.id === selectedBatch.id) return;
      setIsTransitioning(true);
      setHoveredStudent(null);
      setTimeout(() => {
        setSelectedBatch({ ...batch, isLive: isBatchLiveNow(batch) });
        setTimeout(() => setIsTransitioning(false), 400);
      }, 250);
    },
    [selectedBatch],
  );

  const handleStudentHover = useCallback((student: ClassroomStudent | null) => {
    setHoveredStudent((prev) => (prev?.id === student?.id ? prev : student));
  }, []);

  if (todayBatches.length === 0 || !selectedBatch) {
    return (
      <section
        className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 pt-24 md:pt-28 pb-16"
        style={{ background: "#050810" }}
      >
        <EmptyState nextBatch={nextBatch} />
      </section>
    );
  }

  const isLive = isBatchLiveNow(selectedBatch);
  const showClassroom = true;

  return (
    <section
      className="relative min-h-[calc(100vh-5rem)] w-full overflow-hidden pt-24 md:pt-28 pb-16"
      style={{ background: "#050810" }}
    >
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute inset-0 transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${selectedBatch.color}18 0%, transparent 60%)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <div className="mb-1.5 flex items-center gap-2.5">
              {isLive && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                </span>
              )}
              <span className="text-xs font-bold tracking-widest text-white/40 uppercase">
                {showingDemo ? "Demo Preview · 30 Students" : isLive ? "Live Classroom Session" : "Virtual Classroom"}
              </span>
            </div>
            <h1 className="text-2xl leading-tight font-black text-white sm:text-3xl">
              3D Interactive{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${selectedBatch.color}, ${selectedBatch.accentColor})`,
                }}
              >
                Classroom
              </span>
            </h1>
            <p className="mt-1 text-sm text-white/40">
              Hover desks to view student profiles · Move mouse to explore the 3D scene
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setHoveredStudent(null);
              if (showingDemo) {
                setDemoMode(false);
                onExitDemo?.();
              } else {
                setDemoMode(true);
              }
            }}
            className="shrink-0 cursor-pointer rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors"
            style={{
              borderColor: showingDemo ? "rgba(96,165,250,0.55)" : "rgba(255,255,255,0.12)",
              background: showingDemo ? "rgba(59,130,246,0.18)" : "rgba(255,255,255,0.04)",
              color: showingDemo ? "#93c5fd" : "rgba(255,255,255,0.55)",
            }}
          >
            {showingDemo ? "Exit demo" : "Preview 30 students"}
          </button>
        </div>

        {/* ━━━━━━━━━ 3D Classroom Container ━━━━━━━━━ */}
        <div
          className="relative rounded-3xl overflow-hidden transition-all duration-700"
          style={{
            height: "clamp(560px, 75vh, 840px)",
            border: `1px solid ${selectedBatch.color}33`,
            boxShadow: `0 0 0 1px rgba(255,255,255,0.06), 0 32px 80px rgba(0,0,0,0.85), 0 0 50px ${selectedBatch.color}12`,
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? "scale(0.98)" : "scale(1)",
          }}
        >
          {showClassroom ? (
            <>
              {/* Three.js scene — keep below HUD overlays */}
              <div className="absolute inset-0 z-0">
                <Suspense fallback={<CanvasFallback color={selectedBatch.color} />}>
                  <ClassroomScene
                    batch={selectedBatch}
                    onStudentHover={handleStudentHover}
                    hoveredStudent={hoveredStudent}
                    orbitActive={orbitActive}
                    zoomLevel={zoomLevel}
                    onOrbitStop={() => setOrbitActive(false)}
                  />
                </Suspense>
              </div>

              {/* HUD layer above canvas */}
              <div className="pointer-events-none absolute inset-0 z-50">
                {/* ━━━ Overlay: Top-Left HUD Banner ━━━ */}
                <div className="absolute top-4 left-4 sm:top-5 sm:left-5 pointer-events-auto max-w-[min(340px,calc(100%-7rem))]">
                  <LiveBanner batch={selectedBatch} isLive={isLive} />
                </div>

                {/* ━━━ Overlay: Analog Wall Clock (Top-Right) ━━━ */}
                <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
                  <WallClock size={92} />
                </div>

                {/* ━━━ Overlay: Desk Count + Live Badge ━━━ */}
                <div className="absolute inset-x-0 top-16 flex items-center justify-between px-5">
                  <span className="rounded-full border border-white/10 bg-black/55 px-3 py-1 text-[11px] text-white/55 backdrop-blur-md">
                    {selectedBatch.students.length} desks · {selectedBatch.course}
                  </span>
                  {/* {isLive ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-green-400/25 bg-black/55 px-3 py-1 text-[11px] font-semibold text-green-400 backdrop-blur-md">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                      </span>
                      In Session
                    </span>
                  ) : null} */}
                </div>

                {/* ━━━ Overlay: Profile Card (Right side) ━━━ */}
                {hoveredStudent ? (
                  <div className="absolute top-24 right-5 sm:top-28 sm:right-6 max-w-[300px] pointer-events-auto">
                    <ProfileCard
                      student={hoveredStudent}
                      batch={selectedBatch}
                      onClose={() => setHoveredStudent(null)}
                    />
                  </div>
                ) : null}

                {/* ━━━ Bottom bar: camera controls only ━━━ */}
                <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5">
                  <div className="pointer-events-auto">
                    <div className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-full border border-white/20 bg-[#0a1020]/92 p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.65)] backdrop-blur-xl">
                      <button
                        type="button"
                        onClick={() => setOrbitActive((v) => !v)}
                        className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors duration-200 ${
                          orbitActive
                            ? "bg-white/20 text-white"
                            : "text-white/75 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <svg
                          className={`h-3.5 w-3.5 ${orbitActive ? "animate-spin" : ""}`}
                          style={orbitActive ? { animationDuration: "3s" } : undefined}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {orbitActive ? "Orbiting…" : "Rotate View"}
                      </button>
                      <div className="h-4 w-px bg-white/15" />
                      <button
                        type="button"
                        onClick={() => setZoomLevel((v) => Math.max(0.6, +(v - 0.15).toFixed(2)))}
                        className="flex cursor-pointer items-center justify-center rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                        aria-label="Zoom out"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM8 11h6" />
                        </svg>
                      </button>
                      <span className="min-w-[36px] text-center font-mono text-[10px] font-bold text-white/65">
                        {Math.round(zoomLevel * 100)}%
                      </span>
                      <button
                        type="button"
                        onClick={() => setZoomLevel((v) => Math.min(1.5, +(v + 0.15).toFixed(2)))}
                        className="flex cursor-pointer items-center justify-center rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                        aria-label="Zoom in"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                        </svg>
                      </button>
                      <div className="h-4 w-px bg-white/15" />
                      <button
                        type="button"
                        onClick={() => {
                          setOrbitActive(false);
                          setZoomLevel(1.0);
                        }}
                        className="flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] font-semibold text-white/55 transition-colors hover:bg-white/10 hover:text-white/80"
                        aria-label="Reset camera"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <EmptyState nextBatch={nextBatch} />
          )}
        </div>

        {/* ━━━ Student Roster Below Scene ━━━ */}
        {showClassroom && (
          <StudentRoster
            batch={selectedBatch}
            hoveredId={hoveredStudent?.id ?? null}
            onPick={handleStudentHover}
          />
        )}

        {/* ━━━ Schedule Grid Below ━━━ */}
        <ScheduleStrip
          batches={todayBatches}
          activeId={selectedBatch.id}
          onSelect={handleBatchSelect}
        />
      </div>
    </section>
  );
}
