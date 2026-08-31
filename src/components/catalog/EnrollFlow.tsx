"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, WarningCircle } from "@phosphor-icons/react";
import { PaymentReceipt } from "@/components/catalog/PaymentReceipt";
import { formatInr, getCourse } from "@/lib/catalog";
import { PageHero } from "@/components/ui/PageHero";
import { btnGhost, btnPrimary, fieldClass, labelClass } from "@/components/ui/ui";
import {
  useGetCourseQuery,
  useGetPublicConfigQuery,
  useValidateEnrollmentCodeMutation,
  useStartCheckoutMutation,
  useVerifyCheckoutMutation,
} from "@/lib/api";
import { loc } from "@/lib/loc";
import { digitsOnlyPhone, mobilePhoneError } from "@/lib/phone";
import { useStudentAuth } from "@/components/providers/StudentAuth";

type PayState = "idle" | "processing" | "success" | "failed";

type Invoice = {
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

type RazorpayCtor = new (opts: {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
  handler: (res: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  modal: { ondismiss: () => void };
}) => { open: () => void };

function loadRazorpay() {
  return new Promise<boolean>((resolve) => {
    if (typeof window !== "undefined" && (window as { Razorpay?: unknown }).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function EnrollFlow({ slug }: { slug: string }) {
  const fallback = getCourse(slug);
  const { data } = useGetCourseQuery(slug);
  const { data: config } = useGetPublicConfigQuery();
  const apiCourse = data?.data;
  const { name } = useStudentAuth();
  const router = useRouter();
  const search = useSearchParams();
  const [validateCode] = useValidateEnrollmentCodeMutation();
  const [startCheckout] = useStartCheckoutMutation();
  const [verifyCheckout] = useVerifyCheckoutMutation();
  const [batchId, setBatchId] = useState("");
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [appliedReferral, setAppliedReferral] = useState("");
  const [applyMessage, setApplyMessage] = useState("");
  const [applyKind, setApplyKind] = useState<"coupon" | "scholarship" | "referral" | "">("");
  const [pay, setPay] = useState<PayState>("idle");
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [formError, setFormError] = useState("");
  const [phone, setPhone] = useState("");
  const [quote, setQuote] = useState({ fee: apiCourse?.fee ?? fallback?.fee ?? 0, discount: 0, total: apiCourse?.fee ?? fallback?.fee ?? 0 });
  const errorRef = useRef<HTMLDivElement>(null);

  const course = useMemo(() => {
    if (!apiCourse && !fallback) return null;
    return {
      id: apiCourse?._id ?? "",
      slug,
      title: apiCourse ? loc(apiCourse.title) : fallback?.title ?? "",
      fee: apiCourse?.fee ?? fallback?.fee ?? 0,
      batches: (apiCourse?.batches ?? fallback?.batches ?? []).map((batch) => ({
        id: "id" in batch ? batch.id : batch._id,
        label: batch.label,
        timing: batch.timing,
        start: "start" in batch ? String(batch.start ?? "").slice(0, 10) : "",
      })),
    };
  }, [apiCourse, fallback, slug]);

  const selectedBatch = batchId || course?.batches[0]?.id || "";
  const razorpayKey = config?.data?.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
  const urlReferral = search.get("ref")?.trim().toUpperCase() ?? "";

  useEffect(() => {
    if (urlReferral && !coupon) setCoupon(urlReferral);
  }, [urlReferral, coupon]);

  if (!course) {
    return <PageHero eyebrow="enroll_missing" title="enroll_missing" description="enroll_missing_desc" />;
  }

  const applyCode = async () => {
    const code = coupon.trim().toUpperCase();
    if (!course.id) {
      setFormError("Course catalog is offline. Try again in a moment.");
      errorRef.current?.focus();
      return;
    }
    if (!code) {
      setFormError("Enter a scholarship coupon, discount coupon, or referral code.");
      errorRef.current?.focus();
      return;
    }
    const phoneValue = digitsOnlyPhone(phone);
    const email = (document.getElementById("email") as HTMLInputElement | null)?.value.trim() ?? "";
    const phoneErr = mobilePhoneError(phoneValue);
    if (phoneErr) {
      setFormError(phoneErr);
      errorRef.current?.focus();
      return;
    }
    try {
      const body = await validateCode({
        courseId: course.id,
        code,
        phone: phoneValue,
        email: email || undefined,
      }).unwrap();
      const kind = body.data.kind;
      setApplyKind(kind);
      setApplyMessage(body.data.message);
      setFormError("");
      if (kind === "referral") {
        setAppliedReferral(code);
        setAppliedCoupon("");
        setQuote({ fee: body.data.fee, discount: 0, total: body.data.total });
      } else {
        setAppliedCoupon(code);
        setAppliedReferral("");
        setQuote({ fee: body.data.fee, discount: body.data.discount, total: body.data.total });
      }
    } catch (err) {
      const msg = (err as { data?: { message?: string } })?.data?.message;
      setFormError(msg || "Invalid code.");
      setAppliedCoupon("");
      setAppliedReferral("");
      setApplyKind("");
      setApplyMessage("");
      setQuote({ fee: course.fee, discount: 0, total: course.fee });
      errorRef.current?.focus();
    }
  };

  const payNow = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!course.id) {
      setFormError("Online checkout needs a live course record. Contact admissions to enroll on campus.");
      errorRef.current?.focus();
      return;
    }
    const form = new FormData(e.currentTarget);
    const phoneValue = digitsOnlyPhone(String(form.get("phone") ?? ""));
    const payload = {
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      phone: phoneValue,
      courseId: course.id,
      batchId: selectedBatch || undefined,
      coupon: appliedCoupon || undefined,
      parts: 1,
      referralCode: appliedReferral || urlReferral || undefined,
    };
    const phoneErr = mobilePhoneError(payload.phone);
    if (payload.name.length < 2 || !payload.email.includes("@") || phoneErr) {
      setFormError(phoneErr || "Enter a valid name, email, and 10-digit mobile number.");
      errorRef.current?.focus();
      return;
    }
    setPay("processing");
    setFormError("");
    try {
      const started = await startCheckout(payload).unwrap();
      const ready = await loadRazorpay();
      const Razorpay = (window as { Razorpay?: RazorpayCtor }).Razorpay;
      if (!ready || !Razorpay || !razorpayKey) {
        setPay("failed");
        setFormError("Razorpay is not available. Pay at campus or retry in a moment.");
        return;
      }
      const checkout = new Razorpay({
        key: razorpayKey,
        amount: started.data.order.amount,
        currency: started.data.order.currency || "INR",
        order_id: started.data.order.id,
        name: "Optech Computer Institute",
        description: course.title,
        prefill: { name: payload.name, email: payload.email, contact: payload.phone },
        handler: async (res) => {
          try {
            const verified = await verifyCheckout(res).unwrap();
            setInvoice(verified.data as Invoice);
            setPay("success");
          } catch {
            setPay("failed");
          }
        },
        modal: {
          ondismiss: () => setPay("failed"),
        },
      });
      checkout.open();
    } catch (err) {
      setPay("failed");
      setFormError((err as { data?: { message?: string } })?.data?.message || "Checkout could not start.");
    }
  };

  async function downloadInvoice() {
    if (!invoice?.paymentId || !invoice.orderId) return;
    setDownloading(true);
    try {
      const res = await fetch(`${apiBase}/public/enroll/invoice/${invoice.paymentId}?order=${encodeURIComponent(invoice.orderId)}`);
      if (!res.ok) throw new Error("download");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice.invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setFormError("Could not download the invoice. Try again in a moment.");
    } finally {
      setDownloading(false);
    }
  }

  if (pay === "success" && invoice) {
    return (
      <PaymentReceipt
        invoice={invoice}
        courseTitle={course.title}
        referralCode={appliedReferral || urlReferral || undefined}
        downloading={downloading}
        downloadError={formError}
        onDownload={() => void downloadInvoice()}
      />
    );
  }

  return (
    <>
      <PageHero
        eyebrow="enroll_buy_eyebrow"
        title="enroll_buy_title"
        titleAccent="enroll_buy_title_accent"
        description="enroll_buy_desc"
        vars={{ course: course.title }}
      />
      <section className="px-6 py-16 md:px-10 md:py-20">
        <form onSubmit={payNow} className="mx-auto grid max-w-[1400px] gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            {formError ? (
              <div
                ref={errorRef}
                tabIndex={-1}
                role="alert"
                className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4"
              >
                <p className="font-sans text-sm font-semibold">There is a problem</p>
                <p className="mt-1 font-sans text-sm text-zinc-400">{formError}</p>
              </div>
            ) : null}

            <div className="card-surface grid gap-4 p-6">
              <div>
                <label htmlFor="name" className={labelClass}>
                  Full name
                </label>
                <input id="name" name="name" required defaultValue={name ?? ""} className={fieldClass} />
              </div>
              <div>
                <label htmlFor="email" className={labelClass}>
                  Email
                </label>
                <input id="email" name="email" type="email" required className={fieldClass} />
              </div>
              <div>
                <label htmlFor="phone" className={labelClass}>
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(digitsOnlyPhone(e.target.value))}
                  placeholder="10-digit mobile number"
                  className={fieldClass}
                />
                <p className="mt-1 font-sans text-xs text-zinc-500">Enter a 10-digit Indian mobile number (starts with 6–9).</p>
              </div>
            </div>

            {course.batches.length ? (
              <fieldset className="card-surface p-6">
                <legend className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
                  Batch / timing
                </legend>
                <div className="mt-4 space-y-2">
                  {course.batches.map((batch) => (
                    <label
                      key={batch.id}
                      className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/8 p-3 transition-colors duration-200 hover:border-white/15"
                    >
                      <input
                        type="radio"
                        name="batch"
                        checked={selectedBatch === batch.id}
                        onChange={() => setBatchId(batch.id)}
                        className="mt-1 accent-[#d4a22f]"
                      />
                      <span>
                        <span className="block font-sans text-sm font-medium">{batch.label}</span>
                        <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                          {batch.timing} · starts {batch.start}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}

            <div className="card-surface p-6">
              <label htmlFor="coupon" className={labelClass}>
                Coupon / scholarship / referral
              </label>
              <div className="flex gap-2">
                <input
                  id="coupon"
                  value={coupon}
                  onChange={(e) => {
                    setCoupon(e.target.value);
                    setAppliedCoupon("");
                    setAppliedReferral("");
                    setApplyKind("");
                    setApplyMessage("");
                  }}
                  placeholder="Coupon or referral code"
                  autoComplete="off"
                  className={fieldClass}
                />
                <button type="button" className={btnGhost} onClick={() => void applyCode()}>
                  Apply
                </button>
              </div>
              {applyMessage ? (
                <p className={`mt-3 font-sans text-sm ${applyKind === "referral" ? "text-emerald-300" : "text-accent"}`}>
                  {applyMessage}
                </p>
              ) : (
                <p className="mt-3 font-sans text-xs text-zinc-500">
                  Enter a scholarship coupon, discount coupon, or a student referral code. Scholarship coupons must use the same mobile number from your exam.
                </p>
              )}
            </div>
          </div>

          <div className="card-surface flex flex-col gap-5 p-6 md:p-8">
            <h2 className="font-sans text-xl font-semibold">Order summary</h2>
            <dl className="space-y-2 font-sans text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">Course fee</dt>
                <dd>{formatInr(quote.fee || course.fee)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Discount</dt>
                <dd>{formatInr(quote.discount)}</dd>
              </div>
              <div className="flex justify-between border-t border-white/8 pt-3 text-base font-semibold">
                <dt>Payable</dt>
                <dd>{formatInr(quote.total || course.fee)}</dd>
              </div>
            </dl>

            {pay === "failed" ? (
              <div role="alert" className="flex items-start gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                <WarningCircle size={18} className="mt-0.5 text-red-400" />
                <p className="font-sans text-sm text-zinc-300">
                  Payment pending/failed. Retry with UPI, card, or netbanking — or pay cash at campus for admin enrollment.
                </p>
              </div>
            ) : null}

            <button type="submit" disabled={pay === "processing"} className={btnPrimary}>
              {pay === "processing" ? "Talking to Razorpay…" : "Pay with Razorpay"}
              <ArrowUpRight size={14} weight="bold" />
            </button>
            <button
              type="button"
              className="text-left font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500"
              onClick={() => router.push("/contact")}
            >
              Offline cash? Ask admissions to enroll you
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
