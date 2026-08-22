import { DEMO_STUDENT } from "@/lib/student-data";

export const metadata = { title: "Profile" };

export default function ProfilePage() {
  const rows = [
    ["Student ID", DEMO_STUDENT.id],
    ["Roll no.", DEMO_STUDENT.roll],
    ["Email", DEMO_STUDENT.email],
    ["Phone", DEMO_STUDENT.phone],
    ["Parent phone", DEMO_STUDENT.parentPhone],
    ["Batch", DEMO_STUDENT.batch],
    ["Courses", DEMO_STUDENT.courses.map((c) => c.title).join(", ")],
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-sans text-3xl font-semibold tracking-tight">Profile</h1>
      <div className="card-surface mt-6 flex flex-col gap-6 p-6 md:flex-row">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-accent/10 font-mono text-xl text-accent">
          {DEMO_STUDENT.photoInitials}
        </div>
        <dl className="grid flex-1 gap-3 sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                {k}
              </dt>
              <dd className="mt-1 font-sans text-sm">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
