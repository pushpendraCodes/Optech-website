"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle,
  Clock,
  Copy,
  CurrencyInr,
  Gift,
  ShareNetwork,
  Users,
  XCircle,
} from "@phosphor-icons/react";
import { Tx } from "@/components/i18n/Tx";
import { DEMO_STUDENT, REFERRALS } from "@/lib/student-data";
import { useGetStudentProfileQuery, useGetStudentReferralsQuery } from "@/lib/api";
import { useStudentAuth } from "@/components/providers/StudentAuth";
import { btnGhost } from "@/components/ui/ui";

type ReferralRow = {
  id: string;
  refereeLabel: string;
  refereePhone: string;
  status: "pending" | "successful" | "rejected";
  payoutStatus: "none" | "pending" | "paid";
  rewardLabel: string;
  date: string;
};

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function rewardLabel(row: { rewardType?: string; rewardValue?: number }) {
  const type = String(row.rewardType ?? "percent");
  const value = Number(row.rewardValue ?? 0);
  if (!value) return "As per institute policy";
  return type === "fixed" ? `₹${value.toLocaleString("en-IN")}` : `${value}% of course fee`;
}

function benefitLabel(status: ReferralRow["status"], payoutStatus: ReferralRow["payoutStatus"]) {
  if (payoutStatus === "paid") return "Paid";
  if (payoutStatus === "pending") return "Benefit pending";
  if (status === "successful") return "Eligible";
  if (status === "rejected") return "Not eligible";
  return "Awaiting enrollment";
}

function benefitTone(status: ReferralRow["status"], payoutStatus: ReferralRow["payoutStatus"]) {
  if (payoutStatus === "paid") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  if (payoutStatus === "pending") return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  if (status === "successful") return "border-accent/30 bg-accent/10 text-accent";
  if (status === "rejected") return "border-red-500/30 bg-red-500/10 text-red-300";
  return "border-zinc-600/40 bg-zinc-800/60 text-zinc-400";
}

function statusTone(status: ReferralRow["status"]) {
  if (status === "successful") return "text-emerald-300";
  if (status === "rejected") return "text-red-300";
  return "text-zinc-400";
}

export default function ReferPage() {
  const { studentId } = useStudentAuth();
  const { data: profileRes } = useGetStudentProfileQuery(undefined, { skip: !studentId });
  const { data, isLoading, isError, refetch } = useGetStudentReferralsQuery(undefined, { skip: !studentId });
  const [copiedCode, setCopiedCode] = useState(false);

  const code = String(
    (profileRes?.data as { referralCode?: string } | undefined)?.referralCode || DEMO_STUDENT.referralCode,
  );

  const rows: ReferralRow[] = useMemo(() => {
    if (data?.data?.length) {
      return data.data.map((row) => {
        const referee = row.refereeStudent as
          | { user?: { name?: string; phone?: string }; studentCode?: string }
          | undefined;
        const status = String(row.status ?? "pending") as ReferralRow["status"];
        const payoutStatus = String(row.payoutStatus ?? "none") as ReferralRow["payoutStatus"];
        const phone = String(row.refereePhone ?? referee?.user?.phone ?? "");
        return {
          id: String(row._id),
          refereeLabel: referee?.user?.name || phone || "Referred friend",
          refereePhone: phone || "—",
          status,
          payoutStatus,
          rewardLabel: rewardLabel(row as { rewardType?: string; rewardValue?: number }),
          date: formatDate(row.createdAt ? String(row.createdAt) : undefined),
        };
      });
    }
    return REFERRALS.map((row, index) => ({
      id: `demo-${index}`,
      refereeLabel: row.name,
      refereePhone: "—",
      status: row.status,
      payoutStatus: row.status === "successful" ? ("pending" as const) : ("none" as const),
      rewardLabel: row.reward,
      date: "—",
    }));
  }, [data?.data]);

  const stats = useMemo(() => {
    const total = rows.length;
    const successful = rows.filter((r) => r.status === "successful").length;
    const paid = rows.filter((r) => r.payoutStatus === "paid").length;
    const pendingBenefit = rows.filter((r) => r.payoutStatus === "pending").length;
    return { total, successful, paid, pendingBenefit };
  }, [rows]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
        <Tx k="st_module" />
      </p>
      <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight">
        <Tx k="st_refer" />
      </h1>
      <p className="mt-2 font-sans text-sm text-zinc-400">
        Share your referral code with friends. When they purchase a course using your code, admin tracks the referral
        and credits your benefit.
      </p>

      <div className="mt-8 overflow-hidden rounded-3xl border border-accent/25 bg-linear-to-br from-accent/10 via-zinc-950 to-zinc-950 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              <ShareNetwork size={14} aria-hidden />
              Your referral code
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="font-mono text-3xl tracking-wider text-foreground">{code}</p>
              <button
                type="button"
                className={btnGhost}
                onClick={() => void copyCode()}
              >
                <Copy size={14} aria-hidden />
                {copiedCode ? "Copied" : "Copy code"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/3 p-4 text-sm leading-relaxed text-zinc-300">
          <p className="font-medium text-zinc-100">How it works</p>
          <ul className="mt-2 list-inside list-disc space-y-1.5 text-zinc-400">
            <li>Share this code with a friend before they enroll or at course checkout.</li>
            <li>They should enter <span className="font-mono text-accent">{code}</span> while purchasing a course.</li>
            <li>After their enrollment is confirmed, your referral appears below.</li>
            <li>Admin will review and pay your benefit — cash, discount, or reward as per institute policy.</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total referrals", value: String(stats.total), icon: Users },
          { label: "Successful", value: String(stats.successful), icon: CheckCircle },
          { label: "Benefit paid", value: String(stats.paid), icon: CurrencyInr },
          { label: "Pending benefit", value: String(stats.pendingBenefit), icon: Clock },
        ].map(({ label, value, icon: Icon }) => (
          <article key={label} className="rounded-2xl border border-white/10 bg-white/3 p-4">
            <div className="flex items-center gap-2">
              <Icon size={16} className="text-accent" aria-hidden />
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">{label}</p>
            </div>
            <p className="mt-2 font-sans text-2xl font-semibold">{value}</p>
          </article>
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <Gift size={18} className="text-accent" aria-hidden />
          <h2 className="font-sans text-xl font-semibold">Your referrals</h2>
        </div>

        {isLoading ? (
          <div className="h-40 animate-pulse rounded-3xl border border-white/10 bg-white/3" />
        ) : isError ? (
          <div className="card-surface p-8 text-center">
            <p className="text-sm text-zinc-400">Could not load referrals.</p>
            <button type="button" className={`${btnGhost} mt-4`} onClick={() => void refetch()}>
              Retry
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="card-surface flex flex-col items-center gap-3 p-10 text-center">
            <Users size={32} className="text-zinc-600" aria-hidden />
            <p className="font-sans text-lg font-semibold">No referrals yet</p>
            <p className="max-w-md text-sm text-zinc-400">
              Share your code with friends. When they enroll using your referral code, the record will show up here
              with benefit status.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="border-b border-white/8 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Friend</th>
                    <th className="px-4 py-3 text-left">Phone</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Referral</th>
                    <th className="px-4 py-3 text-left">Benefit</th>
                    <th className="px-4 py-3 text-left">Reward</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-white/5 last:border-0">
                      <td className="px-4 py-3 font-medium text-zinc-100">{row.refereeLabel}</td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-400">{row.refereePhone}</td>
                      <td className="px-4 py-3 text-zinc-400">{row.date}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] ${statusTone(row.status)}`}>
                          {row.status === "successful" ? (
                            <CheckCircle size={12} aria-hidden />
                          ) : row.status === "rejected" ? (
                            <XCircle size={12} aria-hidden />
                          ) : (
                            <Clock size={12} aria-hidden />
                          )}
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] ${benefitTone(row.status, row.payoutStatus)}`}
                        >
                          {benefitLabel(row.status, row.payoutStatus)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-300">{row.rewardLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
