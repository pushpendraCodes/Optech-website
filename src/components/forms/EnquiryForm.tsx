"use client";

import { FormEvent, useState } from "react";
import { ArrowUpRight, CheckCircle } from "@phosphor-icons/react";
import { useI18n } from "@/components/providers/I18nProvider";
import { useGetCoursesQuery, useSubmitEnquiryMutation } from "@/lib/api";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { loc } from "@/lib/loc";
import { fieldClass, labelClass, selectClass } from "@/components/ui/ui";

export function EnquiryForm() {
  const { t } = useI18n();
  const site = useSiteSettings();
  const { data: coursesData } = useGetCoursesQuery();
  const courses = coursesData?.data ?? [];
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitEnquiry, { isLoading }] = useSubmitEnquiryMutation();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const course = String(data.get("course") || "").trim();
    const message = String(data.get("message") || "").trim();

    try {
      await submitEnquiry({ name, email, phone, course, message: message || undefined }).unwrap();
      setSubmitted(true);
      form.reset();
    } catch (err) {
      const messageText =
        err && typeof err === "object" && "data" in err
          ? String((err as { data?: { message?: string } }).data?.message || "")
          : "";
      setError(messageText || t("form_error"));
    }
  };

  if (submitted) {
    return (
      <div className="card-surface flex flex-col items-start gap-4 p-8 md:p-10">
        <CheckCircle size={36} weight="fill" className="text-accent" />
        <h3 className="font-sans text-2xl font-semibold tracking-tight text-foreground">
          {t("form_thanks")}
        </h3>
        <p className="max-w-[40ch] font-sans text-sm leading-relaxed text-zinc-400">
          {t("form_thanks_saved", { email: site.email || "—", phone: site.mobile || "—" })}
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-accent transition-opacity hover:opacity-80"
        >
          {t("form_again")}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="card-surface flex flex-col gap-5 p-6 md:p-8"
      noValidate={false}
    >
      <div>
        <h3 className="font-sans text-xl font-semibold tracking-tight text-foreground">
          {t("form_title")}
        </h3>
        <p className="mt-2 font-sans text-sm text-zinc-400">
          {t("form_lead")}
        </p>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-sans text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            {t("form_name")}
          </label>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            placeholder={t("form_ph_name")}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            {t("form_phone")}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            placeholder={t("form_ph_phone")}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          {t("form_email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={t("form_ph_email")}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="course" className={labelClass}>
          {t("form_course")}
        </label>
        <select
          id="course"
          name="course"
          required={courses.length > 0}
          defaultValue=""
          className={selectClass}
          disabled={courses.length === 0}
        >
          <option value="" disabled>
            {courses.length ? t("form_select") : t("courses_none")}
          </option>
          {courses.map((course) => {
            const title = loc(course.title);
            return (
              <option key={course._id} value={title}>
                {title}
              </option>
            );
          })}
        </select>
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          {t("form_message")}
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          maxLength={500}
          placeholder={t("form_ph_msg")}
          className={`${fieldClass} resize-y`}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="group inline-flex items-center justify-center gap-2 self-start rounded-full border border-accent/40 bg-accent/15 px-6 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-accent transition-all duration-200 hover:bg-accent/25 disabled:opacity-60"
      >
        {isLoading ? t("form_sending") : t("form_submit")}
        <ArrowUpRight
          size={14}
          weight="bold"
          className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </button>
    </form>
  );
}
