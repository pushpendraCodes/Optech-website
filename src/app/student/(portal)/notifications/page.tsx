import { STUDENT_NOTIFICATIONS } from "@/lib/student-data";
import { NOTICES } from "@/lib/site-content";

export const metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-sans text-3xl font-semibold tracking-tight">Notifications</h1>
      <p className="mt-2 font-sans text-sm text-zinc-400">
        Fee due, exams, live class, admission, and general notices. Bell updates from this list.
      </p>
      <ul className="mt-6 space-y-3">
        {STUDENT_NOTIFICATIONS.map((item) => (
          <li key={item.id} className="card-surface p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                {item.category}
              </p>
              <span className="font-mono text-[10px] text-zinc-500">{item.time}</span>
            </div>
            <h2 className="mt-2 font-sans text-base font-semibold">
              {item.unread ? <span className="mr-2 inline-block h-2 w-2 rounded-full bg-accent" /> : null}
              {item.title}
            </h2>
            <p className="mt-1 font-sans text-sm text-zinc-400">{item.body}</p>
          </li>
        ))}
      </ul>
      <h2 className="mt-10 font-sans text-xl font-semibold">Pinned notices</h2>
      <ul className="mt-3 space-y-2">
        {NOTICES.filter((n) => n.pinned).map((n) => (
          <li key={n.id} className="font-sans text-sm text-zinc-400">
            {n.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
