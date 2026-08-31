"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Cardholder,
  Certificate,
  ChartLine,
  CurrencyInr,
  House,
  IdentificationCard,
  Keyboard,
  LinkSimple,
  List,
  Question,
  SignOut,
  User,
  Users,
  Briefcase,
  VideoCamera,
  X,
} from "@phosphor-icons/react";
import { useStudentAuth } from "@/components/providers/StudentAuth";
import { DEMO_STUDENT, STUDENT_NOTIFICATIONS } from "@/lib/student-data";
import { useI18n } from "@/components/providers/I18nProvider";
import { useGetStudentDashboardQuery } from "@/lib/api";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { StudentPushSetup } from "@/components/student/StudentPushSetup";
import type { MessageKey } from "@/lib/i18n";

const NAV: { href: string; label: MessageKey; icon: typeof House }[] = [
  { href: "/student/dashboard", label: "st_dash", icon: House },
  { href: "/student/profile", label: "st_profile", icon: User },
  { href: "/student/courses", label: "st_courses", icon: BookOpen },
  { href: "/student/live", label: "st_live", icon: VideoCamera },
  { href: "/student/notes", label: "st_notes", icon: Cardholder },
  { href: "/student/quizzes", label: "st_quizzes", icon: Question },
  { href: "/student/typing", label: "st_typing", icon: Keyboard },
  { href: "/student/attendance", label: "st_attendance", icon: ChartLine },
  { href: "/student/fees", label: "st_fees", icon: CurrencyInr },
  { href: "/student/id-card", label: "st_id", icon: IdentificationCard },
  { href: "/student/certificates", label: "st_certs", icon: Certificate },
  { href: "/student/notifications", label: "st_notices", icon: Bell },
  { href: "/student/refer", label: "st_refer", icon: Users },
  { href: "/student/links", label: "st_links", icon: LinkSimple },
  { href: "/student/jobs", label: "st_jobs", icon: Briefcase },
];

export function StudentShell({ children }: { children: React.ReactNode }) {
  const { ready, studentId, name, logout } = useStudentAuth();
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data: dash } = useGetStudentDashboardQuery(undefined, { skip: !studentId });
  const unread = Number(dash?.data?.unread ?? STUDENT_NOTIFICATIONS.filter((n) => n.unread).length);
  const displayName = name || DEMO_STUDENT.name;
  const displayId = studentId || DEMO_STUDENT.id;

  useEffect(() => {
    if (ready && !studentId) router.replace("/student/login");
  }, [ready, studentId, router]);

  if (!ready || !studentId) {
    return (
      <div className="flex min-h-dvh items-center justify-center font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500">
        {t("login_checking")}
      </div>
    );
  }

  return (
    <div className="h-dvh overflow-hidden bg-background">
      <StudentPushSetup active={Boolean(studentId)} />
      {open ? (
        <button
          type="button"
          aria-label={t("st_nav_close")}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/8 bg-black/70 p-4 backdrop-blur-xl transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="mb-6 flex shrink-0 items-center justify-between">
          <Link href="/" className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
            {t("st_brand")}
          </Link>
          <button
            type="button"
            className="cursor-pointer p-1 lg:hidden"
            aria-label={t("st_nav_close")}
            onClick={() => setOpen(false)}
          >
            <X size={16} />
          </button>
        </div>
        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors duration-200 ${
                    active
                      ? "bg-accent/15 text-accent"
                      : "text-zinc-400 hover:bg-white/[0.04] hover:text-foreground"
                  }`}
                >
                  <Icon size={16} aria-hidden />
                  {t(item.label)}
                </Link>
              );
            })}
          </nav>
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="mt-4 flex shrink-0 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-300 transition-colors duration-200 hover:bg-white/[0.04] hover:text-foreground"
        >
          <ArrowLeft size={16} aria-hidden />
          {t("st_back_site")}
        </Link>
      </aside>

      <div className="flex h-dvh min-w-0 flex-col lg:pl-64">
        <header className="z-30 flex shrink-0 items-center justify-between border-b border-white/8 bg-black/50 px-4 py-3 backdrop-blur-xl">
            <button
              type="button"
              className="cursor-pointer rounded-full border border-white/10 p-2 lg:hidden"
              aria-label={t("st_nav_open")}
              onClick={() => setOpen(true)}
            >
              <List size={18} />
            </button>
            <div className="hidden font-sans text-sm text-zinc-400 lg:block">
              {displayName} · {displayId}
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher compact />
              <Link
                href="/"
                aria-label={t("st_back_site")}
                className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 transition-colors duration-200 hover:text-foreground"
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">{t("st_back_site")}</span>
              </Link>
              <Link
                href="/student/notifications"
                className="relative cursor-pointer rounded-full border border-white/10 p-2"
                aria-label={t("st_bell", { n: unread })}
              >
                <Bell size={16} />
                {unread ? (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-accent" />
                ) : null}
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push("/student/login");
                }}
                className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400"
              >
                <SignOut size={14} />
                {t("st_out")}
              </button>
            </div>
          </header>
        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
