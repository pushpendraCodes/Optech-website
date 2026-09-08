"use client";

import { useEffect, useState } from "react";

type ClockParts = { hour: number; minute: number; second: number };

function readIndiaClock(date = new Date()): ClockParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { hour: get("hour"), minute: get("minute"), second: get("second") };
}

export function WallClock({ size = 88 }: { size?: number }) {
  const [clock, setClock] = useState<ClockParts>(() => readIndiaClock());

  useEffect(() => {
    const tick = () => setClock(readIndiaClock());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const { hour, minute, second } = clock;
  const secondAngle = second * 6;
  const minuteAngle = minute * 6 + second * 0.1;
  const hourAngle = (hour % 12) * 30 + minute * 0.5;

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 3;

  return (
    <div
      className="relative rounded-full border border-white/20 bg-[radial-gradient(circle_at_35%_30%,#1a2744_0%,#0a1020_70%)] shadow-[0_8px_28px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)]"
      style={{ width: size, height: size }}
      aria-label={`India time ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(147,197,253,0.35)" strokeWidth="2.5" />
        <circle cx={cx} cy={cy} r={r - 4} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

        {Array.from({ length: 12 }, (_, i) => {
          const a = ((i * 30 - 90) * Math.PI) / 180;
          const outer = r - 7;
          const inner = i % 3 === 0 ? r - 14 : r - 11;
          return (
            <line
              key={i}
              x1={cx + Math.cos(a) * inner}
              y1={cy + Math.sin(a) * inner}
              x2={cx + Math.cos(a) * outer}
              y2={cy + Math.sin(a) * outer}
              stroke={i % 3 === 0 ? "#93c5fd" : "rgba(255,255,255,0.35)"}
              strokeWidth={i % 3 === 0 ? 2 : 1.2}
              strokeLinecap="round"
            />
          );
        })}

        <line
          x1={cx}
          y1={cy}
          x2={cx + Math.sin((hourAngle * Math.PI) / 180) * (r * 0.45)}
          y2={cy - Math.cos((hourAngle * Math.PI) / 180) * (r * 0.45)}
          stroke="#e2e8f0"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1={cx}
          y1={cy}
          x2={cx + Math.sin((minuteAngle * Math.PI) / 180) * (r * 0.62)}
          y2={cy - Math.cos((minuteAngle * Math.PI) / 180) * (r * 0.62)}
          stroke="#93c5fd"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <line
          x1={cx - Math.sin((secondAngle * Math.PI) / 180) * (r * 0.12)}
          y1={cy + Math.cos((secondAngle * Math.PI) / 180) * (r * 0.12)}
          x2={cx + Math.sin((secondAngle * Math.PI) / 180) * (r * 0.7)}
          y2={cy - Math.cos((secondAngle * Math.PI) / 180) * (r * 0.7)}
          stroke="#f87171"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        <circle cx={cx} cy={cy} r="3.5" fill="#f87171" />
        <circle cx={cx} cy={cy} r="1.6" fill="#fff" />
      </svg>
    </div>
  );
}
