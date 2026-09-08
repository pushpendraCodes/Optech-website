"use client";

import { useEffect, useState } from "react";
import type { ClassroomBatch } from "./types";
import { formatTime } from "./types";

export function EmptyState({ nextBatch }: { nextBatch: ClassroomBatch | null }) {
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    if (!nextBatch) return;
    const update = () => {
      const now = new Date();
      const [sh, sm] = nextBatch.startTime.split(":").map(Number);
      const target = new Date();
      target.setHours(sh, sm, 0, 0);
      if (target.getTime() <= now.getTime()) {
        // Next occurrence may be tomorrow if start already passed locally
        target.setDate(target.getDate() + 1);
      }
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown("Starting soon");
        return;
      }
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdown(hrs > 0 ? `${hrs}h ${mins}m ${secs}s` : `${mins}m ${secs}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [nextBatch]);

  return (
    <div className="box-border flex h-full min-h-0 flex-col items-center justify-start overflow-y-auto px-4 py-6 text-center sm:justify-center sm:py-8">
      <div className="w-full max-w-md shrink-0">
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 sm:mb-8 sm:h-20 sm:w-20"
          style={{
            background: "linear-gradient(135deg, #0f1729 0%, #0a1020 100%)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
          }}
        >
          <span className="font-mono text-xs tracking-widest text-white/25">LAB</span>
        </div>

        <h2 className="mb-2 text-xl font-bold text-white sm:text-2xl">
          {nextBatch ? "No Batches In Session" : "No Classroom Right Now"}
        </h2>
        <p className="mb-6 text-sm text-white/40 sm:mb-8">
          {nextBatch
            ? "No batch timing matches the current time. The classroom will fill when a batch starts."
            : "There are no active batches or live classroom sessions available at this time."}
        </p>

        {nextBatch ? (
          <div
            className="rounded-2xl border border-white/10 p-4 text-left sm:p-5"
            style={{
              background: `linear-gradient(135deg, ${nextBatch.color}0a 0%, rgba(10,15,30,0.8) 100%)`,
              borderColor: `${nextBatch.color}33`,
              boxShadow: `0 0 40px ${nextBatch.color}11`,
            }}
          >
            <div
              className="mb-3 text-[10px] font-bold tracking-widest uppercase"
              style={{ color: nextBatch.accentColor }}
            >
              Next Class
            </div>
            <div className="mb-0.5 text-base font-bold text-white sm:text-lg">{nextBatch.course}</div>
            <div className="mb-4 text-sm text-white/50">
              {nextBatch.name} · {nextBatch.instructor}
            </div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-0.5 text-xs text-white/40">Starts at</div>
                <div className="text-sm font-semibold text-white">
                  {formatTime(nextBatch.startTime)} – {formatTime(nextBatch.endTime)}
                </div>
                {nextBatch.room ? (
                  <div className="mt-1 truncate text-[11px] text-white/35">{nextBatch.room}</div>
                ) : null}
              </div>
              <div className="text-right">
                <div className="mb-0.5 text-xs text-white/40">Starts in</div>
                <div className="font-mono text-base font-black sm:text-lg" style={{ color: nextBatch.accentColor }}>
                  {countdown || "—"}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/30">No upcoming batch timings found.</p>
        )}
      </div>
    </div>
  );
}
