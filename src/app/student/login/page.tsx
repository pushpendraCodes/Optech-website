"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useStudentAuth } from "@/components/providers/StudentAuth";
import { btnPrimary, fieldClass, labelClass } from "@/components/ui/ui";
import { useI18n } from "@/components/providers/I18nProvider";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";

export default function StudentLoginPage() {
  const { t } = useI18n();
  const { ready, studentId, login } = useStudentAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ready && studentId) router.replace("/student/dashboard");
  }, [ready, studentId, router]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const err = await login(String(data.get("id") ?? ""), String(data.get("password") ?? ""));
    if (err) {
      setError(err);
      errorRef.current?.focus();
      return;
    }
    router.push("/student/dashboard");
  };

  return (
    <div className="flex min-h-dvh items-center justify-center px-6 py-16">
      <form onSubmit={onSubmit} className="card-surface w-full max-w-md p-6 md:p-8">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/" className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
            {t("login_back")}
          </Link>
          <LanguageSwitcher compact />
        </div>
        <h1 className="mt-4 font-sans text-3xl font-semibold tracking-tight">
          {t("login_title")}
        </h1>
        <p className="mt-2 font-sans text-sm text-zinc-400">
          {t("login_lead")}
        </p>

        {error ? (
          <div
            ref={errorRef}
            tabIndex={-1}
            role="alert"
            className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4"
          >
            <p className="font-sans text-sm font-semibold">{t("login_error")}</p>
            <p className="mt-1 font-sans text-sm text-zinc-400">{error}</p>
          </div>
        ) : null}

        <div className="mt-6">
          <label htmlFor="id" className={labelClass}>
            {t("login_id")}
          </label>
          <input
            id="id"
            name="id"
            autoComplete="username"
            required
            className={fieldClass}
          />
        </div>
        <div className="mt-4">
          <label htmlFor="password" className={labelClass}>
            {t("login_password")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={fieldClass}
          />
        </div>
        <button type="submit" className={`${btnPrimary} mt-6 w-full`}>
          {t("login_enter")}
        </button>
      </form>
    </div>
  );
}
