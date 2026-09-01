"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  CalendarBlank,
  Certificate,
  Copy,
  CurrencyInr,
  EnvelopeSimple,
  GraduationCap,
  House,
  IdentificationCard,
  MapPin,
  Phone,
  ShareNetwork,
  User,
  Users,
} from "@phosphor-icons/react";
import { useState } from "react";
import { Tx } from "@/components/i18n/Tx";
import { useGetStudentDashboardQuery, useGetStudentProfileQuery } from "@/lib/api";
import { loc } from "@/lib/loc";
import { useStudentAuth } from "@/components/providers/StudentAuth";
import { btnGhost } from "@/components/ui/ui";

function formatDate(value?: string | Date) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function InfoTile({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: typeof User;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon size={16} className="text-accent" aria-hidden />
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      </div>
      <p className={`text-sm text-zinc-200 ${mono ? "font-mono" : "font-sans"}`}>{value || "—"}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { studentId, name } = useStudentAuth();
  const { data, isLoading } = useGetStudentProfileQuery(undefined, { skip: !studentId });
  const { data: dash } = useGetStudentDashboardQuery(undefined, { skip: !studentId });
  const [copied, setCopied] = useState(false);

  const profile = data?.data as
    | {
        studentCode?: string;
        rollNumber?: string;
        parentPhone?: string;
        referralCode?: string;
        validTill?: string;
        address?: string;
        dob?: string;
        photo?: { url?: string };
        user?: { name?: string; email?: string; phone?: string };
        batch?: { label?: string; timing?: string };
      }
    | undefined;

  const enrollments = (dash?.data?.enrollments as Record<string, unknown>[] | undefined) ?? [];
  const displayName = profile?.user?.name || name || "Student";
  const code = profile?.studentCode || studentId || "—";
  const referralCode = profile?.referralCode || "—";
  const photoUrl = profile?.photo?.url;

  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const quickLinks = [
    { href: "/student/id-card", label: "st_id" as const, icon: IdentificationCard },
    { href: "/student/fees", label: "st_fees" as const, icon: CurrencyInr },
    { href: "/student/refer", label: "st_refer" as const, icon: Users },
    { href: "/student/courses", label: "st_courses" as const, icon: BookOpen },
  ];

  async function copyReferral() {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
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
        <Tx k="st_profile_title" />
      </h1>
      <p className="mt-2 font-sans text-sm text-zinc-400">
        Your account details, batch assignment, and enrolled courses.
      </p>

      {/* Profile hero */}
      <article className="relative mt-8 overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,162,47,0.14),transparent_55%)]" />
        <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-center md:p-8">
          <div className="relative shrink-0">
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt=""
                width={96}
                height={96}
                className="h-24 w-24 rounded-3xl border border-white/10 object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-accent/30 bg-accent/15 font-mono text-2xl text-accent">
                {initials}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-emerald-300">
              Active
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-sans text-2xl font-semibold tracking-tight">{displayName}</h2>
            <p className="mt-1 font-mono text-sm text-accent">{code}</p>
            {profile?.batch?.label ? (
              <p className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
                <GraduationCap size={16} className="text-zinc-500" aria-hidden />
                {profile.batch.label}
                {profile.batch.timing ? ` · ${profile.batch.timing}` : ""}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {profile?.rollNumber ? (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400">
                  Roll {profile.rollNumber}
                </span>
              ) : null}
              {profile?.validTill ? (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400">
                  Valid till {formatDate(profile.validTill)}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </article>

      {/* Quick links */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="card-surface group flex flex-col items-center gap-2 p-4 text-center transition hover:border-accent/30"
          >
            <Icon size={22} className="text-accent transition group-hover:scale-110" aria-hidden />
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">
              <Tx k={label} />
            </span>
          </Link>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-6 h-40 animate-pulse rounded-3xl border border-white/10 bg-white/[0.03]" />
      ) : (
        <>
          {/* Contact */}
          <section className="mt-8">
            <h3 className="mb-4 font-sans text-lg font-semibold">Contact & personal</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoTile icon={EnvelopeSimple} label="Email" value={profile?.user?.email || ""} />
              <InfoTile icon={Phone} label="Phone" value={profile?.user?.phone || ""} mono />
              <InfoTile
                icon={Phone}
                label="Parent phone"
                value={profile?.parentPhone || ""}
                mono
              />
              <InfoTile icon={CalendarBlank} label="Date of birth" value={formatDate(profile?.dob)} />
              <InfoTile
                icon={MapPin}
                label="Address"
                value={profile?.address || "Not provided — update at campus office"}
              />
            </div>
          </section>

          {/* Referral */}
          <section className="mt-8">
            <div className="overflow-hidden rounded-3xl border border-accent/25 bg-gradient-to-br from-accent/10 via-zinc-950 to-zinc-950 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                    <ShareNetwork size={14} aria-hidden />
                    Referral code
                  </p>
                  <p className="mt-2 font-mono text-2xl tracking-wider text-foreground">{referralCode}</p>
                  <p className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                    Share: /courses?ref={referralCode}
                  </p>
                </div>
                <button type="button" className={btnGhost} onClick={() => void copyReferral()}>
                  <Copy size={14} aria-hidden />
                  {copied ? "Copied" : "Copy code"}
                </button>
              </div>
              <Link href="/student/refer" className="mt-4 inline-flex items-center gap-1 text-sm text-accent hover:underline">
                <Users size={14} aria-hidden />
                View referrals & rewards
              </Link>
            </div>
          </section>

          {/* Enrolled courses */}
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-sans text-lg font-semibold">
                <Tx k="st_enrolled" />
              </h3>
              <Link href="/student/courses" className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                View all
              </Link>
            </div>
            {enrollments.length === 0 ? (
              <div className="card-surface flex flex-col items-center gap-3 p-8 text-center">
                <BookOpen size={32} className="text-zinc-600" aria-hidden />
                <p className="text-sm text-zinc-500">No enrollments yet.</p>
                <Link href="/courses" className={btnGhost}>
                  <House size={14} aria-hidden />
                  Browse courses
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {enrollments.map((row) => {
                  const course = row.course as { title?: unknown; slug?: string; duration?: string } | undefined;
                  const batch = row.batch as { label?: string; timing?: string } | undefined;
                  const title = loc(course?.title as never) || "Course";
                  const progress = Number(row.progress ?? 0);
                  return (
                    <li key={String(row._id ?? title)} className="card-surface p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-sans font-medium">{title}</p>
                          {batch?.label ? (
                            <p className="mt-1 text-xs text-zinc-500">
                              {batch.label}
                              {batch.timing ? ` · ${batch.timing}` : ""}
                            </p>
                          ) : null}
                          {course?.duration ? (
                            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
                              {course.duration}
                            </p>
                          ) : null}
                        </div>
                        <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-xs text-accent">
                          {progress}%
                        </span>
                      </div>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/8">
                        <div
                          className="h-full rounded-full bg-accent transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Account IDs footer */}
          <section className="mt-8 rounded-2xl border border-white/8 bg-white/[0.02] p-5">
            <p className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              <Certificate size={14} aria-hidden />
              Account identifiers
            </p>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                  <Tx k="st_field_id" />
                </dt>
                <dd className="mt-1 font-mono text-sm text-zinc-300">{code}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                  <Tx k="st_field_roll" />
                </dt>
                <dd className="mt-1 font-mono text-sm text-zinc-300">
                  {profile?.rollNumber || "—"}
                </dd>
              </div>
            </dl>
          </section>
        </>
      )}
    </div>
  );
}
