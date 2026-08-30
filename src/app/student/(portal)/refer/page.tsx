"use client";

import { FormEvent, useState } from "react";
import { DEMO_STUDENT, REFERRALS } from "@/lib/student-data";
import { useCreateReferralMutation, useGetStudentProfileQuery, useGetStudentReferralsQuery } from "@/lib/api";
import { useStudentAuth } from "@/components/providers/StudentAuth";
import { btnPrimary, fieldClass } from "@/components/ui/ui";

export default function ReferPage() {
  const { studentId } = useStudentAuth();
  const { data: profileRes } = useGetStudentProfileQuery(undefined, { skip: !studentId });
  const { data } = useGetStudentReferralsQuery(undefined, { skip: !studentId });
  const [createReferral, state] = useCreateReferralMutation();
  const [message, setMessage] = useState("");
  const code = String((profileRes?.data as { referralCode?: string } | undefined)?.referralCode || DEMO_STUDENT.referralCode);
  const rows = data?.data?.length
    ? data.data.map((row) => ({
        name: String(row.refereePhone ?? "Invite"),
        status: String(row.status ?? "pending") as "pending" | "successful",
        reward: row.rewardType === "fixed" ? `₹${row.rewardValue}` : `${row.rewardValue}%`,
      }))
    : REFERRALS;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const phone = String(new FormData(e.currentTarget).get("phone") ?? "").trim();
    if (phone.length < 8) {
      setMessage("Enter a valid phone number.");
      return;
    }
    try {
      await createReferral({ refereePhone: phone }).unwrap();
      setMessage("Referral recorded.");
      e.currentTarget.reset();
    } catch (err) {
      setMessage(
        (err as { data?: { message?: string } })?.data?.message || "Could not record that referral.",
      );
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-sans text-3xl font-semibold tracking-tight">Refer & earn</h1>
      <p className="mt-2 font-sans text-sm text-zinc-400">
        Share your code. When a friend enrolls with it, the reward is tracked here. Self-referral is blocked.
      </p>
      <div className="card-surface mt-6 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Your code / link</p>
        <p className="mt-2 font-sans text-2xl font-semibold text-accent">{code}</p>
        <p className="mt-2 break-all font-mono text-[11px] text-zinc-500">/courses?ref={code}</p>
      </div>
      <form onSubmit={onSubmit} className="card-surface mt-4 flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Friend&apos;s phone</span>
          <input name="phone" type="tel" className={`${fieldClass} mt-2`} placeholder="98765 00000" />
        </label>
        <button type="submit" className={btnPrimary} disabled={state.isLoading}>
          {state.isLoading ? "Saving…" : "Record invite"}
        </button>
      </form>
      {message ? <p className="mt-3 font-sans text-sm text-accent">{message}</p> : null}
      <ul className="mt-6 space-y-3">
        {rows.map((row) => (
          <li key={`${row.name}-${row.status}`} className="card-surface flex justify-between p-4">
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
