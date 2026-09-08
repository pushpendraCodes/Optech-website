"use client";

import {
  memo,
  useRef,
  useMemo,
  useEffect,
  useState,
  useCallback,
  type MouseEvent,
  type MutableRefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import type { ClassroomBatch as Batch, ClassroomStudent as Student } from "./types";

/* ─── Constants ─── */
const MAX_DESKS = 30;
const _v3 = new THREE.Vector3();

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/* ─── Name plate texture (canvas — no remote font load) ─── */
function useNameTexture(name: string, accent: string, active: boolean) {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 180;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const first = name.split(/\s+/)[0] || name;
    ctx.clearRect(0, 0, 640, 180);
    ctx.fillStyle = active ? "#1a2748" : "#152038";
    ctx.fillRect(0, 0, 640, 180);
    ctx.strokeStyle = active ? accent : "#6b8cff";
    ctx.lineWidth = 10;
    ctx.strokeRect(6, 6, 628, 168);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 96px system-ui, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.85)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    ctx.fillText(first.slice(0, 12), 320, 96);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, [name, accent, active]);
}

/* ─── Avatar Texture (student photo circle) ─── */
function useAvatarTexture(photo: string, name: string, accent: string, active: boolean) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  const [imgReady, setImgReady] = useState(0);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    canvasRef.current = canvas;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    setTexture(tex);

    const img = new Image();
    img.crossOrigin = "anonymous";
    imgRef.current = img;
    img.onload = () => setImgReady((n) => n + 1);
    img.onerror = () => setImgReady((n) => n + 1);
    img.src = photo;

    return () => {
      tex.dispose();
      setTexture(null);
      canvasRef.current = null;
      imgRef.current = null;
    };
  }, [photo]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !texture) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, 256, 256);
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(128, 128, 118, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;
      ctx.drawImage(img, sx, sy, size, size, 8, 8, 240, 240);
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(128, 128, 118, 0, Math.PI * 2);
      ctx.fillStyle = "#1a2240";
      ctx.fill();
      ctx.fillStyle = "#e8eefc";
      ctx.font = "bold 84px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(initials(name) || "?", 128, 136);
    }
    // Ring
    ctx.beginPath();
    ctx.arc(128, 128, 118, 0, Math.PI * 2);
    ctx.lineWidth = active ? 14 : 10;
    ctx.strokeStyle = active ? accent : "#4f74d4";
    ctx.stroke();
    // Status dot
    ctx.beginPath();
    ctx.arc(198, 58, 20, 0, Math.PI * 2);
    ctx.fillStyle = "#22c55e";
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#0b1224";
    ctx.stroke();
    texture.needsUpdate = true;
  }, [texture, name, accent, active, imgReady]);

  return texture;
}

/* ─── Board Texture (smartboard code display) ─── */
function useBoardTexture(course: string, instructor: string, accent: string) {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    // Dark IDE background
    ctx.fillStyle = "#0c1220";
    ctx.fillRect(0, 0, 1024, 512);
    // Code pane (left)
    ctx.fillStyle = "#10182c";
    ctx.fillRect(24, 24, 650, 464);
    // Right sidebar
    ctx.fillStyle = "#121a30";
    ctx.fillRect(694, 24, 306, 464);

    // File tabs
    ctx.fillStyle = "#1a2744";
    ctx.fillRect(24, 24, 650, 36);
    ctx.fillStyle = "#243660";
    ctx.fillRect(24, 24, 120, 36);
    ctx.fillStyle = "#7dd3fc";
    ctx.font = "14px ui-monospace, monospace";
    ctx.fillText("App.tsx", 40, 48);
    ctx.fillStyle = "#6b8cba";
    ctx.fillText("api.ts", 160, 48);
    ctx.fillText("style.css", 240, 48);

    // Line numbers
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = "#384860";
      ctx.font = "13px ui-monospace, monospace";
      ctx.fillText(`${i + 1}`, 40, 85 + i * 34);
    }

    // Code content
    ctx.fillStyle = accent;
    ctx.font = "bold 18px ui-monospace, monospace";
    ctx.fillText(`// ${course.slice(0, 30)}`, 72, 85);
    ctx.fillStyle = "#c084fc";
    ctx.font = "16px ui-monospace, monospace";
    ctx.fillText("import", 72, 119);
    ctx.fillStyle = "#8bb4dd";
    ctx.fillText(" { useEffect, useState }", 142, 119);
    ctx.fillStyle = "#c084fc";
    ctx.fillText("from", 480, 119);
    ctx.fillStyle = "#fbbf24";
    ctx.fillText(" 'react'", 520, 119);

    ctx.fillStyle = "#8bb4dd";
    ctx.font = "16px ui-monospace, monospace";
    ctx.fillText("", 72, 153);
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("function", 72, 187);
    ctx.fillStyle = "#fde68a";
    ctx.fillText(` LiveClassroom()`, 162, 187);
    ctx.fillStyle = "#8bb4dd";
    ctx.fillText(" {", 370, 187);

    ctx.fillStyle = "#c084fc";
    ctx.fillText("  const", 72, 221);
    ctx.fillStyle = "#8bb4dd";
    ctx.fillText(" [students, setStudents] =", 162, 221);
    ctx.fillStyle = "#fde68a";
    ctx.fillText(" useState", 450, 221);
    ctx.fillStyle = "#8bb4dd";
    ctx.fillText("([])", 545, 221);

    ctx.fillStyle = "#c084fc";
    ctx.fillText("  const", 72, 255);
    ctx.fillStyle = "#8bb4dd";
    ctx.fillText(" batch =", 162, 255);
    ctx.fillStyle = "#fbbf24";
    ctx.fillText(` "${instructor.slice(0, 18)}"`, 250, 255);

    ctx.fillStyle = "#86efac";
    ctx.fillText('  // status: "live"', 72, 289);

    ctx.fillStyle = "#c084fc";
    ctx.fillText("  return", 72, 323);
    ctx.fillStyle = "#8bb4dd";
    ctx.fillText(" (", 162, 323);
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("    <Classroom", 72, 357);
    ctx.fillStyle = "#8bb4dd";
    ctx.fillText(' mode="campus-lab"', 220, 357);
    ctx.fillStyle = "#38bdf8";
    ctx.fillText(" />", 440, 357);
    ctx.fillStyle = "#8bb4dd";
    ctx.fillText("  )", 72, 391);
    ctx.fillStyle = "#8bb4dd";
    ctx.fillText("}", 72, 425);

    // Right sidebar content
    ctx.fillStyle = accent;
    ctx.font = "bold 22px system-ui, sans-serif";
    ctx.fillText("LEARN", 720, 80);
    ctx.fillText("BUILD", 720, 112);
    ctx.fillText("GROW", 720, 144);
    ctx.fillStyle = "#60a5fa";
    ctx.font = "42px ui-monospace, monospace";
    ctx.fillText("</> ", 740, 220);

    ctx.fillStyle = "#cbd5f5";
    ctx.font = "16px system-ui, sans-serif";
    ctx.fillText("Instructor:", 720, 290);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px system-ui, sans-serif";
    ctx.fillText(instructor.slice(0, 18), 720, 318);

    ctx.fillStyle = "#8bb4dd";
    ctx.font = "14px system-ui, sans-serif";
    ctx.fillText("Hover desks to", 720, 370);
    ctx.fillText("view student profiles", 720, 392);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, [course, instructor, accent]);
}

/* ─── Institute Name Texture (above board) ─── */
function useInstituteNameTexture(accent: string) {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.clearRect(0, 0, 1024, 128);
    ctx.fillStyle = "#0a0e1a";
    ctx.fillRect(0, 0, 1024, 128);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, 1020, 124);
    ctx.fillStyle = "#D4A22F";
    ctx.font = "bold 52px system-ui, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(212,162,47,0.6)";
    ctx.shadowBlur = 16;
    ctx.fillText("OPTECH COMPUTER INSTITUTE", 512, 64);
    ctx.shadowBlur = 0;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, [accent]);
}

/* ─── 3D Ceiling Fan (rotating) ─── */
function CeilingFan({ position }: { position: [number, number, number] }) {
  const bladesRef = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    if (bladesRef.current) {
      bladesRef.current.rotation.y = clock.getElapsedTime() * 0.8;
    }
  });
  return (
    <group position={position}>
      {/* Rod */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 6]} />
        <meshStandardMaterial color="#718096" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Motor housing */}
      <mesh>
        <cylinderGeometry args={[0.1, 0.12, 0.08, 12]} />
        <meshStandardMaterial color="#4a5568" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Rotating blades */}
      <group ref={bladesRef}>
        {[0, 1, 2, 3].map((i) => (
          <group key={i} rotation={[0, (Math.PI / 2) * i, 0]}>
            <mesh position={[0.45, -0.03, 0]}>
              <boxGeometry args={[0.8, 0.015, 0.12]} />
              <meshStandardMaterial color="#2d3748" roughness={0.6} metalness={0.3} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

/* ─── 3D Chair Geometry ─── */
function Chair({ position, color = "#2563eb" }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      {/* Seat */}
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[0.38, 0.04, 0.38]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.58, 0.17]}>
        <boxGeometry args={[0.36, 0.48, 0.03]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Four legs */}
      {[[-0.15, 0, -0.15], [0.15, 0, -0.15], [-0.15, 0, 0.15], [0.15, 0, 0.15]].map((legPos, i) => (
        <mesh key={i} position={[legPos[0], 0.16, legPos[2]]}>
          <cylinderGeometry args={[0.015, 0.015, 0.32, 6]} />
          <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      {/* Armrests */}
      {[-0.18, 0.18].map((xOff, i) => (
        <mesh key={`arm-${i}`} position={[xOff, 0.46, 0.02]}>
          <boxGeometry args={[0.025, 0.04, 0.28]} />
          <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── 3D Laptop on desk ─── */
function Laptop({ position, glowColor = "#38bdf8" }: { position: [number, number, number]; glowColor?: string }) {
  return (
    <group position={position}>
      {/* Base / keyboard */}
      <mesh position={[0, 0.015, 0]}>
        <boxGeometry args={[0.32, 0.02, 0.22]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Keyboard keys region */}
      <mesh position={[0, 0.026, -0.01]}>
        <boxGeometry args={[0.28, 0.004, 0.14]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} />
      </mesh>
      {/* Trackpad */}
      <mesh position={[0, 0.026, 0.065]}>
        <boxGeometry args={[0.1, 0.003, 0.06]} />
        <meshStandardMaterial color="#1a2538" roughness={0.5} />
      </mesh>
      {/* Screen (tilted) */}
      <group position={[0, 0.13, -0.1]} rotation={[-0.25, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.32, 0.22, 0.012]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Screen glow */}
        <mesh position={[0, 0, 0.007]}>
          <planeGeometry args={[0.28, 0.18]} />
          <meshBasicMaterial color={glowColor} transparent opacity={0.35} />
        </mesh>
        {/* Fake code lines on screen */}
        {[-0.06, -0.02, 0.02, 0.06].map((yOff, i) => (
          <mesh key={i} position={[-0.02, yOff, 0.008]}>
            <planeGeometry args={[0.16 - i * 0.02, 0.012]} />
            <meshBasicMaterial color={["#86efac", "#7dd3fc", "#c084fc", "#fbbf24"][i]} transparent opacity={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ─── 3D Student Figure (stylized low-poly) ─── */
function StudentFigure({
  position,
  shirtColor,
  isHovered,
}: {
  position: [number, number, number];
  shirtColor: string;
  isHovered: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const breathOffset = useRef(Math.random() * Math.PI * 2);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    // Subtle breathing/idle animation
    const t = clock.getElapsedTime();
    groupRef.current.position.y = position[1] + Math.sin(t * 0.6 + breathOffset.current) * 0.005;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Torso - sitting posture (leaning forward slightly) */}
      <group rotation={[-0.15, 0, 0]} position={[0, 0.15, 0]}>
        <mesh position={[0, 0.18, 0]}>
          <boxGeometry args={[0.22, 0.28, 0.14]} />
          <meshStandardMaterial
            color={shirtColor}
            roughness={0.65}
            emissive={isHovered ? shirtColor : "#000"}
            emissiveIntensity={isHovered ? 0.15 : 0}
          />
        </mesh>
      </group>
      {/* Head */}
      <mesh position={[0, 0.52, -0.03]}>
        <sphereGeometry args={[0.09, 12, 10]} />
        <meshStandardMaterial color="#d4a574" roughness={0.7} />
      </mesh>
      {/* Hair */}
      <mesh position={[0, 0.57, -0.02]}>
        <sphereGeometry args={[0.085, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
      </mesh>
      {/* Arms (reaching toward desk) */}
      {[-0.14, 0.14].map((xOff, i) => (
        <mesh key={i} position={[xOff, 0.28, -0.14]} rotation={[-0.6, 0, 0]}>
          <boxGeometry args={[0.06, 0.2, 0.06]} />
          <meshStandardMaterial color={shirtColor} roughness={0.7} />
        </mesh>
      ))}
      {/* Hands */}
      {[-0.14, 0.14].map((xOff, i) => (
        <mesh key={`hand-${i}`} position={[xOff, 0.2, -0.24]}>
          <sphereGeometry args={[0.032, 8, 6]} />
          <meshStandardMaterial color="#d4a574" roughness={0.7} />
        </mesh>
      ))}
      {/* Legs (seated) */}
      {[-0.07, 0.07].map((xOff, i) => (
        <mesh key={`leg-${i}`} position={[xOff, 0.02, -0.06]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[0.08, 0.08, 0.22]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

const SHIRT_COLORS = [
  "#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#6366f1", "#14b8a6",
  "#e11d48", "#22c55e", "#0ea5e9", "#a855f7", "#f43f5e",
  "#84cc16", "#0891b2", "#d946ef", "#4ade80", "#2563eb",
  "#dc2626", "#ea580c", "#7c3aed", "#059669", "#db2777",
  "#0284c7", "#c026d3", "#65a30d", "#e879f9", "#38bdf8",
];

/* ─── Complete Student Desk Unit ─── */
function StudentDesk({
  position,
  student,
  isHovered,
  accentColor,
  shirtColor,
  onHover,
  onLeave,
  onSelect,
}: {
  position: [number, number, number];
  student: Student;
  isHovered: boolean;
  accentColor: string;
  shirtColor: string;
  onHover: (student: Student) => void;
  onLeave: () => void;
  onSelect: (student: Student) => void;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const rimRef = useRef<THREE.Mesh>(null!);
  const bobOffset = useRef(Math.random() * Math.PI * 2);
  const baseY = position[1];
  const avatarTex = useAvatarTexture(student.photo, student.name, accentColor, isHovered);
  const nameTex = useNameTexture(student.name, accentColor, isHovered);
  const rim = isHovered ? accentColor : "#4f74d4";

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y = baseY + Math.sin(t * 0.35 + bobOffset.current) * 0.005;
    const target = isHovered ? 1.04 : 1;
    _v3.set(target, target, target);
    groupRef.current.scale.lerp(_v3, 0.1);
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerEnter={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
        onHover(student);
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "default";
        onLeave();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(student);
      }}
    >
      {/* ──── DESK ──── */}
      {/* Desk legs */}
      {[[-0.38, 0, -0.2], [0.38, 0, -0.2], [-0.38, 0, 0.2], [0.38, 0, 0.2]].map((lp, i) => (
        <mesh key={`leg-${i}`} position={[lp[0], 0.22, lp[2]]}>
          <boxGeometry args={[0.04, 0.44, 0.04]} />
          <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      {/* Desk surface (wooden) */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[0.88, 0.06, 0.52]} />
        <meshStandardMaterial color="#92775a" roughness={0.55} metalness={0.05} />
      </mesh>
      {/* Desk edge trim */}
      <mesh position={[0, 0.48, -0.24]}>
        <boxGeometry args={[0.88, 0.02, 0.04]} />
        <meshStandardMaterial color="#7a6548" roughness={0.5} />
      </mesh>

      {/* ──── Laptop on desk ──── */}
      <Laptop position={[0.05, 0.48, -0.04]} glowColor={isHovered ? accentColor : "#38bdf8"} />

      {/* ──── Desk accessories ──── */}
      {/* Notebook */}
      <mesh position={[-0.32, 0.49, 0.06]}>
        <boxGeometry args={[0.12, 0.03, 0.16]} />
        <meshStandardMaterial color={isHovered ? "#f59e0b" : "#e5793b"} roughness={0.6} />
      </mesh>
      {/* Pen */}
      <mesh position={[-0.28, 0.52, 0.1]} rotation={[0, 0.4, -0.2]}>
        <cylinderGeometry args={[0.006, 0.006, 0.14, 6]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.2} />
      </mesh>
      {/* Water bottle (random desks) */}
      {student.name.length % 3 === 0 && (
        <group position={[0.35, 0.52, 0.1]}>
          <mesh>
            <cylinderGeometry args={[0.02, 0.02, 0.12, 8]} />
            <meshStandardMaterial color="#0ea5e9" transparent opacity={0.7} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.018, 0.02, 0.02, 8]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.25} />
          </mesh>
        </group>
      )}

      {/* ──── CHAIR (behind desk) ──── */}
      <Chair position={[0, 0, 0.38]} color="#2563eb" />

      {/* ──── STUDENT FIGURE (seated on chair) ──── */}
      <StudentFigure
        position={[0, 0.32, 0.36]}
        shirtColor={shirtColor}
        isHovered={isHovered}
      />

      {/* ──── Under-desk glow ──── */}
      <mesh position={[0, 0.005, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 20]} />
        <meshBasicMaterial color={rim} transparent opacity={isHovered ? 0.2 : 0.06} depthWrite={false} />
      </mesh>

      {/* ──── Floating Avatar Circle (above student head) ──── */}
      {avatarTex ? (
        <group position={[0, 1.15, 0.36]}>
          {/* Avatar photo circle - tilted toward camera */}
          <mesh rotation={[-0.35, 0, 0]}>
            <circleGeometry args={[0.18, 32]} />
            <meshBasicMaterial map={avatarTex} transparent depthWrite={false} toneMapped={false} />
          </mesh>
          {/* Pulsing ring behind avatar when hovered */}
          {isHovered && (
            <mesh rotation={[-0.35, 0, 0]} position={[0, 0, -0.01]}>
              <ringGeometry args={[0.19, 0.23, 32]} />
              <meshBasicMaterial color={accentColor} transparent opacity={0.6} depthWrite={false} />
            </mesh>
          )}
          {/* Connecting line from avatar to student */}
          <mesh position={[0, -0.24, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 0.45, 4]} />
            <meshBasicMaterial color={rim} transparent opacity={isHovered ? 0.5 : 0.2} />
          </mesh>
        </group>
      ) : null}

      {/* ──── Name plate (canvas texture — readable + no font fetch) ──── */}
      {nameTex ? (
        <mesh position={[0, 0.93, 0.36]} rotation={[-0.35, 0, 0]}>
          <planeGeometry args={[0.58, 0.2]} />
          <meshBasicMaterial map={nameTex} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
}

const MemoDesk = memo(StudentDesk);

/* ─── Instructor Area ─── */
function InstructorArea({
  accentColor,
  instructor,
  course,
}: {
  accentColor: string;
  instructor: string;
  course: string;
}) {
  const boardTex = useBoardTexture(course, instructor, accentColor);
  const instituteTex = useInstituteNameTexture(accentColor);
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    // Subtle idle animation for instructor figure
    groupRef.current.position.y = 0.005 + Math.sin(clock.getElapsedTime() * 0.4) * 0.008;
  });

  return (
    <group position={[0, 0, -3.8]}>
      {/* ── Podium / Instructor Desk ── */}
      {/* Desk surface */}
      <mesh position={[0, 0.42, 0.45]}>
        <boxGeometry args={[1.4, 0.06, 0.7]} />
        <meshStandardMaterial color="#7a6548" roughness={0.45} />
      </mesh>
      {/* Desk front panel */}
      <mesh position={[0, 0.22, 0.78]}>
        <boxGeometry args={[1.4, 0.42, 0.04]} />
        <meshStandardMaterial color="#6b5634" roughness={0.5} />
      </mesh>
      {/* Desk sides */}
      {[-0.68, 0.68].map((xOff, i) => (
        <mesh key={i} position={[xOff, 0.22, 0.45]}>
          <boxGeometry args={[0.04, 0.42, 0.7]} />
          <meshStandardMaterial color="#6b5634" roughness={0.5} />
        </mesh>
      ))}
      {/* Instructor's laptop */}
      <Laptop position={[0.15, 0.45, 0.4]} glowColor={accentColor} />

      {/* ── Instructor figure (standing beside board) ── */}
      <group ref={groupRef} position={[1.8, 0, 0.2]}>
        {/* Legs */}
        {[-0.06, 0.06].map((xOff, i) => (
          <mesh key={i} position={[xOff, 0.35, 0]}>
            <boxGeometry args={[0.09, 0.7, 0.1]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>
        ))}
        {/* Shoes */}
        {[-0.06, 0.06].map((xOff, i) => (
          <mesh key={`shoe-${i}`} position={[xOff, 0.02, -0.02]}>
            <boxGeometry args={[0.1, 0.04, 0.15]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
        ))}
        {/* Torso */}
        <mesh position={[0, 0.88, 0]}>
          <boxGeometry args={[0.3, 0.5, 0.18]} />
          <meshStandardMaterial color="#1e3a5f" roughness={0.6} />
        </mesh>
        {/* Collar */}
        <mesh position={[0, 1.12, -0.04]}>
          <boxGeometry args={[0.15, 0.06, 0.12]} />
          <meshStandardMaterial color="#1a2e4a" roughness={0.6} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 1.24, 0]}>
          <sphereGeometry args={[0.12, 14, 12]} />
          <meshStandardMaterial color="#c9956e" roughness={0.7} />
        </mesh>
        {/* Hair */}
        <mesh position={[0, 1.32, -0.01]}>
          <sphereGeometry args={[0.11, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
        </mesh>
        {/* Right arm pointing at board */}
        <mesh position={[-0.28, 1.02, -0.12]} rotation={[0.3, 0.6, -0.8]}>
          <boxGeometry args={[0.07, 0.38, 0.07]} />
          <meshStandardMaterial color="#1e3a5f" roughness={0.6} />
        </mesh>
        {/* Left arm down */}
        <mesh position={[0.2, 0.78, 0]}>
          <boxGeometry args={[0.07, 0.36, 0.07]} />
          <meshStandardMaterial color="#1e3a5f" roughness={0.6} />
        </mesh>
        {/* ID badge */}
        <mesh position={[0.08, 0.96, -0.1]}>
          <boxGeometry args={[0.06, 0.08, 0.005]} />
          <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.2} />
        </mesh>
      </group>

      {/* ── Smart Board ── */}
      {/* Board frame */}
      <mesh position={[0, 1.7, -0.05]}>
        <boxGeometry args={[5.0, 2.4, 0.1]} />
        <meshStandardMaterial color="#0a101c" roughness={0.35} metalness={0.1} />
      </mesh>
      {/* Board edge glow */}
      <mesh position={[0, 1.7, 0.01]}>
        <boxGeometry args={[5.06, 2.46, 0.01]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.6} transparent opacity={0.4} />
      </mesh>
      {/* Board screen content */}
      {boardTex ? (
        <mesh position={[0, 1.7, 0.02]}>
          <planeGeometry args={[4.8, 2.2]} />
          <meshBasicMaterial map={boardTex} />
        </mesh>
      ) : null}

      {/* ── Digital Clock (on wall right of board) ── */}
      <mesh position={[3.2, 2.5, 0.01]}>
        <boxGeometry args={[0.9, 0.4, 0.06]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} />
      </mesh>

      {/* ── Motivational Poster (left of board on back wall) ── */}
      <mesh position={[-3.4, 1.7, 0.01]}>
        <boxGeometry args={[1.2, 1.6, 0.04]} />
        <meshStandardMaterial color="#0f1d3a" roughness={0.5} />
      </mesh>

      {/* ── OPTECH COMPUTER INSTITUTE name above board ── */}
      {instituteTex ? (
        <group position={[0, 3.15, -0.02]}>
          {/* Background panel */}
          <mesh>
            <boxGeometry args={[4.8, 0.5, 0.06]} />
            <meshStandardMaterial color="#0a0e1a" roughness={0.4} metalness={0.1} />
          </mesh>
          {/* Text face */}
          <mesh position={[0, 0, 0.035]}>
            <planeGeometry args={[4.6, 0.42]} />
            <meshBasicMaterial map={instituteTex} toneMapped={false} />
          </mesh>
          {/* Bottom accent glow line */}
          <mesh position={[0, -0.26, 0.04]}>
            <boxGeometry args={[4.8, 0.02, 0.02]} />
            <meshStandardMaterial color="#D4A22F" emissive="#D4A22F" emissiveIntensity={0.8} />
          </mesh>
          {/* Top accent glow line */}
          <mesh position={[0, 0.26, 0.04]}>
            <boxGeometry args={[4.8, 0.02, 0.02]} />
            <meshStandardMaterial color="#D4A22F" emissive="#D4A22F" emissiveIntensity={0.5} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
}

/* ─── Room Environment ─── */
function ClassroomRoom({ accentColor }: { accentColor: string }) {
  return (
    <group>
      {/* Floor - dark polished */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.2]}>
        <planeGeometry args={[16, 14]} />
        <meshStandardMaterial color="#0d1117" roughness={0.85} metalness={0.05} />
      </mesh>
      {/* Floor reflective gloss layer */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0.2]}>
        <planeGeometry args={[16, 14]} />
        <meshStandardMaterial color="#141b2d" transparent opacity={0.4} roughness={0.15} metalness={0.3} />
      </mesh>
      {/* Subtle floor grid */}
      <gridHelper args={[16, 24, 0x1a2540, 0x0d1628]} position={[0, 0.003, 0.2]} />

      {/* ── Walls ── */}
      {/* Back wall */}
      <mesh position={[0, 2.2, -5.8]}>
        <planeGeometry args={[16, 5.5]} />
        <meshStandardMaterial color="#0c1018" roughness={0.95} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-8, 2.2, -0.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[12, 5.5]} />
        <meshStandardMaterial color="#0a0e18" roughness={0.95} />
      </mesh>
      {/* Right wall */}
      <mesh position={[8, 2.2, -0.5]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[12, 5.5]} />
        <meshStandardMaterial color="#0a0e18" roughness={0.95} />
      </mesh>

      {/* ── Ceiling ── */}
      <mesh position={[0, 4.8, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 12]} />
        <meshStandardMaterial color="#080c16" roughness={0.95} />
      </mesh>

      {/* ── Ceiling light strips ── */}
      {[-3, 0, 3].map((xOff, i) => (
        <group key={i}>
          <mesh position={[xOff, 4.78, -1]}>
            <boxGeometry args={[0.08, 0.02, 6]} />
            <meshStandardMaterial color="#e0e8f8" emissive="#e0e8f8" emissiveIntensity={0.6} />
          </mesh>
          <pointLight position={[xOff, 4.2, -1]} color="#d0daf0" intensity={0.2} distance={6} decay={2} />
        </group>
      ))}

      {/* ── Board accent strip on back wall ── */}
      <mesh position={[0, 3.2, -5.75]}>
        <boxGeometry args={[5.2, 0.06, 0.06]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.7} />
      </mesh>

      {/* ── Window (left wall with blinds) ── */}
      <group position={[-7.95, 2.4, -2.5]} rotation={[0, Math.PI / 2, 0]}>
        {/* Window frame */}
        <mesh>
          <boxGeometry args={[2.5, 1.8, 0.08]} />
          <meshStandardMaterial color="#243050" roughness={0.4} metalness={0.3} />
        </mesh>
        {/* Window glass */}
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[2.3, 1.6]} />
          <meshStandardMaterial color="#1a3050" transparent opacity={0.5} roughness={0.1} metalness={0.4} />
        </mesh>
        {/* Window blind slats */}
        {Array.from({ length: 10 }).map((_, i) => (
          <mesh key={i} position={[0, 0.72 - i * 0.16, 0.06]}>
            <boxGeometry args={[2.3, 0.04, 0.01]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.5} />
          </mesh>
        ))}
        {/* Warm light from window */}
        <pointLight position={[0, 0, 0.5]} color="#fde68a" intensity={0.3} distance={5} decay={2} />
      </group>

      {/* ── Bookshelf (left wall, near back) ── */}
      <group position={[-7.5, 0, -4.5]} rotation={[0, Math.PI / 2, 0]}>
        {/* Shelf frame */}
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[1.4, 2.6, 0.4]} />
          <meshStandardMaterial color="#3b2f1e" roughness={0.55} />
        </mesh>
        {/* Shelves */}
        {[0.6, 1.2, 1.8, 2.4].map((yOff, i) => (
          <mesh key={i} position={[0, yOff, 0]}>
            <boxGeometry args={[1.36, 0.04, 0.38]} />
            <meshStandardMaterial color="#4a3d2a" roughness={0.5} />
          </mesh>
        ))}
        {/* Books (colored blocks) */}
        {[0.6, 1.2, 1.8, 2.4].map((yOff, si) =>
          [-0.4, -0.2, 0, 0.15, 0.35].map((xOff, bi) => (
            <mesh key={`book-${si}-${bi}`} position={[xOff, yOff + 0.14, -0.02]}>
              <boxGeometry args={[0.1 + Math.random() * 0.04, 0.22 + Math.random() * 0.06, 0.24]} />
              <meshStandardMaterial
                color={["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"][(si + bi) % 5]}
                roughness={0.7}
              />
            </mesh>
          )),
        )}
        {/* Warm backlight */}
        <pointLight position={[0, 1.5, 0.3]} color="#fbbf24" intensity={0.4} distance={3} decay={2} />
      </group>

      {/* ── Potted Plants ── */}
      {[
        [6.5, 0, 2.5],
        [-6.5, 0, 2.5],
        [6.5, 0, -4.5],
      ].map(([px, py, pz], i) => (
        <group key={i} position={[px, py, pz]}>
          {/* Pot */}
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.18, 0.14, 0.4, 8]} />
            <meshStandardMaterial color="#4a3d2a" roughness={0.7} />
          </mesh>
          {/* Soil */}
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.17, 0.17, 0.04, 8]} />
            <meshStandardMaterial color="#2d1f0e" roughness={0.9} />
          </mesh>
          {/* Leaves (stacked discs) */}
          {[0.55, 0.7, 0.85, 1.0, 1.15].map((yOff, li) => (
            <mesh key={li} position={[Math.sin(li * 2.1) * 0.06, yOff, Math.cos(li * 2.7) * 0.06]}>
              <sphereGeometry args={[0.12 + (2 - Math.abs(li - 2)) * 0.04, 8, 6]} />
              <meshStandardMaterial color={li % 2 === 0 ? "#166534" : "#15803d"} roughness={0.8} />
            </mesh>
          ))}
          {/* Stem */}
          <mesh position={[0, 0.65, 0]}>
            <cylinderGeometry args={[0.015, 0.02, 0.6, 6]} />
            <meshStandardMaterial color="#3f6212" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* ── Wall Poster "Better Code Better Future" ── */}
      <group position={[-7.95, 2.2, 0.5]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[1.2, 1.5, 0.03]} />
          <meshStandardMaterial color="#0f1d3a" roughness={0.5} />
        </mesh>
      </group>

      {/* ── Baseboards (wall trim) ── */}
      <mesh position={[0, 0.08, -5.75]}>
        <boxGeometry args={[16, 0.16, 0.08]} />
        <meshStandardMaterial color="#1a1e2e" roughness={0.7} />
      </mesh>
      <mesh position={[-7.96, 0.08, -0.5]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[12, 0.16, 0.08]} />
        <meshStandardMaterial color="#1a1e2e" roughness={0.7} />
      </mesh>
      <mesh position={[7.96, 0.08, -0.5]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[12, 0.16, 0.08]} />
        <meshStandardMaterial color="#1a1e2e" roughness={0.7} />
      </mesh>

      {/* ── Door (right wall) ── */}
      <group position={[7.95, 0, 1]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 1.35, 0]}>
          <boxGeometry args={[1.1, 2.7, 0.12]} />
          <meshStandardMaterial color="#3b2f1e" roughness={0.55} />
        </mesh>
        <mesh position={[0, 1.35, 0.04]}>
          <boxGeometry args={[0.9, 2.5, 0.06]} />
          <meshStandardMaterial color="#4a3828" roughness={0.5} />
        </mesh>
        <mesh position={[0.32, 1.2, 0.1]}>
          <cylinderGeometry args={[0.02, 0.02, 0.12, 8]} />
          <meshStandardMaterial color="#a0aec0" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 2.0, 0.08]}>
          <boxGeometry args={[0.5, 0.4, 0.01]} />
          <meshStandardMaterial color="#1a3050" transparent opacity={0.5} roughness={0.1} metalness={0.3} />
        </mesh>
      </group>

      {/* ── AC Unit (right wall, high) ── */}
      <group position={[7.9, 3.6, -2.5]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[1.6, 0.4, 0.28]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.1} />
        </mesh>
        {[-0.5, -0.25, 0, 0.25, 0.5].map((xOff, i) => (
          <mesh key={i} position={[xOff, -0.12, 0.14]}>
            <boxGeometry args={[0.18, 0.06, 0.01]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0.7, 0.12, 0.15]}>
          <sphereGeometry args={[0.02, 8, 6]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1.0} />
        </mesh>
      </group>

      {/* ── Notice Board (left wall) ── */}
      <group position={[-7.92, 2.2, -1]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[1.8, 1.2, 0.06]} />
          <meshStandardMaterial color="#b8860b" roughness={0.85} />
        </mesh>
        <mesh>
          <boxGeometry args={[1.9, 1.3, 0.03]} />
          <meshStandardMaterial color="#5c4033" roughness={0.6} />
        </mesh>
        {[
          { pos: [-0.4, 0.25, 0.04] as [number, number, number], color: "#fbbf24", size: [0.35, 0.25] as [number, number] },
          { pos: [0.3, 0.3, 0.04] as [number, number, number], color: "#60a5fa", size: [0.3, 0.2] as [number, number] },
          { pos: [-0.2, -0.2, 0.04] as [number, number, number], color: "#f87171", size: [0.28, 0.3] as [number, number] },
          { pos: [0.4, -0.15, 0.04] as [number, number, number], color: "#34d399", size: [0.32, 0.22] as [number, number] },
          { pos: [0, 0.05, 0.04] as [number, number, number], color: "#f8fafc", size: [0.38, 0.28] as [number, number] },
        ].map((paper, i) => (
          <mesh key={i} position={paper.pos}>
            <planeGeometry args={paper.size} />
            <meshStandardMaterial color={paper.color} roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* ── Ceiling Fans ── */}
      <CeilingFan position={[-3, 4.5, -1.5]} />
      <CeilingFan position={[3, 4.5, -1.5]} />
      <CeilingFan position={[0, 4.5, 1.5]} />

      {/* ── Wall Power Outlets (right wall) ── */}
      {[-3, 0, 2.5].map((zOff, i) => (
        <group key={i} position={[7.95, 0.6, zOff]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh>
            <boxGeometry args={[0.12, 0.16, 0.02]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.025, 0.01]}>
            <cylinderGeometry args={[0.015, 0.015, 0.01, 6]} />
            <meshStandardMaterial color="#0f172a" roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.025, 0.01]}>
            <cylinderGeometry args={[0.015, 0.015, 0.01, 6]} />
            <meshStandardMaterial color="#0f172a" roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ─── Camera Controller (Parallax + Orbit + Zoom) ─── */
function CameraController({
  mouseX,
  mouseY,
  deskCount,
  focusZ,
  orbitActive,
  zoomLevel,
  onOrbitStop,
}: {
  mouseX: MutableRefObject<number>;
  mouseY: MutableRefObject<number>;
  deskCount: number;
  focusZ: number;
  orbitActive?: boolean;
  zoomLevel?: number;
  onOrbitStop?: () => void;
}) {
  const { camera } = useThree();
  const orbitAngle = useRef(0);
  const prevMX = useRef(0);
  const prevMY = useRef(0);
  const zoom = zoomLevel ?? 1;
  const _lookTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const mx = mouseX.current;
    const my = mouseY.current;
    const large = deskCount > 18;
    const medium = deskCount > 10;

    const baseX = large ? 0.4 : medium ? 0.5 : 0.55;
    const baseY = large ? 8.8 : medium ? 7.0 : 6.2;
    const baseZ = large ? 12.0 : medium ? 9.5 : 7.8;
    const lookY = large ? 0.4 : 0.55;

    const zoomFactor = 1 / zoom;

    if (orbitActive) {
      // Auto-stop orbit when user moves mouse significantly
      const delta = Math.abs(mx - prevMX.current) + Math.abs(my - prevMY.current);
      if (delta > 0.12 && (prevMX.current !== 0 || prevMY.current !== 0)) {
        onOrbitStop?.();
        prevMX.current = mx;
        prevMY.current = my;
        return;
      }

      orbitAngle.current += 0.004;
      const radius = baseZ * 0.82 * zoomFactor;
      const orbitY = baseY * 0.72 * zoomFactor;
      const centerZ = focusZ - 0.5;

      const targetX = Math.sin(orbitAngle.current) * radius;
      const targetZ = centerZ + Math.cos(orbitAngle.current) * radius;

      camera.position.x += (targetX - camera.position.x) * 0.025;
      camera.position.y += (orbitY - camera.position.y) * 0.025;
      camera.position.z += (targetZ - camera.position.z) * 0.025;
      _lookTarget.set(0, lookY + 0.5, centerZ);
      camera.lookAt(_lookTarget);
    } else {
      // Default parallax mode with zoom
      const targetX = baseX + mx * 0.5;
      const targetY = (baseY - my * 0.2) * zoomFactor;
      const targetZ = baseZ * zoomFactor;

      camera.position.x += (targetX - camera.position.x) * 0.04;
      camera.position.y += (targetY - camera.position.y) * 0.04;
      camera.position.z += (targetZ - camera.position.z) * 0.04;
      _lookTarget.set(mx * 0.12, lookY, focusZ + my * 0.1);
      camera.lookAt(_lookTarget);

      // Keep orbit angle synced for smooth transition
      orbitAngle.current = Math.atan2(camera.position.x, camera.position.z - focusZ);
    }

    prevMX.current = mx;
    prevMY.current = my;
  });
  return null;
}

/* ─── Full 3D Scene ─── */
function Scene({
  batch,
  mouseX,
  mouseY,
  hoveredId,
  setHoveredStudent,
  orbitActive,
  zoomLevel,
  onOrbitStop,
}: {
  batch: Batch;
  mouseX: MutableRefObject<number>;
  mouseY: MutableRefObject<number>;
  hoveredId: string | null;
  setHoveredStudent: (s: Student | null) => void;
  orbitActive?: boolean;
  zoomLevel?: number;
  onOrbitStop?: () => void;
}) {
  const students = useMemo(() => batch.students.slice(0, MAX_DESKS), [batch.students]);
  const count = students.length;

  const deskPositions = useMemo((): [number, number, number][] => {
    const cols = count > 20 ? 6 : count > 12 ? 5 : count > 6 ? 4 : count > 3 ? 3 : Math.min(count, 3);
    const spacingX = count > 20 ? 1.55 : count > 12 ? 1.72 : 1.9;
    const spacingZ = count > 20 ? 1.8 : count > 12 ? 1.95 : 2.15;
    const startX = -((cols - 1) * spacingX) / 2;
    const startZ = count > 20 ? -2.4 : count > 12 ? -2.0 : -1.8;
    return students.map((_, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      return [startX + col * spacingX, 0, startZ + row * spacingZ] as [number, number, number];
    });
  }, [students, count]);

  const focusZ = useMemo(() => {
    if (!deskPositions.length) return -1;
    const zs = deskPositions.map((p) => p[2]);
    return (Math.min(...zs) + Math.max(...zs)) / 2;
  }, [deskPositions]);

  const handleHover = useCallback(
    (student: Student) => setHoveredStudent(student),
    [setHoveredStudent],
  );
  const handleLeave = useCallback(() => setHoveredStudent(null), [setHoveredStudent]);

  const large = count > 18;
  const medium = count > 10;

  return (
    <>
      <PerspectiveCamera
        makeDefault
        fov={large ? 42 : medium ? 38 : 36}
        position={large ? [0.4, 8.8, 12.0] : medium ? [0.5, 7.0, 9.5] : [0.55, 6.2, 7.8]}
      />
      <CameraController mouseX={mouseX} mouseY={mouseY} deskCount={count} focusZ={focusZ} orbitActive={orbitActive} zoomLevel={zoomLevel} onOrbitStop={onOrbitStop} />

      {/* ── Lighting ── */}
      <ambientLight intensity={0.4} color="#9aabda" />
      <directionalLight position={[5, 10, 4]} intensity={0.8} color="#e8eeff" castShadow={false} />
      <hemisphereLight args={["#243658", "#080c16", 0.35]} />
      {/* Board glow */}
      <pointLight position={[0, 2.8, -4.5]} color={batch.accentColor} intensity={0.5} distance={10} />
      {/* Warm ambient from window */}
      <pointLight position={[-6, 3, -2]} color="#fde68a" intensity={0.15} distance={8} />
      {/* Rim light from behind camera */}
      <pointLight position={[0, 5, 10]} color="#e0e8f8" intensity={0.12} distance={14} />
      {/* Subtle under-desk ambient */}
      <pointLight position={[0, 0.2, 0]} color="#1e3a5f" intensity={0.08} distance={6} />

      {/* ── Room ── */}
      <ClassroomRoom accentColor={batch.accentColor} />

      {/* ── Instructor Area ── */}
      <InstructorArea
        accentColor={batch.accentColor}
        instructor={batch.instructor}
        course={batch.course}
      />

      {/* ── Student Desks (dynamic count) ── */}
      {students.map((student, i) => {
        const pos = deskPositions[i];
        if (!pos) return null;
        return (
          <MemoDesk
            key={student.id}
            position={pos}
            student={student}
            isHovered={hoveredId === student.id}
            accentColor={batch.accentColor}
            shirtColor={SHIRT_COLORS[i % SHIRT_COLORS.length]}
            onHover={handleHover}
            onLeave={handleLeave}
            onSelect={handleHover}
          />
        );
      })}
    </>
  );
}

/* ─── Main Export ─── */
interface ClassroomSceneProps {
  batch: Batch;
  onStudentHover: (student: Student | null) => void;
  hoveredStudent: Student | null;
  orbitActive?: boolean;
  zoomLevel?: number;
  onOrbitStop?: () => void;
}

export default function ClassroomScene({
  batch,
  onStudentHover,
  hoveredStudent,
  orbitActive,
  zoomLevel,
  onOrbitStop,
}: ClassroomSceneProps) {
  const mouseX = useRef(0);
  const mouseY = useRef(0);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.current = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouseY.current = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  }, []);

  const setHoveredStudent = useCallback(
    (s: Student | null) => onStudentHover(s),
    [onStudentHover],
  );

  return (
    <div
      className="relative z-0 h-full w-full"
      style={{ cursor: hoveredStudent ? "pointer" : "default" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        mouseX.current = 0;
        mouseY.current = 0;
      }}
    >
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        style={{ background: "#050810" }}
        performance={{ min: 0.45 }}
      >
        <Scene
          batch={batch}
          mouseX={mouseX}
          mouseY={mouseY}
          hoveredId={hoveredStudent?.id ?? null}
          setHoveredStudent={setHoveredStudent}
          orbitActive={orbitActive}
          zoomLevel={zoomLevel}
          onOrbitStop={onOrbitStop}
        />
      </Canvas>
    </div>
  );
}
