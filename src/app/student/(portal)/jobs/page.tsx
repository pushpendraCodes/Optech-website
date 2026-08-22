import { JOBS } from "@/lib/site-content";

export const metadata = { title: "Jobs" };

export default function StudentJobsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-sans text-3xl font-semibold tracking-tight">Job listings</h1>
      <p className="mt-2 font-sans text-sm text-zinc-400">
        Placement openings shared by the institute for information only.
      </p>
      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {JOBS.map((job) => (
          <li key={job.id} className="card-surface flex flex-col gap-3 p-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                {job.type} · {job.course}
              </p>
              <p className="font-sans text-base font-semibold">{job.title}</p>
              <p className="font-sans text-sm text-zinc-400">
                {job.employer} · {job.location}
              </p>
            </div>
            <p className="font-sans text-sm leading-relaxed text-zinc-300">{job.description}</p>
            <p className="border-t border-white/10 pt-3 font-sans text-sm text-zinc-400">
              <span className="text-zinc-200">Contact:</span> {job.contact}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
