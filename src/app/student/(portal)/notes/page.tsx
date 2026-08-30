"use client";

import { NOTES, DEMO_STUDENT } from "@/lib/student-data";
import { useGetStudentNotesQuery, useViewStudentNoteMutation } from "@/lib/api";
import { loc } from "@/lib/loc";
import { useStudentAuth } from "@/components/providers/StudentAuth";

export default function NotesPage() {
  const { studentId } = useStudentAuth();
  const { data } = useGetStudentNotesQuery(undefined, { skip: !studentId });
  const [viewNote] = useViewStudentNoteMutation();
  const allowed = new Set<string>(DEMO_STUDENT.courses.map((c) => c.title));
  const fallback = NOTES.filter((n) => allowed.has(n.course));
  const notes = data?.data?.length
    ? data.data.map((row) => ({
        id: String(row._id),
        course: loc((row.course as { title?: unknown } | undefined)?.title as never) || "Course",
        chapter: String(row.chapter ?? ""),
        title: String(row.title ?? ""),
        type: String(row.type ?? "PDF").toUpperCase(),
        views: Number(row.views ?? 0),
        href: String(row.externalUrl ?? (row.asset as { url?: string } | undefined)?.url ?? ""),
      }))
    : fallback.map((n) => ({ ...n, href: "" }));

  return (
    <div className="mx-auto max-w-[1400px]">
      <h1 className="font-sans text-3xl font-semibold tracking-tight">Notes & materials</h1>
      <p className="mt-2 font-sans text-sm text-zinc-400">
        Only enrolled-course files. Organized by module / chapter.
      </p>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {notes.map((note) => (
          <article key={note.id} className="card-surface p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              {note.course} · {note.type}
            </p>
            <h2 className="mt-2 font-sans text-lg font-semibold">{note.title}</h2>
            <p className="mt-1 font-sans text-sm text-zinc-400">{note.chapter}</p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              {note.views} views · download locked to your admission
            </p>
            {note.href ? (
              <a
                href={note.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (data?.data?.length) void viewNote(note.id);
                }}
                className="mt-3 inline-block font-mono text-[11px] uppercase tracking-[0.18em] text-accent"
              >
                Open material
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
