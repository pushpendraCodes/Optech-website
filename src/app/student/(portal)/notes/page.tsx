"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowSquareOut,
  BookOpen,
  FileDoc,
  FilePdf,
  LinkSimple,
  MagnifyingGlass,
  PlayCircle,
  VideoCamera,
} from "@phosphor-icons/react";
import { Tx } from "@/components/i18n/Tx";
import {
  useGetStudentDashboardQuery,
  useGetStudentNotesQuery,
  useViewStudentNoteMutation,
} from "@/lib/api";
import { loc } from "@/lib/loc";
import { useStudentAuth } from "@/components/providers/StudentAuth";
import { btnGhost, btnPrimary } from "@/components/ui/ui";

type NoteType = "pdf" | "doc" | "video" | "link";

type NoteItem = {
  id: string;
  course: string;
  courseSlug: string;
  chapter: string;
  title: string;
  type: NoteType;
  views: number;
  href: string;
};

const TYPE_META: Record<
  NoteType,
  { label: string; icon: typeof FilePdf; tone: string; action: string }
> = {
  pdf: {
    label: "PDF",
    icon: FilePdf,
    tone: "border-red-500/30 bg-red-500/10 text-red-300",
    action: "Open PDF",
  },
  doc: {
    label: "Doc",
    icon: FileDoc,
    tone: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    action: "Open doc",
  },
  video: {
    label: "Video",
    icon: VideoCamera,
    tone: "border-violet-500/30 bg-violet-500/10 text-violet-300",
    action: "Watch",
  },
  link: {
    label: "Link",
    icon: LinkSimple,
    tone: "border-accent/30 bg-accent/10 text-accent",
    action: "Open link",
  },
};

function normalizeType(value: unknown): NoteType {
  const raw = String(value ?? "pdf").toLowerCase();
  if (raw === "doc" || raw === "video" || raw === "link") return raw;
  return "pdf";
}

function resolveNoteUrl(type: NoteType, row: Record<string, unknown>): string {
  if (type === "link") return String(row.externalUrl ?? "").trim();
  const asset = row.asset as { url?: string } | undefined;
  return String(asset?.url ?? "").trim();
}

function mapApiNote(row: Record<string, unknown>): NoteItem {
  const type = normalizeType(row.type);
  const course = row.course as { title?: unknown; slug?: string } | undefined;
  return {
    id: String(row._id),
    course: loc(course?.title as never) || "Course",
    courseSlug: course?.slug || "",
    chapter: String(row.chapter ?? "General"),
    title: String(row.title ?? "Untitled"),
    type,
    views: Number(row.views ?? 0),
    href: resolveNoteUrl(type, row),
  };
}

function TypeBadge({ type }: { type: NoteType }) {
  const meta = TYPE_META[type];
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] ${meta.tone}`}
    >
      <Icon size={12} weight="fill" aria-hidden />
      {meta.label}
    </span>
  );
}

function NoteRow({
  note,
  onOpen,
}: {
  note: NoteItem;
  onOpen: () => void;
}) {
  const meta = TYPE_META[note.type];
  const canOpen = Boolean(note.href);

  return (
    <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3 last:border-0 hover:bg-white/3">
      <TypeBadge type={note.type} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-sans text-sm font-medium text-zinc-100">{note.title}</p>
        <p className="truncate font-sans text-xs text-zinc-500">{note.chapter}</p>
      </div>
      <span className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600 sm:inline">
        {note.views} views
      </span>
      {canOpen ? (
        <a
          href={note.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            onOpen();
          }}
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-accent transition hover:border-accent/30 hover:bg-accent/10"
        >
          {note.type === "video" ? <PlayCircle size={12} aria-hidden /> : <ArrowSquareOut size={12} aria-hidden />}
          {meta.action}
        </a>
      ) : (
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">No file</span>
      )}
    </div>
  );
}

export default function NotesPage() {
  const { studentId } = useStudentAuth();
  const { data, isLoading, isError, refetch } = useGetStudentNotesQuery(undefined, { skip: !studentId });
  const { data: dash } = useGetStudentDashboardQuery(undefined, { skip: !studentId });
  const [viewNote] = useViewStudentNoteMutation();
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<NoteType | "all">("all");

  const notes: NoteItem[] = useMemo(() => {
    return (data?.data ?? []).map((row) => mapApiNote(row as Record<string, unknown>));
  }, [data?.data]);

  const enrolledCourses = useMemo(() => {
    const enrollments = (dash?.data?.enrollments as Record<string, unknown>[] | undefined) ?? [];
    const fromNotes = [...new Set(notes.map((n) => n.course))];
    if (enrollments.length) {
      return enrollments.map((row) => {
        const course = row.course as { title?: unknown } | undefined;
        return loc(course?.title as never) || "Course";
      });
    }
    return fromNotes;
  }, [dash?.data?.enrollments, notes]);

  const typeCounts = useMemo(() => {
    const counts: Record<NoteType, number> = { pdf: 0, doc: 0, video: 0, link: 0 };
    for (const note of notes) counts[note.type] += 1;
    return counts;
  }, [notes]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notes.filter((note) => {
      const matchesCourse = courseFilter === "all" || note.course === courseFilter;
      const matchesType = typeFilter === "all" || note.type === typeFilter;
      const matchesSearch =
        !q ||
        note.title.toLowerCase().includes(q) ||
        note.chapter.toLowerCase().includes(q) ||
        note.course.toLowerCase().includes(q);
      return matchesCourse && matchesType && matchesSearch;
    });
  }, [courseFilter, notes, search, typeFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, NoteItem[]>();
    for (const note of filtered) {
      const list = map.get(note.course) ?? [];
      list.push(note);
      map.set(note.course, list);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([course, items]) => ({
        course,
        items: [...items].sort((a, b) => {
          const chapter = a.chapter.localeCompare(b.chapter);
          if (chapter !== 0) return chapter;
          return a.title.localeCompare(b.title);
        }),
      }));
  }, [filtered]);

  const typeFilters: { key: NoteType | "all"; label: string; count?: number }[] = [
    { key: "all", label: "All", count: notes.length },
    { key: "pdf", label: "PDF", count: typeCounts.pdf },
    { key: "doc", label: "Doc", count: typeCounts.doc },
    { key: "video", label: "Video", count: typeCounts.video },
    { key: "link", label: "Links", count: typeCounts.link },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
        <Tx k="st_module" />
      </p>
      <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight">
        <Tx k="st_notes_title" />
      </h1>
      <p className="mt-2 font-sans text-sm text-zinc-400">
        <Tx k="st_notes_lead" />
      </p>

      {isLoading ? (
        <div className="mt-8 space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-16 animate-pulse rounded-2xl border border-white/10 bg-white/3" />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-3xl border border-white/10 bg-white/3" />
        </div>
      ) : isError ? (
        <div className="card-surface mt-8 p-8 text-center">
          <p className="text-sm text-zinc-400">Could not load notes. Check your connection and try again.</p>
          <button type="button" className={`${btnGhost} mt-4`} onClick={() => void refetch()}>
            Retry
          </button>
        </div>
      ) : notes.length === 0 ? (
        <div className="card-surface mt-8 flex flex-col items-center gap-4 p-10 text-center">
          <BookOpen size={36} className="text-zinc-600" aria-hidden />
          <p className="font-sans text-lg font-semibold">No study material yet</p>
          <p className="max-w-sm text-sm text-zinc-400">
            Notes, PDFs, videos, and links for your enrolled courses will appear here once admin publishes them.
          </p>
          <Link href="/student/courses" className={btnPrimary}>
            View my courses
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(Object.keys(TYPE_META) as NoteType[]).map((type) => {
              const meta = TYPE_META[type];
              const Icon = meta.icon;
              return (
                <article key={type} className="rounded-2xl border border-white/10 bg-white/3 p-3">
                  <div className="flex items-center gap-2">
                    <Icon size={16} className="text-accent" aria-hidden />
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">{meta.label}</p>
                  </div>
                  <p className="mt-1 font-sans text-xl font-semibold">{typeCounts[type]}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {typeFilters.map(({ key, label, count }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTypeFilter(key)}
                    className={`cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition ${
                      typeFilter === key
                        ? "border-accent/40 bg-accent/15 text-accent"
                        : "border-white/10 bg-white/3 text-zinc-400 hover:border-white/20"
                    }`}
                  >
                    {label}
                    {count !== undefined ? ` (${count})` : ""}
                  </button>
                ))}
              </div>
              <label className="relative block w-full lg:max-w-xs">
                <MagnifyingGlass
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                  aria-hidden
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search title or chapter..."
                  className="w-full rounded-2xl border border-white/10 bg-zinc-900 py-2.5 pl-10 pr-4 font-sans text-sm outline-none transition focus:border-accent/40 focus:ring-2 focus:ring-accent/20"
                />
              </label>
            </div>

            {enrolledCourses.length > 1 ? (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCourseFilter("all")}
                  className={`cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition ${
                    courseFilter === "all"
                      ? "border-accent/40 bg-accent/15 text-accent"
                      : "border-white/10 text-zinc-400 hover:border-white/20"
                  }`}
                >
                  All courses
                </button>
                {enrolledCourses.map((course) => (
                  <button
                    key={course}
                    type="button"
                    onClick={() => setCourseFilter(course)}
                    className={`cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition ${
                      courseFilter === course
                        ? "border-accent/40 bg-accent/15 text-accent"
                        : "border-white/10 text-zinc-400 hover:border-white/20"
                    }`}
                  >
                    {course}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {filtered.length === 0 ? (
            <div className="card-surface mt-6 p-8 text-center">
              <p className="text-sm text-zinc-400">No notes match your filters.</p>
              <button
                type="button"
                className={`${btnGhost} mt-4`}
                onClick={() => {
                  setSearch("");
                  setCourseFilter("all");
                  setTypeFilter("all");
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {grouped.map(({ course, items }) => (
                <section key={course} className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
                  <header className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <BookOpen size={16} className="shrink-0 text-accent" aria-hidden />
                      <h2 className="truncate font-sans text-sm font-semibold">{course}</h2>
                    </div>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </span>
                  </header>
                  <div>
                    {items.map((note) => (
                      <NoteRow
                        key={note.id}
                        note={note}
                        onOpen={() => void viewNote(note.id)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600">
            PDF · Doc · Video · Link — materials are tied to your active enrollment
          </p>
        </>
      )}
    </div>
  );
}
