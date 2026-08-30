"use client";

import { useMemo, useState } from "react";
import { Play, VideoCamera } from "@phosphor-icons/react";
import { useGetStudentLiveQuery } from "@/lib/api";
import { loc } from "@/lib/loc";
import { useI18n } from "@/components/providers/I18nProvider";
import { useStudentAuth } from "@/components/providers/StudentAuth";

type LiveRow = {
  _id?: string;
  title?: string;
  youtubeUrl?: string;
  youtubeId?: string;
  startsAt?: string;
  isLive?: boolean;
  status?: string;
  course?: { title?: unknown };
  batch?: { label?: string; timing?: string };
};

function formatWhen(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export default function StudentLivePage() {
  const { t } = useI18n();
  const { studentId } = useStudentAuth();
  const { data, isLoading } = useGetStudentLiveQuery(undefined, { skip: !studentId, pollingInterval: 30000 });
  const [activeId, setActiveId] = useState<string | null>(null);

  const rows = (data?.data ?? []) as LiveRow[];
  const { liveRows, upcomingRows } = useMemo(() => {
    const liveRows = rows.filter((r) => r.isLive || r.status === "live");
    const upcomingRows = rows.filter((r) => !r.isLive && r.status !== "live");
    return { liveRows, upcomingRows };
  }, [rows]);

  const active =
    liveRows.find((r) => String(r._id) === activeId) ??
    liveRows[0] ??
    null;

  return (
    <div className="mx-auto max-w-[1400px]">
      <h1 className="font-sans text-3xl font-semibold tracking-tight">{t("st_live")}</h1>
      <p className="mt-2 max-w-2xl font-sans text-sm text-zinc-400">
        Join YouTube live sessions for your enrolled courses. You get an in-panel notice when a class is scheduled.
      </p>

      {isLoading ? (
        <div className="mt-8 h-40 animate-pulse rounded-2xl bg-white/5" />
      ) : liveRows.length === 0 && upcomingRows.length === 0 ? (
        <div className="card-surface mt-8 p-8 text-center">
          <VideoCamera size={28} className="mx-auto text-accent" />
          <p className="mt-4 font-sans text-lg font-semibold">No live classes right now</p>
          <p className="mt-2 text-sm text-zinc-400">Scheduled sessions for your course or batch will appear here.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <section>
            {active ? (
              <div className="card-surface overflow-hidden p-0">
                <div className="relative aspect-video bg-black">
                  {active.youtubeId ? (
                    <iframe
                      title={active.title ?? "Live class"}
                      src={`https://www.youtube.com/embed/${active.youtubeId}?autoplay=0`}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-accent">
                      <Play size={28} weight="fill" />
                      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400">{t("live_now")}</p>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">{t("live_now")}</p>
                  <h2 className="mt-2 font-sans text-2xl font-semibold">{active.title}</h2>
                  <p className="mt-2 text-sm text-zinc-400">
                    {loc(active.course?.title as never)} · {formatWhen(active.startsAt)}
                  </p>
                  {active.youtubeUrl ? (
                    <a
                      href={active.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent"
                    >
                      {t("live_join")}
                    </a>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="card-surface p-8 text-center">
                <p className="font-sans text-lg font-semibold">{t("live_standby")}</p>
                <p className="mt-2 text-sm text-zinc-400">Upcoming classes are listed on the right. Join opens when the session goes live.</p>
              </div>
            )}
          </section>

          <section className="space-y-4">
            {liveRows.length > 1 ? (
              <div>
                <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Live now</h2>
                <ul className="mt-3 space-y-2">
                  {liveRows.map((row) => (
                    <li key={String(row._id)}>
                      <button
                        type="button"
                        onClick={() => setActiveId(String(row._id))}
                        className={`card-surface w-full cursor-pointer p-4 text-left ${String(row._id) === String(active?._id) ? "border-accent/40" : ""}`}
                      >
                        <p className="font-sans text-sm font-semibold">{row.title}</p>
                        <p className="mt-1 text-xs text-zinc-500">{loc(row.course?.title as never)}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {upcomingRows.length ? (
              <div>
                <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Scheduled</h2>
                <ul className="mt-3 space-y-3">
                  {upcomingRows.map((row) => (
                    <li key={String(row._id)} className="card-surface p-4">
                      <p className="font-sans text-sm font-semibold">{row.title}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {loc(row.course?.title as never)}
                        {row.batch?.label ? ` · ${row.batch.label}` : ""}
                      </p>
                      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                        {formatWhen(row.startsAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        </div>
      )}
    </div>
  );
}
