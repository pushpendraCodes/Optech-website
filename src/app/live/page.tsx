"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChalkboardTeacher } from "@phosphor-icons/react";
import { useGetLiveQuery } from "@/lib/api";
import { createDemoBatch30, mapApiToBatches } from "@/components/classroom/types";
import { useI18n } from "@/components/providers/I18nProvider";

const LiveClassroom = dynamic(
  () => import("@/components/classroom/LiveClassroom").then((m) => m.LiveClassroom),
  {
    ssr: false,
    loading: () => (
      <section className="flex min-h-[calc(100vh-5rem)] items-center justify-center pt-28" style={{ background: "#050810" }}>
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-[#D4A22F] border-t-transparent" />
          <p className="text-sm text-white/30">Loading classroom...</p>
        </div>
      </section>
    ),
  },
);

function NoClassroomView({ onPreviewDemo }: { onPreviewDemo: () => void }) {
  const { t } = useI18n();

  return (
    <section
      className="relative flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center px-6 pt-28 pb-16 text-center"
      style={{ background: "#050810" }}
    >
      <div className="relative mx-auto max-w-lg">
        <div
          className="pointer-events-none absolute -inset-10 opacity-30 blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(212,162,47,0.18) 0%, rgba(59,130,246,0.08) 50%, transparent 70%)",
          }}
        />

        <div className="relative">
          <div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.6) 100%)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(212,162,47,0.08)",
            }}
          >
            <ChalkboardTeacher size={38} weight="duotone" className="text-[#D4A22F]" />
          </div>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-400 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
            <span>Campus Lab · Inactive</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            {t("live_no_classroom")}
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
            {t("live_no_classroom_desc")}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em]">
            <button
              type="button"
              onClick={onPreviewDemo}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-blue-400/40 bg-blue-500/10 px-5 py-2.5 font-semibold text-blue-300 transition-all hover:bg-blue-500/20 hover:text-white"
            >
              Preview 30 students
            </button>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-full border border-[#D4A22F]/40 bg-[#D4A22F]/10 px-5 py-2.5 font-semibold text-[#F6CB65] transition-all hover:bg-[#D4A22F]/20 hover:text-white"
            >
              {t("nav_courses")}
              <ArrowUpRight size={14} weight="bold" />
            </Link>
            <Link
              href="/student/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-5 py-2.5 text-zinc-300 transition-all hover:bg-white/[0.08] hover:text-white"
            >
              {t("nav_student")}
            </Link>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-xs font-mono text-zinc-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D4A22F]/40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#D4A22F]/60" />
            </span>
            <span>Checking campus live status every 30s</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LivePage() {
  const [forceDemo, setForceDemo] = useState(false);
  const { data, isLoading, isError } = useGetLiveQuery(undefined, {
    pollingInterval: forceDemo ? 0 : 30000,
  });
  const batches = useMemo(
    () => mapApiToBatches((data?.data ?? []) as Record<string, unknown>[]),
    [data],
  );

  if (forceDemo) {
    return <LiveClassroom data={[createDemoBatch30()]} onExitDemo={() => setForceDemo(false)} />;
  }

  if (isLoading) {
    return (
      <section className="flex min-h-[calc(100vh-5rem)] items-center justify-center pt-28" style={{ background: "#050810" }}>
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-[#D4A22F] border-t-transparent" />
          <p className="text-sm text-white/30">Loading live batches...</p>
        </div>
      </section>
    );
  }

  if (isError || !batches || batches.length === 0) {
    return <NoClassroomView onPreviewDemo={() => setForceDemo(true)} />;
  }

  return <LiveClassroom data={batches} />;
}
