"use client";

import { useMemo, useState } from "react";
import { Certificate, DownloadSimple, Medal } from "@phosphor-icons/react";
import { Tx } from "@/components/i18n/Tx";
import { btnGhost } from "@/components/ui/ui";
import { useGetStudentCertificatesQuery, useLazyGetStudentCertificatePdfQuery } from "@/lib/api";
import { loc } from "@/lib/loc";
import { useStudentAuth } from "@/components/providers/StudentAuth";

type CertItem = {
  id: string;
  enrollmentId: string;
  title: string;
  issued: string;
  certificateNumber: string;
};

function enrollmentIdFrom(row: Record<string, unknown>) {
  const en = row.enrollment;
  if (en && typeof en === "object" && "_id" in (en as object)) {
    return String((en as { _id: unknown })._id);
  }
  return String(en ?? "");
}

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value.slice(0, 10);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function CertificatePreview({ title, name, issued }: { title: string; name: string; issued: string }) {
  return (
    <div className="relative aspect-[842/595] w-full overflow-hidden rounded-xl border border-[#d4af37]/40 bg-[#0a0a0c] shadow-[0_20px_60px_-24px_rgba(212,175,55,0.35)]">
      <div className="absolute inset-3 rounded-lg border border-[#d4af37]/50" />
      <div className="absolute inset-5 rounded-md border border-[#e8c96a]/30" />
      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="mb-3 rounded-sm bg-[#d4af37] px-4 py-1">
          <p className="font-sans text-[8px] font-bold uppercase tracking-[0.2em] text-black sm:text-[9px]">
            Optech Computer Institute
          </p>
        </div>
        <p className="font-serif text-lg font-bold text-white sm:text-xl">Certificate of Completion</p>
        <p className="mt-2 text-[9px] text-zinc-400 sm:text-[10px]">This Certificate Is Proudly Presented To</p>
        <p className="mt-2 font-serif text-base italic text-[#e8c96a] sm:text-lg">{name}</p>
        <p className="mt-3 max-w-[90%] text-[8px] leading-relaxed text-zinc-400 sm:text-[9px]">
          For successfully completing {title}
        </p>
        <p className="mt-2 text-[9px] font-semibold text-[#d4af37] sm:text-[10px]">On {issued}</p>
        <div className="mt-3 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#d4af37] text-[7px] font-bold text-[#d4af37]">
          AWARD
        </div>
      </div>
    </div>
  );
}

export default function CertificatesPage() {
  const { studentId, name } = useStudentAuth();
  const { data, isLoading, isError, refetch } = useGetStudentCertificatesQuery(undefined, { skip: !studentId });
  const [fetchPdf] = useLazyGetStudentCertificatePdfQuery();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const items: CertItem[] = useMemo(() => {
    const rows = data?.data ?? [];
    return rows.map((row) => ({
      id: String(row._id),
      enrollmentId: enrollmentIdFrom(row),
      title: loc((row.course as { title?: unknown } | undefined)?.title as never) || "Course",
      issued: formatDate(row.issuedAt ? String(row.issuedAt) : undefined),
      certificateNumber: String(row.certificateNumber ?? ""),
    }));
  }, [data?.data]);

  const downloadPdf = async (item: CertItem) => {
    if (!item.enrollmentId || item.enrollmentId === "[object Object]") return;
    setDownloadingId(item.enrollmentId);
    try {
      const res = await fetchPdf(item.enrollmentId).unwrap();
      const payload = res.data as { pdf?: string } | undefined;
      const pdf = payload?.pdf ?? "";
      if (!pdf) return;
      const bytes = Uint8Array.from(atob(pdf), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${item.certificateNumber || item.enrollmentId}-certificate.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* handled by RTK session refresh / login redirect */
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
        <Tx k="st_module" />
      </p>
      <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight">Certificates</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Download your course completion certificates issued by the institute.
      </p>

      {isLoading ? (
        <div className="mt-8 h-48 animate-pulse rounded-3xl border border-white/10 bg-white/3" />
      ) : isError ? (
        <div className="card-surface mt-8 p-8 text-center">
          <p className="text-sm text-zinc-400">Could not load certificates.</p>
          <button type="button" className={`${btnGhost} mt-4`} onClick={() => void refetch()}>
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="card-surface mt-8 flex flex-col items-center gap-3 p-10 text-center">
          <Certificate size={36} className="text-zinc-600" aria-hidden />
          <p className="font-sans text-lg font-semibold">No certificates yet</p>
          <p className="max-w-md text-sm text-zinc-400">
            When admin generates a certificate for your completed course, it will appear here for download.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-5">
          {items.map((item) => (
            <li key={item.id} className="card-surface overflow-hidden p-5">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,280px)_1fr] lg:items-center">
                <CertificatePreview title={item.title} name={name || "Student"} issued={item.issued} />
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                        <Medal size={14} aria-hidden />
                        Course certificate
                      </p>
                      <p className="mt-2 font-sans text-xl font-semibold">{item.title}</p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        Issued {item.issued}
                      </p>
                      {item.certificateNumber ? (
                        <p className="mt-1 font-mono text-[10px] text-zinc-600">No. {item.certificateNumber}</p>
                      ) : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`${btnGhost} mt-4`}
                    disabled={downloadingId === item.enrollmentId}
                    onClick={() => void downloadPdf(item)}
                  >
                    <DownloadSimple size={16} aria-hidden />
                    {downloadingId === item.enrollmentId ? "Preparing…" : "Download PDF"}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
