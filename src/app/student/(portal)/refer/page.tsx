import { DEMO_STUDENT, REFERRALS } from "@/lib/student-data";

export const metadata = { title: "Refer & earn" };

export default function ReferPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-sans text-3xl font-semibold tracking-tight">Refer & earn</h1>
      <p className="mt-2 font-sans text-sm text-zinc-400">
        Share your code. When a friend enrolls with it, the reward is tracked here. Self-referral is blocked.
      </p>
      <div className="card-surface mt-6 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          Your code / link
        </p>
        <p className="mt-2 font-sans text-2xl font-semibold text-accent">
          {DEMO_STUDENT.referralCode}
        </p>
        <p className="mt-2 break-all font-mono text-[11px] text-zinc-500">
          /courses?ref={DEMO_STUDENT.referralCode}
        </p>
      </div>
      <ul className="mt-6 space-y-3">
        {REFERRALS.map((row) => (
          <li key={row.name} className="card-surface flex justify-between p-4">
            <span className="font-sans text-sm">{row.name}</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
              {row.status} · {row.reward}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
