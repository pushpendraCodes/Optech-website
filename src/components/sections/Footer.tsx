"use client";

import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import { INSTITUTE } from "@/lib/optech";
import { useI18n } from "@/components/providers/I18nProvider";
import type { MessageKey } from "@/lib/i18n";

const navLinks: { key: MessageKey; href: string }[] = [
  { key: "nav_home", href: "/" },
  { key: "nav_about", href: "/about" },
  { key: "nav_courses", href: "/courses" },
  { key: "nav_staff", href: "/staff" },
  { key: "nav_gallery", href: "/gallery" },
  { key: "nav_alumni", href: "/alumni" },
  { key: "nav_jobs", href: "/jobs" },
  { key: "nav_live", href: "/live" },
  { key: "nav_scholarship", href: "/scholarship" },
  { key: "nav_calculator", href: "/calculator" },
  { key: "nav_videos", href: "/videos" },
  { key: "nav_contact", href: "/contact" },
];

export function Footer() {
  const { t } = useI18n();
  return (
    <footer
      id="footer"
      className="border-t border-white/5 bg-background px-6 py-14 md:px-10 md:py-16"
    >
      <div className="mx-auto flex max-w-[1400px] flex-col gap-10">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.32em] text-foreground">
              <span
                aria-hidden
                className="inline-block h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_rgba(212,162,47,0.9)]"
              />
              Optech / Computer Institute
            </div>
            <p className="max-w-[38ch] font-sans text-sm leading-relaxed text-zinc-400">
              &copy; {new Date().getFullYear()} {INSTITUTE.name} of Technology
              &mdash; {INSTITUTE.address}
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-10 gap-y-3 md:grid-cols-3">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="group flex flex-col gap-1">
                <span className="font-sans text-[13px] font-medium text-foreground transition-colors group-hover:text-accent">
                  {t(link.key)}
                  <ArrowUpRight
                    size={11}
                    weight="bold"
                    className="ml-1 inline-block align-baseline opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                  Optech Deori
                </span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/5 pt-6 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500 md:flex-row md:items-center md:justify-between">
          <span>
            Est. {INSTITUTE.established} &nbsp;&middot;&nbsp; {t("footer_iso")}
            &nbsp;&middot;&nbsp; {INSTITUTE.rating} {t("footer_google")}
          </span>
          <span>
            {INSTITUTE.phone} &nbsp;&middot;&nbsp; {INSTITUTE.email}{" "}
            &nbsp;&middot;&nbsp;
            <Link href="/reviews" className="text-zinc-400 transition-colors hover:text-accent">
              {t("review_us")}
            </Link>{" "}
            &nbsp;&middot;&nbsp;
            <Link href="/student/login" className="text-zinc-400 transition-colors hover:text-accent">
              {t("nav_student")}
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
