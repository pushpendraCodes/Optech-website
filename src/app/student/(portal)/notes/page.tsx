import { NOTES } from "@/lib/student-data";
import { DEMO_STUDENT } from "@/lib/student-data";

export const metadata = { title: "Notes" };

export default function NotesPage() {
  const allowed = new Set<string>(DEMO_STUDENT.courses.map((c) => c.title));
  const notes = NOTES.filter((n) => allowed.has(n.course));
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
          </article>
        ))}
      </div>
    </div>
  );
}
