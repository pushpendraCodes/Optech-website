"use client";

import Image from "next/image";
import { Tx } from "@/components/i18n/Tx";
import { useGetAlumniQuery } from "@/lib/api";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function youtubeIdFrom(row: Record<string, unknown>) {
  const id = String(row.youtubeId ?? "").trim();
  if (id) return id;
  const url = String(row.youtubeUrl ?? "").trim();
  if (!url) return "";
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return u.pathname.split("/").filter(Boolean)[0] ?? "";
    if (host.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const match = u.pathname.match(/\/(?:embed|shorts|live)\/([^/?]+)/);
      return match?.[1] ?? "";
    }
  } catch {
    return "";
  }
  return "";
}

export function AlumniBoard() {
  const { data, isLoading } = useGetAlumniQuery();
  const people = (data?.data ?? []).map((row) => {
    const photo =
      row.photo && typeof row.photo === "object" && "url" in (row.photo as object)
        ? String((row.photo as { url?: string }).url ?? "")
        : "";
    const youtubeId = youtubeIdFrom(row as Record<string, unknown>);
    return {
      id: String(row._id ?? row.name ?? ""),
      name: String(row.name ?? ""),
      batch: String(row.batchYear ?? ""),
      course: "",
      role: String(row.role ?? ""),
      story: String(row.story ?? ""),
      featured: Boolean(row.featured),
      photo,
      youtubeId,
    };
  });

  return (
    <section className="px-6 py-16 md:px-10 md:py-20">
      {isLoading ? (
        <div className="mx-auto grid max-w-[1400px] gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="card-surface h-48 animate-pulse" />
          ))}
        </div>
      ) : people.length === 0 ? (
        <p className="mx-auto max-w-[1400px] text-center font-sans text-sm text-zinc-400">
          No alumni profiles published yet.
        </p>
      ) : (
        <div className="mx-auto grid max-w-[1400px] gap-4 md:grid-cols-2">
          {people.map((person) => (
            <article key={person.id || person.name} className="card-surface overflow-hidden p-0">
              <div className="flex flex-col gap-0 sm:flex-row">
                <div className="relative h-44 w-full shrink-0 overflow-hidden bg-zinc-900 sm:h-auto sm:w-40">
                  {person.photo ? (
                    <Image
                      src={person.photo}
                      alt={person.name}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full min-h-44 items-center justify-center bg-accent/10 font-mono text-2xl text-accent sm:min-h-[160px]">
                      {initials(person.name)}
                    </div>
                  )}
                </div>
                <div className="flex-1 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
                      {person.featured ? <Tx k="alumni_featured" /> : <Tx k="alumni_dir" />}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                      <Tx k="alumni_batch" vars={{ year: person.batch }} />
                    </p>
                  </div>
                  <h2 className="mt-3 font-sans text-xl font-semibold">{person.name}</h2>
                  <p className="mt-1 font-sans text-sm text-zinc-400">
                    {person.course ? `${person.course} · ` : ""}
                    {person.role}
                  </p>
                  {person.story ? (
                    <p className="mt-4 font-sans text-sm leading-relaxed text-zinc-300">{person.story}</p>
                  ) : null}
                  {person.youtubeId ? (
                    <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-black">
                      <div className="relative aspect-video w-full">
                        <iframe
                          title={`${person.name} video`}
                          src={`https://www.youtube.com/embed/${person.youtubeId}`}
                          className="absolute inset-0 h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          loading="lazy"
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
