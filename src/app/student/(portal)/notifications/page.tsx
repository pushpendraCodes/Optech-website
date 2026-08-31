"use client";

import { STUDENT_NOTIFICATIONS } from "@/lib/student-data";
import { NOTICES } from "@/lib/site-content";
import { useGetStudentNoticesQuery, useGetStudentNotificationsQuery, useMarkStudentNotificationReadMutation } from "@/lib/api";
import { loc } from "@/lib/loc";
import { useStudentAuth } from "@/components/providers/StudentAuth";

export default function NotificationsPage() {
  const { studentId } = useStudentAuth();
  const { data, refetch } = useGetStudentNotificationsQuery(undefined, { skip: !studentId });
  const { data: noticeRes } = useGetStudentNoticesQuery(undefined, { skip: !studentId });
  const [markRead] = useMarkStudentNotificationReadMutation();

  const items = data?.data?.length
    ? data.data.map((row) => {
        const note = (row.notification as Record<string, unknown> | undefined) ?? {};
        return {
          id: String(row._id ?? note._id ?? ""),
          category: String(note.type ?? "notice"),
          title: String(note.title ?? ""),
          body: String(note.body ?? ""),
          time: row.createdAt ? String(row.createdAt).slice(0, 10) : "",
          unread: !row.readAt,
        };
      })
    : STUDENT_NOTIFICATIONS;

  const pinned = (noticeRes?.data ?? [])
    .filter((n) => n.pinned)
    .map((n) => ({ id: String(n._id), title: loc(n.title as never) }));

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-sans text-3xl font-semibold tracking-tight">Notifications</h1>
      <p className="mt-2 font-sans text-sm text-zinc-400">
        Fee due, exams, live class, admission, and general notices. Bell updates from this list.
      </p>
      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="card-surface cursor-pointer p-5"
            onClick={() => {
              if (item.unread) {
                void markRead(item.id).then(() => void refetch());
              }
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">{item.category}</p>
              <span className="font-mono text-[10px] text-zinc-500">{item.time}</span>
            </div>
            <h2 className="mt-2 font-sans text-base font-semibold">
              {item.unread ? <span className="mr-2 inline-block h-2 w-2 rounded-full bg-accent" /> : null}
              {item.title}
            </h2>
            <p className="mt-1 font-sans text-sm text-zinc-400">{item.body}</p>
            {item.category === "live_class" ? (
              <a href="/student/live" className="mt-3 inline-block font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                Open live classes
              </a>
            ) : null}
          </li>
        ))}
      </ul>
      <h2 className="mt-10 font-sans text-xl font-semibold">Pinned notices</h2>
      <ul className="mt-3 space-y-2">
        {(pinned.length ? pinned : NOTICES.filter((n) => n.pinned)).map((n) => (
          <li key={n.id} className="font-sans text-sm text-zinc-400">
            {n.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
