"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  CheckCircle,
  Copy,
  CreditCard,
  DownloadSimple,
  EnvelopeSimple,
  IdentificationCard,
  Phone,
  Receipt,
  User,
} from "@phosphor-icons/react";
import { formatInr } from "@/lib/catalog";
import { btnGhost, btnPrimary } from "@/components/ui/ui";

export type PaymentInvoice = {
  paymentId: string;
  invoiceNumber: string;
  date: string;
  payerName: string;
  payerEmail?: string;
  payerPhone?: string;
  course: string;
  fee: number;
  discount: number;
  total: number;
  coupon?: string;
  paymentRef?: string;
  orderId?: string;
  mode?: string;
};

function DetailCard({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof User;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon size={16} className="text-accent" aria-hidden />
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      </div>
      <div className="text-sm text-zinc-200">{children}</div>
    </div>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-white/8 bg-black/20 px-3 py-2.5">
      <div className="min-w-0">
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">{label}</p>
        <p className="mt-0.5 break-all font-mono text-xs text-zinc-300">{value}</p>
      </div>
      <button
        type="button"
        onClick={() => void copy()}
        className="shrink-0 rounded-lg border border-white/10 p-1.5 text-zinc-400 transition hover:border-accent/30 hover:text-accent"
        aria-label={`Copy ${label}`}
      >
        <Copy size={14} />
      </button>
      {copied ? <span className="sr-only">Copied</span> : null}
    </div>
  );
}

export function PaymentReceipt({
  invoice,
  courseTitle,
  referralCode,
  downloading,
  downloadError,
  onDownload,
}: {
  invoice: PaymentInvoice;
  courseTitle: string;
  referralCode?: string;
  downloading: boolean;
  downloadError?: string;
  onDownload: () => void;
}) {
  const hasDiscount = (invoice.discount ?? 0) > 0;
  const savingsPercent = invoice.fee > 0 ? Math.round(((invoice.discount ?? 0) / invoice.fee) * 100) : 0;

  return (
    <section className="relative px-6 pb-24 pt-28 md:px-10 md:pt-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(212,162,47,0.12),transparent_60%)]" />

      <div className="relative mx-auto max-w-2xl">
        {/* Success header */}
        <div className="mb-8 text-center">
          <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
            <span className="absolute inset-0 animate-pulse rounded-full bg-emerald-500/20" />
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/15">
              <CheckCircle size={40} weight="fill" className="text-emerald-400" aria-hidden />
            </span>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">Payment successful</p>
          <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-foreground">Your receipt is ready</h1>
          <p className="mx-auto mt-2 max-w-md font-sans text-sm text-zinc-400">
            Thank you for enrolling. Download the invoice PDF or keep this page for your records.
          </p>
        </div>

        {/* Receipt card */}
        <article className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-[0_32px_100px_rgba(0,0,0,0.45)]">
          {/* Receipt header */}
          <div className="relative border-b border-white/8 bg-gradient-to-br from-[#1f1a14] via-[#141210] to-zinc-950 px-6 py-6 md:px-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Receipt size={18} className="text-accent" aria-hidden />
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">Optech Computer Institute</p>
                </div>
                <h2 className="mt-2 font-sans text-lg font-semibold text-white">Fee receipt & tax invoice</h2>
                <p className="mt-1 font-mono text-xs text-zinc-500">{invoice.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-500/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300">
                  <CheckCircle size={12} weight="fill" aria-hidden />
                  Paid
                </span>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Date</p>
                <p className="font-sans text-sm text-zinc-300">{invoice.date}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-accent/25 bg-accent/10 px-5 py-4 text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent/80">Amount paid</p>
              <p className="mt-1 font-sans text-4xl font-semibold tracking-tight text-accent">{formatInr(invoice.total)}</p>
              {hasDiscount ? (
                <p className="mt-1 text-sm text-emerald-300">
                  You saved {formatInr(invoice.discount)}
                  {savingsPercent > 0 ? ` (${savingsPercent}% off)` : ""}
                </p>
              ) : null}
            </div>
          </div>

          {/* Bill to & payment */}
          <div className="grid gap-3 border-b border-white/8 px-6 py-5 md:grid-cols-2 md:px-8">
            <DetailCard icon={User} label="Bill to">
              <p className="font-medium text-foreground">{invoice.payerName}</p>
              {invoice.payerPhone ? (
                <p className="mt-1 flex items-center gap-2 text-zinc-400">
                  <Phone size={14} aria-hidden />
                  {invoice.payerPhone}
                </p>
              ) : null}
              {invoice.payerEmail ? (
                <p className="mt-1 flex items-center gap-2 text-zinc-400">
                  <EnvelopeSimple size={14} aria-hidden />
                  {invoice.payerEmail}
                </p>
              ) : null}
            </DetailCard>
            <DetailCard icon={CreditCard} label="Payment">
              <p className="capitalize">{invoice.mode || "Razorpay"}</p>
              <p className="mt-1 text-xs text-zinc-500">Online payment · verified</p>
            </DetailCard>
          </div>

          {/* Transaction IDs */}
          {(invoice.orderId || invoice.paymentRef) ? (
            <div className="space-y-2 border-b border-white/8 px-6 py-5 md:px-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Transaction details</p>
              {invoice.orderId ? <CopyRow label="Order ID" value={invoice.orderId} /> : null}
              {invoice.paymentRef ? <CopyRow label="Payment reference" value={invoice.paymentRef} /> : null}
            </div>
          ) : null}

          {/* Line items */}
          <div className="px-6 py-5 md:px-8">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Fee breakdown</p>
            <div className="overflow-hidden rounded-2xl border border-white/8">
              <div className="grid grid-cols-[1fr_auto] gap-4 bg-white/5 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-4 border-t border-white/6 px-4 py-3.5 text-sm">
                <div>
                  <p className="font-medium text-zinc-200">{invoice.course || courseTitle}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">Course enrollment fee</p>
                </div>
                <span className="font-medium">{formatInr(invoice.fee)}</span>
              </div>
              {hasDiscount ? (
                <div className="grid grid-cols-[1fr_auto] gap-4 border-t border-white/6 bg-emerald-500/5 px-4 py-3 text-sm">
                  <div>
                    <p className="text-emerald-200">Discount</p>
                    {invoice.coupon ? (
                      <p className="mt-0.5 font-mono text-[10px] text-emerald-400/80">Coupon · {invoice.coupon}</p>
                    ) : null}
                  </div>
                  <span className="text-emerald-300">− {formatInr(invoice.discount)}</span>
                </div>
              ) : null}
              {referralCode ? (
                <div className="border-t border-white/6 px-4 py-3 text-sm">
                  <p className="text-emerald-300">
                    Referral code <span className="font-mono text-emerald-200">{referralCode}</span> recorded.
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">Referrer benefits will be processed by admin after admission.</p>
                </div>
              ) : null}
              <div className="grid grid-cols-[1fr_auto] gap-4 border-t border-accent/20 bg-accent/10 px-4 py-3.5 text-sm font-semibold">
                <span>Total paid</span>
                <span className="text-accent">{formatInr(invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* What's next */}
          <div className="border-t border-white/8 bg-white/[0.02] px-6 py-5 md:px-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">What happens next</p>
            <ol className="mt-4 space-y-3">
              {[
                { icon: IdentificationCard, text: "Campus staff will verify your payment and admit you to the batch." },
                { icon: EnvelopeSimple, text: "You will receive your student ID and login details after admission." },
                { icon: Receipt, text: "Keep this receipt and invoice PDF for fee records and campus visits." },
              ].map((step, i) => {
                const StepIcon = step.icon;
                return (
                <li key={i} className="flex gap-3 text-sm text-zinc-400">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 font-mono text-[10px] text-accent">
                    {i + 1}
                  </span>
                  <span className="flex gap-2 pt-0.5">
                    <StepIcon size={14} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                    {step.text}
                  </span>
                </li>
              );
              })}
            </ol>
          </div>
        </article>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            className={`${btnPrimary} flex-1 justify-center sm:flex-none`}
            disabled={downloading || !invoice.orderId}
            onClick={onDownload}
          >
            <DownloadSimple size={16} weight="bold" aria-hidden />
            {downloading ? "Preparing PDF…" : "Download invoice PDF"}
          </button>
          <Link href="/courses" className={`${btnGhost} flex-1 justify-center sm:flex-none`}>
            Browse courses
          </Link>
          <Link href="/contact" className={`${btnGhost} flex-1 justify-center sm:flex-none`}>
            Contact admissions
            <ArrowUpRight size={14} weight="bold" aria-hidden />
          </Link>
        </div>
        {downloadError ? (
          <p role="alert" className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {downloadError}
          </p>
        ) : null}
      </div>
    </section>
  );
}
