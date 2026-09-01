"use client";

import { useState } from "react";
import { useGetStudentNoticesQuery, useGetStudentNotificationsQuery, useMarkStudentNotificationReadMutation, useMarkAllStudentNotificationsReadMutation } from "@/lib/api";
import { loc } from "@/lib/loc";
import { useStudentAuth } from "@/components/providers/StudentAuth";
import {
  CheckCircle,
  CaretLeft,
  CaretRight,
  ArrowSquareOut,
  BellSimple,
} from "@phosphor-icons/react";

const LIMIT = 10;

export default function NotificationsPage() {
  const { studentId } = useStudentAuth();
  const [page, setPage] = useState(1);

  const { data, refetch, isFetching } = useGetStudentNotificationsQuery(
    { page, limit: LIMIT },
    { skip: !studentId, pollingInterval: 5000 },
  );
  const { data: noticeRes } = useGetStudentNoticesQuery(undefined, {
    skip: !studentId,
    pollingInterval: 15000,
  });

  const [markRead] = useMarkStudentNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllStudentNotificationsReadMutation();

  const meta = data?.meta as
    | { currentPage?: number; totalPages?: number; totalItems?: number }
    | undefined;

  const totalPages = Number(meta?.totalPages ?? 1);
  const totalItems = Number(meta?.totalItems ?? (data?.data?.length || 0));

  const rawItems = data?.data;
  const items = (rawItems ?? []).map((row) => {
    const note = (row.notification as Record<string, unknown> | undefined) ?? {};
    return {
      id: String(row._id ?? note._id ?? ""),
      category: String(note.type ?? "notice"),
      title: String(note.title ?? ""),
      body: String(note.body ?? ""),
      time: row.createdAt ? String(row.createdAt).slice(0, 10) : "",
      unread: !row.readAt,
    };
  });

  const unreadCount = items.filter((i) => i.unread).length;

  const pinned = (noticeRes?.data ?? [])
    .filter((n) => n.pinned)
    .map((n) => ({ id: String(n._id), title: loc(n.title as never) }));

  const handleMarkAll = async () => {
    try {
      await markAllRead().unwrap();
      void refetch();
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-sans text-3xl font-semibold tracking-tight">Notifications</h1>
          <p className="mt-1 font-sans text-sm text-zinc-400">
            Fee due, exams, live classes, admission, and general notices. Real-time updates.
          </p>
        </div>
        {unreadCount > 0 || (totalItems > 0 && page === 1) ? (
          <button
            type="button"
            onClick={handleMarkAll}
            disabled={isMarkingAll}
            className="inline-flex cursor-pointer items-center gap-1.5 self-start rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-300 transition-colors hover:border-accent/40 hover:bg-accent/10 hover:text-accent disabled:opacity-50 sm:self-auto"
          >
            <CheckCircle size={14} weight="bold" />
            <span>{isMarkingAll ? "Marking..." : "Mark all as read"}</span>
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-white/8 bg-zinc-950/40 p-12 text-center">
          <BellSimple size={36} className="text-zinc-600" />
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
            No notifications on this page
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className={`group relative rounded-2xl border p-5 transition-all duration-200 ${
                item.unread
                  ? "border-accent/30 bg-accent/[0.03] hover:border-accent/50"
                  : "border-white/8 bg-zinc-950/40 hover:border-white/15"
              }`}
              onClick={() => {
                if (item.unread) {
                  void markRead(item.id).then(() => void refetch());
                }
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {item.unread ? (
                    <span
                      className="h-2 w-2 rounded-full bg-accent animate-pulse"
                      title="Unread"
                    />
                  ) : null}
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                    {item.category.replace("_", " ")}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-zinc-500">{item.time}</span>
              </div>
              <h2 className="mt-2 font-sans text-base font-semibold text-foreground">
                {item.title}
              </h2>
              <p className="mt-1 font-sans text-sm leading-relaxed text-zinc-400">{item.body}</p>
              <div className="mt-3 flex items-center justify-between">
                {item.category === "live_class" ? (
                  <a
                    href="/student/live"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent hover:underline"
                  >
                    <span>Open live classes</span>
                    <ArrowSquareOut size={12} />
                  </a>
                ) : <div />}
                {item.unread ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void markRead(item.id).then(() => void refetch());
                    }}
                    className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500 hover:text-accent"
                  >
                    Mark read
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-between border-t border-white/8 pt-4">
          <p className="font-mono text-[11px] text-zinc-500">
            Page {page} of {totalPages} ({totalItems} total)
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <CaretLeft size={12} />
              <span>Prev</span>
            </button>
            <button
              type="button"
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <span>Next</span>
              <CaretRight size={12} />
            </button>
          </div>
        </div>
      ) : null}

      {/* Pinned notices */}
      <div className="mt-10 rounded-2xl border border-white/8 bg-zinc-950/20 p-5">
        <h2 className="font-sans text-base font-semibold text-foreground">📌 Pinned Institute Notices</h2>
        <ul className="mt-3 space-y-2">
          {pinned.length === 0 ? (
            <li className="font-sans text-sm text-zinc-500">No pinned notices.</li>
          ) : (
            pinned.map((n) => (
              <li key={n.id} className="font-sans text-sm text-zinc-400">
                • {n.title}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
