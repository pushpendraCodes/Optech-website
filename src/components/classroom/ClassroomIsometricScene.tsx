"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { ClassroomBatch, ClassroomStudent, DeskSlot } from "./types";
import { CLASSROOM_DESK_SLOTS } from "./types";
import { LiveBanner } from "./LiveBanner";
import { BatchSelector } from "./BatchSelector";
import { ProfileCard } from "./ProfileCard";

interface ClassroomIsometricSceneProps {
  batch: ClassroomBatch;
  allBatches?: ClassroomBatch[];
  onSelectBatch?: (b: ClassroomBatch) => void;
  hoveredStudent: ClassroomStudent | null;
  onStudentHover: (s: ClassroomStudent | null) => void;
  isLive?: boolean;
}

type CameraViewMode = "default" | "board" | "desks" | "isometric";

export default function ClassroomIsometricScene({
  batch,
  allBatches = [],
  onSelectBatch,
  hoveredStudent,
  onStudentHover,
  isLive = true,
}: ClassroomIsometricSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 3D Parallax Tilt state
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isPointerOver, setIsPointerOver] = useState(false);

  // Camera & Zoom state
  const [viewMode, setViewMode] = useState<CameraViewMode>("default");
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 1, 1.25, 1.5

  // Selected student (defaults to Vikash Kumar to match the reference image)
  const [selectedStudent, setSelectedStudent] = useState<ClassroomStudent | null>(() => {
    return (
      batch.students.find((s) => s.name.toLowerCase().includes("vikash")) ||
      batch.students[0] ||
      null
    );
  });

  // Keep selected student synced when batch changes
  useEffect(() => {
    const matched =
      batch.students.find((s) => s.name.toLowerCase().includes("vikash")) ||
      batch.students[0] ||
      null;
    setSelectedStudent(matched);
  }, [batch]);

  // Wall Clock live time
  const [wallClockTime, setWallClockTime] = useState("05:42 PM");
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setWallClockTime(
        d.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Smartboard code tabs and active lines
  const [codeTab, setCodeTab] = useState<"main" | "api" | "style">("main");
  const [codeStep, setCodeStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCodeStep((s) => (s + 1) % 6);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Map students to the 10 desk slots
  const deskAssignments = useMemo(() => {
    return CLASSROOM_DESK_SLOTS.map((slot, index) => {
      // Look for a student whose first name matches defaultName, or fallback to index
      const found =
        batch.students.find(
          (s) => s.name.split(" ")[0].toLowerCase() === slot.defaultName.toLowerCase(),
        ) || batch.students[index] || {
          id: `desk-student-${index}`,
          name: slot.defaultName,
          photo: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80`,
          course: batch.course,
          batch: batch.name,
          joinedDate: "Jan 2026",
          status: "active" as const,
        };

      return {
        slot,
        student: found,
      };
    });
  }, [batch]);

  // Active student to show in Profile Card (hovered takes precedence, else selected)
  const activeStudent = hoveredStudent || selectedStudent;
  const activeSlot = useMemo(() => {
    if (!activeStudent) return null;
    return (
      deskAssignments.find((d) => d.student.id === activeStudent.id)?.slot ||
      CLASSROOM_DESK_SLOTS[6] // default Vikash slot
    );
  }, [activeStudent, deskAssignments]);

  // Handle subtle mouse tilt
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    // Keep tilt subtle and controlled
    setTilt({ x: x * 6, y: -y * 4 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPointerOver(false);
    setTilt({ x: 0, y: 0 });
  }, []);

  // Cycle Camera View Mode
  const toggleViewMode = () => {
    const modes: CameraViewMode[] = ["default", "board", "desks", "isometric"];
    const nextIndex = (modes.indexOf(viewMode) + 1) % modes.length;
    setViewMode(modes[nextIndex]);
  };

  // Toggle Zoom Level
  const toggleZoom = () => {
    setZoomLevel((prev) => (prev === 1 ? 1.25 : prev === 1.25 ? 1.5 : 1));
  };

  // Compute camera transform based on viewMode & zoom
  const cameraTransform = useMemo(() => {
    let transformX = 0;
    let transformY = 0;
    let rotateX = tilt.y;
    let rotateY = tilt.x;

    if (viewMode === "board") {
      transformX = -12;
      transformY = 15;
      rotateX += 2;
    } else if (viewMode === "desks") {
      transformX = 5;
      transformY = -10;
      rotateX += 4;
    } else if (viewMode === "isometric") {
      rotateX += 6;
      rotateY -= 6;
    }

    return `perspective(1200px) scale(${zoomLevel}) translate(${transformX}%, ${transformY}%) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }, [viewMode, zoomLevel, tilt]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsPointerOver(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full select-none overflow-hidden bg-[#04060c]"
      style={{ minHeight: "580px" }}
    >
      {/* 3D Scene Viewport */}
      <div
        className="relative w-full h-full transition-transform duration-500 ease-out origin-center"
        style={{
          transform: cameraTransform,
          willChange: "transform",
        }}
      >
        {/* Base 3D Isometric Classroom Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/classroom/classroom_clean_3d.jpg"
          alt="3D Live Classroom Cutaway"
          className="w-full h-full object-cover object-center pointer-events-none"
        />

        {/* Dynamic Screen Glow / Ambient Classroom Lighting Overlay */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-screen opacity-40 transition-opacity duration-1000"
          style={{
            background:
              batch.course.toLowerCase().includes("design")
                ? "radial-gradient(circle at 65% 25%, rgba(139, 92, 246, 0.35) 0%, transparent 50%)"
                : batch.course.toLowerCase().includes("tally")
                ? "radial-gradient(circle at 65% 25%, rgba(16, 185, 129, 0.35) 0%, transparent 50%)"
                : "radial-gradient(circle at 65% 25%, rgba(59, 130, 246, 0.35) 0%, transparent 50%)",
          }}
        />

        {/* 1. Digital Wall Clock (exact match to 05:42 PM in uploaded image) */}
        <div
          className="absolute flex items-center justify-center font-mono font-bold tracking-widest text-[#93c5fd] rounded-lg border border-white/20 bg-black/75 backdrop-blur-sm shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
          style={{
            left: "87.0%",
            top: "27.2%",
            width: "7.8%",
            height: "4.2%",
            fontSize: "clamp(10px, 0.95vw, 15px)",
          }}
        >
          {wallClockTime}
        </div>

        {/* 2. Interactive Smartboard Layer (syntax highlighted active IDE code) */}
        <div
          className="absolute overflow-hidden rounded-md transition-all group/board cursor-pointer"
          style={{
            left: "54.8%",
            top: "9.2%",
            width: "21.6%",
            height: "32.0%",
            background: "rgba(10, 15, 30, 0.94)",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            boxShadow: "0 0 25px rgba(56, 189, 248, 0.25), inset 0 0 15px rgba(0,0,0,0.8)",
          }}
          onClick={() => setCodeTab((t) => (t === "main" ? "api" : t === "api" ? "style" : "main"))}
          title="Click to toggle smartboard file"
        >
          {/* Smartboard Titlebar */}
          <div className="flex items-center justify-between border-b border-white/10 bg-black/60 px-2 py-1 text-[9px] text-white/50">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              <span className="ml-1 font-mono text-white/80">
                {codeTab === "main"
                  ? "App.tsx"
                  : codeTab === "api"
                  ? "auth-controller.ts"
                  : "styles.css"}
              </span>
            </div>
            <span className="text-[8px] text-sky-400 font-semibold uppercase tracking-wider">
              Live IDE
            </span>
          </div>

          {/* Smartboard Code Content */}
          <div className="p-2 font-mono text-[9px] sm:text-[10px] leading-relaxed text-sky-100/90 overflow-hidden">
            {codeTab === "main" ? (
              <>
                <div className="text-emerald-400">// {batch.course} — {batch.name}</div>
                <div>
                  <span className="text-purple-400">import</span> &#123; useEffect, useState &#125;{" "}
                  <span className="text-purple-400">from</span> <span className="text-amber-300">&apos;react&apos;</span>;
                </div>
                <div className="mt-1">
                  <span className="text-blue-400">function</span>{" "}
                  <span className="text-yellow-300">ClassroomLab</span>() &#123;
                </div>
                <div className="pl-3">
                  <span className="text-purple-400">const</span> [active] ={" "}
                  <span className="text-yellow-300">useState</span>(
                  <span className="text-orange-400">true</span>);
                </div>
                <div className={`pl-3 transition-colors ${codeStep % 2 === 0 ? "text-emerald-300" : "text-sky-200"}`}>
                  <span className="text-purple-400">const</span> students ={" "}
                  <span className="text-orange-400">{batch.students.length}</span>;
                </div>
                <div className="pl-3 text-white/60">
                  <span className="text-purple-400">return</span> &lt;
                  <span className="text-blue-400">LiveStream</span> batch=&#123;&quot;
                  <span className="text-amber-200">{batch.name}</span>&quot;&#125; /&gt;;
                </div>
                <div>&#125;</div>
              </>
            ) : codeTab === "api" ? (
              <>
                <div className="text-emerald-400">// REST API Controller</div>
                <div>
                  <span className="text-purple-400">export async function</span>{" "}
                  <span className="text-yellow-300">verifyAttendance</span>(req) &#123;
                </div>
                <div className="pl-3">
                  <span className="text-purple-400">const</span> token = req.headers[
                  <span className="text-amber-300">&apos;authorization&apos;</span>];
                </div>
                <div className="pl-3 text-sky-300">
                  <span className="text-purple-400">await</span> database.
                  <span className="text-yellow-300">logActiveStudent</span>(&#123; token &#125;);
                </div>
                <div className="pl-3">
                  <span className="text-purple-400">return</span> Response.
                  <span className="text-yellow-300">json</span>(&#123; status:{" "}
                  <span className="text-emerald-300">&quot;Present&quot;</span> &#125;);
                </div>
                <div>&#125;</div>
              </>
            ) : (
              <>
                <div className="text-emerald-400">/* UI Design Tokens */</div>
                <div>
                  <span className="text-purple-400">.classroom-container</span> &#123;
                </div>
                <div className="pl-3">
                  perspective: <span className="text-orange-400">1200px</span>;
                </div>
                <div className="pl-3">
                  box-shadow: <span className="text-orange-400">0 0 40px #38bdf8</span>;
                </div>
                <div className="pl-3">
                  backdrop-filter: <span className="text-yellow-300">blur(16px)</span>;
                </div>
                <div>&#125;</div>
              </>
            )}

            {/* Blinking IDE cursor */}
            <span className="inline-block h-3 w-1.5 bg-sky-400 animate-pulse ml-1 align-middle" />
          </div>
        </div>

        {/* 3. Instructor Interactive Hotspot */}
        <div
          className="absolute z-20 group/inst cursor-pointer"
          style={{
            left: "51.8%",
            top: "23.0%",
            width: "5.5%",
            height: "19.0%",
          }}
          title={`Instructor: ${batch.instructor}`}
        >
          {/* Subtle instructor glow ring on hover */}
          <div className="absolute inset-0 rounded-full border border-sky-400/0 group-hover/inst:border-sky-400/60 group-hover/inst:bg-sky-400/10 transition-all duration-300 pointer-events-none" />

          {/* Floating Instructor Tag */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/inst:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap rounded-full border border-sky-400/40 bg-black/85 px-2.5 py-0.5 text-[10px] font-semibold text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.5)]">
            👨‍🏫 {batch.instructor} (Faculty)
          </div>
        </div>

        {/* 4. Interactive Student Avatar Pins (Exact match to uploaded image) */}
        {deskAssignments.map(({ slot, student }) => {
          const isSelected = selectedStudent?.id === student.id;
          const isHovered = hoveredStudent?.id === student.id;
          const isActive = isSelected || isHovered;

          return (
            <div
              key={slot.id}
              className="absolute z-30 transition-all duration-300 cursor-pointer"
              style={{
                left: `${slot.x}%`,
                top: `${slot.y}%`,
                transform: `translate(-50%, -50%) ${isActive ? "scale(1.12)" : "scale(1)"}`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedStudent(student);
                onStudentHover(student);
              }}
              onMouseEnter={() => {
                onStudentHover(student);
              }}
              onMouseLeave={() => {
                onStudentHover(null);
              }}
            >
              {/* Floating avatar circle with subtle pulse */}
              <div className="flex items-center gap-1.5 group/pin">
                <div
                  className={`relative h-8 w-8 sm:h-9 sm:w-9 rounded-full transition-all duration-300 ${
                    isActive
                      ? "border-2 border-sky-400 shadow-[0_0_18px_#38bdf8] ring-4 ring-sky-500/30"
                      : "border border-white/40 shadow-md hover:border-sky-300"
                  }`}
                  style={{
                    background: "rgba(10, 16, 30, 0.9)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={student.photo}
                    alt={student.name}
                    className="h-full w-full rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        student.name,
                      )}&background=1e293b&color=38bdf8&size=80`;
                    }}
                  />
                  {/* Active green dot on avatar */}
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-black bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                </div>

                {/* Floating Name Pill Badge beside avatar */}
                <div
                  className={`rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold tracking-wide backdrop-blur-md transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? "border border-sky-400 bg-sky-500/30 text-white shadow-[0_0_12px_rgba(56,189,248,0.5)] font-bold"
                      : "border border-white/15 bg-black/60 text-white/90 group-hover/pin:border-white/40 group-hover/pin:text-white"
                  }`}
                >
                  {student.name.split(" ")[0]}
                </div>
              </div>
            </div>
          );
        })}

        {/* 5. Glowing Vikash Kumar Style Profile Card (Floating in 3D scene) */}
        {activeStudent && activeSlot && (
          <div
            className="absolute z-40 transition-all duration-500 pointer-events-auto"
            style={{
              // If student is Vikash, match exact position from image (right of desk 7)
              left:
                activeStudent.name.toLowerCase().includes("vikash")
                  ? "68.5%"
                  : activeSlot.cardSide === "right"
                  ? `${Math.min(activeSlot.x + 8, 72)}%`
                  : `${Math.max(activeSlot.x - 24, 6)}%`,
              top:
                activeStudent.name.toLowerCase().includes("vikash")
                  ? "43.5%"
                  : `${Math.max(activeSlot.y - 12, 10)}%`,
              maxWidth: "320px",
              minWidth: "260px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <ProfileCard
              student={activeStudent}
              batch={batch}
              currentTask={activeSlot.currentTask}
              onClose={() => {
                setSelectedStudent(null);
                onStudentHover(null);
              }}
            />
          </div>
        )}
      </div>

      {/* 6. Top-Left HUD Card (LiveBanner matching image) */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-40 max-w-[340px] pointer-events-auto">
        <LiveBanner batch={batch} isLive={isLive} />
      </div>

      {/* 7. Bottom-Left Camera Controls Toolbar ([Rotate View], [Zoom]) */}
      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 flex items-center gap-2 pointer-events-auto">
        <div
          style={{
            background: "rgba(9, 14, 28, 0.85)",
            borderColor: "rgba(255, 255, 255, 0.12)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
          }}
          className="flex items-center gap-1 rounded-full border p-1.5 backdrop-blur-xl"
        >
          {/* Rotate View Button */}
          <button
            type="button"
            onClick={toggleViewMode}
            className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all ${
              viewMode !== "default"
                ? "bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
            title="Rotate / Switch Camera Angle"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Rotate View</span>
          </button>

          {/* Zoom Button */}
          <button
            type="button"
            onClick={toggleZoom}
            className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all ${
              zoomLevel > 1
                ? "bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
            title="Toggle Classroom Zoom"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
              />
            </svg>
            <span>{zoomLevel === 1 ? "Zoom" : `${zoomLevel}x`}</span>
          </button>
        </div>
      </div>

      {/* 8. Bottom-Right Course Switcher Pills (Web Development, Graphic Design, Tally) */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 pointer-events-auto">
        <BatchSelector
          batches={allBatches.length ? allBatches : [batch]}
          activeBatch={batch}
          onSelect={(selected) => onSelectBatch?.(selected)}
        />
      </div>
    </div>
  );
}
