"use client";

import { DownloadSimple } from "@phosphor-icons/react";
import { Tx } from "@/components/i18n/Tx";
import { btnPrimary } from "@/components/ui/ui";
import { useGetStudentIdCardQuery, useGetStudentProfileQuery, useGetWebsiteSettingsQuery } from "@/lib/api";
import { useStudentAuth } from "@/components/providers/StudentAuth";

type IdCardData = {
  name: string;
  mobile: string;
  studentCode: string;
  address: string;
  photoUrl?: string;
  pdf?: string;
};

function logoUrl(logo: unknown) {
  if (!logo) return "";
  if (typeof logo === "string") return logo;
  if (typeof logo === "object" && "url" in logo) {
    const url = (logo as { url?: unknown }).url;
    return url ? String(url) : "";
  }
  return "";
}

function BrandHeader({ logoSrc, instituteName }: { logoSrc?: string; instituteName: string }) {
  const parts = instituteName.trim().split(/\s+/);
  const main = (parts[0] || "Optech").toUpperCase();
  const sub = parts.slice(1).join(" ").toUpperCase() || "COMPUTER INSTITUTE";

  return (
    <div className="flex items-center gap-3 bg-[#6b4423] px-4 py-3">
      {logoSrc ? (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt="" className="h-full w-full object-contain" />
        </div>
      ) : (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent/60 bg-accent/15 font-mono text-[10px] text-accent">
          {main.slice(0, 2)}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate font-sans text-sm font-bold uppercase tracking-wide text-white">{main}</p>
        <p className="truncate font-mono text-[9px] uppercase tracking-[0.16em] text-white/80">{sub}</p>
      </div>
    </div>
  );
}

function IdCardPreview({
  card,
  logoSrc,
  instituteName,
}: {
  card: IdCardData;
  logoSrc?: string;
  instituteName: string;
}) {
  const initials = card.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="overflow-hidden rounded-2xl border border-[#5c4033]/40 bg-[#faf0e6] shadow-[0_12px_40px_-20px_rgba(0,0,0,0.55)]">
      <BrandHeader logoSrc={logoSrc} instituteName={instituteName} />

      <div className="px-4 pb-4 pt-5">
        <div className="mx-auto mb-4 aspect-[5/6] w-28 overflow-hidden rounded border border-[#6b4423]/30 bg-[#e8d5c4]">
          {card.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={card.photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center font-mono text-lg text-[#6b4423]">{initials}</div>
          )}
        </div>

        <dl className="space-y-1.5 text-sm text-[#4a3228]">
          <div className="flex gap-2">
            <dt className="w-16 shrink-0 font-semibold">Name</dt>
            <dd>{card.name}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-16 shrink-0 font-semibold">Mobile</dt>
            <dd>{card.mobile || "—"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-16 shrink-0 font-semibold">ID</dt>
            <dd className="font-mono text-xs">{card.studentCode}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-16 shrink-0 font-semibold">Address</dt>
            <dd className="text-xs leading-snug">{card.address || "—"}</dd>
          </div>
        </dl>
      </div>

      <div className="h-2.5 bg-[#6b4423]" />
    </article>
  );
}

export default function IdCardPage() {
  const { studentId, name } = useStudentAuth();
  const { data, isLoading } = useGetStudentIdCardQuery(undefined, { skip: !studentId });
  const { data: profileRes } = useGetStudentProfileQuery(undefined, { skip: !studentId });
  const { data: siteRes } = useGetWebsiteSettingsQuery();

  const api = data?.data as
    | {
        name?: string;
        studentCode?: string;
        mobile?: string;
        address?: string;
        photoUrl?: string;
        pdf?: string;
      }
    | undefined;

  const profile = profileRes?.data as
    | {
        studentCode?: string;
        address?: string;
        photo?: { url?: string };
        user?: { name?: string; phone?: string };
      }
    | undefined;

  const site = siteRes?.data as { name?: string; logo?: unknown } | undefined;
  const instituteName = String(site?.name || "Optech Computer Institute");
  const logoSrc = logoUrl(site?.logo) || undefined;

  const card: IdCardData = {
    name: api?.name || profile?.user?.name || name || "Student",
    mobile: api?.mobile || profile?.user?.phone || "",
    studentCode: api?.studentCode || profile?.studentCode || studentId || "—",
    address: api?.address || profile?.address || "",
    photoUrl: api?.photoUrl || profile?.photo?.url,
    pdf: api?.pdf,
  };

  const downloadPdf = () => {
    if (!card.pdf) {
      window.print();
      return;
    }
    const bytes = Uint8Array.from(atob(card.pdf), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${card.studentCode}-id.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-md">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
        <Tx k="st_module" />
      </p>
      <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight">
        <Tx k="st_id" />
      </h1>
      <p className="mt-2 font-sans text-sm text-zinc-400">
        Auto-generated on admission. Same layout as the admin digital ID card — download the print PDF anytime.
      </p>

      {isLoading ? (
        <div className="mt-8 h-80 animate-pulse rounded-2xl border border-white/10 bg-white/3" />
      ) : (
        <>
          <div className="mt-8">
            <IdCardPreview card={card} logoSrc={logoSrc} instituteName={instituteName} />
          </div>

          <button type="button" className={`${btnPrimary} mt-5 w-full justify-center`} onClick={downloadPdf}>
            <DownloadSimple size={16} aria-hidden />
            Download ID card PDF
          </button>

          <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600">
            Show this card at campus · QR verification coming soon
          </p>
        </>
      )}
    </div>
  );
}
