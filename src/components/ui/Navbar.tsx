"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, List, X } from "@phosphor-icons/react";
import { useI18n } from "@/components/providers/I18nProvider";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function Navbar() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const primary = [
    { href: "/about", label: t("nav_about") },
    { href: "/courses", label: t("nav_courses") },
    { href: "/staff", label: t("nav_staff") },
    { href: "/gallery", label: t("nav_gallery") },
    { href: "/contact", label: t("nav_contact") },
  ];

  const more = [
    { href: "/videos", label: t("nav_videos") },
    { href: "/alumni", label: t("nav_alumni") },
    { href: "/jobs", label: t("nav_jobs") },
    { href: "/scholarship", label: t("nav_scholarship") },
    { href: "/calculator", label: t("nav_calculator") },
    { href: "/typing", label: t("nav_typing") },
    { href: "/notices", label: t("nav_notices") },
    { href: "/links", label: t("nav_links") },
    { href: "/reviews", label: t("review_us") },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`transition-[background-color,backdrop-filter,border-color] duration-300 ${
        scrolled || open
          ? "border-b border-white/10 bg-black/60 backdrop-blur-2xl backdrop-saturate-150"
          : "border-b border-transparent bg-black/35 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-2 md:px-8 md:py-3">
        <BrandLogo href="/" height={48} priority />

        <nav className="hidden items-center gap-6 lg:flex">
          {primary.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-400 transition-colors duration-200 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <div className="group relative">
            <button
              type="button"
              aria-haspopup="true"
              className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-400 transition-colors duration-200 group-hover:text-foreground group-focus-within:text-foreground"
            >
              {t("nav_more")}
            </button>
            <div className="invisible absolute right-0 top-full z-50 pt-3 opacity-0 transition-[opacity,visibility] duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="w-52 rounded-2xl border border-white/10 bg-black/85 p-2 backdrop-blur-xl">
                {more.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-xl px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-300 transition-colors duration-200 hover:bg-white/[0.06] hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <Link
            href="/live"
            className="group relative hidden items-center gap-2 rounded-full border border-red-500/40 bg-gradient-to-r from-red-950/40 via-red-900/25 to-amber-950/30 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-red-200 shadow-[0_0_14px_rgba(239,68,68,0.22)] backdrop-blur-md transition-all duration-200 hover:border-red-400 hover:bg-red-500/20 hover:text-white hover:shadow-[0_0_22px_rgba(239,68,68,0.45)] hover:scale-[1.02] active:scale-[0.98] sm:inline-flex md:px-3.5"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-80" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
            </span>
            <span>{t("nav_live")}</span>
          </Link>

          <div className="hidden sm:block">
            <LanguageSwitcher compact />
          </div>
          <Link
            href="/student/login"
            className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400 transition-colors duration-200 hover:text-foreground md:inline"
          >
            {t("nav_student")}
          </Link>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-foreground backdrop-blur-md transition-all duration-200 hover:bg-white/[0.1] md:px-4"
          >
            {t("nav_enquire")}
            <ArrowUpRight
              size={14}
              weight="bold"
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
          <button
            type="button"
            className="cursor-pointer rounded-full border border-white/12 p-2 text-foreground lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} weight="bold" /> : <List size={18} weight="bold" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-white/8 px-6 py-6 lg:hidden">
          <div className="mb-4">
            <LanguageSwitcher />
          </div>
          <div className="mb-4">
            <Link
              href="/live"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl border border-red-500/40 bg-gradient-to-r from-red-950/40 via-red-900/25 to-amber-950/30 p-3 font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all hover:border-red-400 hover:bg-red-500/20 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-80" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                {t("nav_live")}
              </span>
              <span className="rounded bg-red-500/25 px-2 py-0.5 text-[10px] font-bold text-red-300">
                LIVE
              </span>
            </Link>
          </div>
          <nav className="flex flex-col gap-3">
            {[...primary, ...more, { href: "/student/login", label: t("nav_student") }].map(
              (link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="font-mono text-[12px] uppercase tracking-[0.22em] text-zinc-300"
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
