"use client";

import { DownloadSimple } from "@phosphor-icons/react";
import { Tx } from "@/components/i18n/Tx";
import { DEMO_STUDENT } from "@/lib/student-data";
import { btnGhost } from "@/components/ui/ui";
import { useGetStudentIdCardQuery, useGetStudentProfileQuery } from "@/lib/api";
import { useStudentAuth } from "@/components/providers/StudentAuth";

type IdCardData = {
  name: string;
  mobile: string;
  studentCode: string;
  address: string;
  photoUrl?: string;
  pdf?: string;
};

function IdCardPreview({ card }: { card: IdCardData }) {
  const initials = card.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="overflow-hidden rounded-2xl border border-[#5c4033]/40 bg-[#faf0e6] shadow-[0_12px_40px_-20px_rgba(0,0,0,0.55)]">
      <div className="flex items-center gap-3 bg-[#6b4423] px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d4a22f]/60 bg-[#3d2818] font-mono text-[10px] text-[#d4a22f]">
          OP
        </div>
        <div>
          <p className="font-sans text-sm font-bold uppercase tracking-wide text-white">Optech</p>
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/80">Computer Institute</p>
        </div>
      </div>

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

  const card: IdCardData = {
    name: api?.name || profile?.user?.name || name || DEMO_STUDENT.name,
    mobile: api?.mobile || profile?.user?.phone || DEMO_STUDENT.phone,
    studentCode: api?.studentCode || profile?.studentCode || studentId || DEMO_STUDENT.id,
    address: api?.address || profile?.address || "Deori, Maharashtra",
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
            <IdCardPreview card={card} />
          </div>

          <button type="button" className={`${btnGhost} mt-5 w-full justify-center`} onClick={downloadPdf}>
            <DownloadSimple size={16} aria-hidden />
            Download PDF
          </button>

          <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600">
            Show this card at campus · QR verification coming soon
          </p>
        </>
      )}
    </div>
  );
}
