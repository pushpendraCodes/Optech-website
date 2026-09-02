"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHero } from "@/components/ui/PageHero";
import { INSTALLMENT_RULES, calcPayable, formatInr } from "@/lib/catalog";
import { fieldClass, labelClass, selectClass } from "@/components/ui/ui";
import { useI18n } from "@/components/providers/I18nProvider";
import { useGetCoursesQuery, useQuoteFeeMutation } from "@/lib/api";
import { loc } from "@/lib/loc";

export default function CalculatorPage() {
  const { t } = useI18n();
  const { data } = useGetCoursesQuery();
  const [quoteFee] = useQuoteFeeMutation();
  const catalog = useMemo(
    () =>
      (data?.data ?? []).map((item) => ({
        id: item._id,
        slug: item.slug,
        title: loc(item.title),
        duration: item.duration ?? "",
        fee: item.fee,
      })),
    [data],
  );
  const [slug, setSlug] = useState(catalog[0]?.slug ?? "");
  const [coupon, setCoupon] = useState("");
  const [parts, setParts] = useState(1);
  const [remote, setRemote] = useState<{ fee: number; discount: number; total: number } | null>(null);
  const course = catalog.find((item) => item.slug === slug) ?? catalog[0];
  const local = useMemo(
    () => calcPayable(course?.fee ?? 0, coupon.trim().toUpperCase() || undefined),
    [course, coupon],
  );
  const quote = remote ?? local;
  const installment = Math.ceil(quote.total / parts);
  const dates = Array.from({ length: parts }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() + i);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  });

  useEffect(() => {
    if (catalog[0] && !catalog.some((item) => item.slug === slug)) {
      setSlug(catalog[0].slug);
    }
  }, [catalog, slug]);

  useEffect(() => {
    if (!course?.id) {
      setRemote(null);
      return;
    }
    const timer = window.setTimeout(() => {
      void quoteFee({ courseId: course.id, coupon: coupon.trim() || undefined, parts })
        .unwrap()
        .then((body) => setRemote({ fee: body.data.fee, discount: body.data.discount, total: body.data.total }))
        .catch(() => setRemote(null));
    }, 280);
    return () => window.clearTimeout(timer);
  }, [course?.id, coupon, parts, quoteFee]);

  return (
    <>
      <PageHero
        eyebrow="calc_eyebrow"
        title="calc_title"
        titleAccent="calc_title_accent"
        description="calc_desc"
      />
      <section className="px-6 py-16 md:px-10 md:py-20">
        {catalog.length === 0 ? (
          <div className="card-surface mx-auto max-w-xl p-8 text-center">
            <p className="font-sans text-sm leading-relaxed text-zinc-400">{t("calc_empty")}</p>
          </div>
        ) : (
        <div className="mx-auto grid max-w-[1400px] gap-8 lg:grid-cols-2">
          <div className="card-surface flex flex-col gap-5 p-6 md:p-8">
            <div>
              <label htmlFor="course" className={labelClass}>
                {t("calc_course")}
              </label>
              <select
                id="course"
                value={course?.slug ?? ""}
                onChange={(e) => setSlug(e.target.value)}
                className={selectClass}
              >
                {catalog.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.title} · {item.duration}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="coupon" className={labelClass}>
                {t("calc_coupon")}
              </label>
              <input
                id="coupon"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="SCHOLAR20 / OPTECH10 / REFER500"
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="parts" className={labelClass}>
                {t("calc_parts")}
              </label>
              <select
                id="parts"
                value={parts}
                onChange={(e) => setParts(Number(e.target.value))}
                className={selectClass}
              >
                <option value={1}>{t("calc_full")}</option>
                <option value={INSTALLMENT_RULES.parts} disabled={quote.total < INSTALLMENT_RULES.minFeeForEmi}>
                  {t("calc_parts_n", { n: INSTALLMENT_RULES.parts })}
                </option>
              </select>
            </div>
          </div>
          <div className="card-surface p-6 md:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">{t("calc_estimate")}</p>
            <dl className="mt-5 space-y-3 font-sans text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">{t("calc_base")}</dt>
                <dd>{formatInr(quote.fee)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">{t("enroll_discount")}</dt>
                <dd>{formatInr(quote.discount)}</dd>
              </div>
              <div className="flex justify-between text-lg font-semibold">
                <dt>{t("calc_total")}</dt>
                <dd>{formatInr(quote.total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">{t("calc_per")}</dt>
                <dd>{formatInr(installment)}</dd>
              </div>
            </dl>
            <ul className="mt-6 space-y-2 border-t border-white/8 pt-4">
              {dates.map((date) => (
                <li
                  key={date}
                  className="flex justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-400"
                >
                  <span>{t("calc_due", { date })}</span>
                  <span>{formatInr(installment)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        )}
      </section>
    </>
  );
}
