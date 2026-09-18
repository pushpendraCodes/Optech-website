"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import { EyebrowBadge } from "@/components/ui/EyebrowBadge";
import { AnimatedItem, AnimatedSection } from "@/components/ui/AnimatedSection";
import { useI18n } from "@/components/providers/I18nProvider";
import { StaffPhoneShowcase } from "@/components/staff/StaffPhoneShowcase";
import { useGetStaffQuery } from "@/lib/api";

export function HomeStaff() {
  const { t } = useI18n();
  const { data, isLoading } = useGetStaffQuery();
  const members = useMemo(
    () =>
      (data?.data ?? []).map((member) => ({
        id: member._id,
        name: member.name,
        role: member.role ?? "",
        focus: member.focus ?? "",
        bio: member.bio ?? "",
        photo: member.photo?.url ?? "",
        linkedin: member.linkedin ?? "",
        twitter: member.twitter ?? "",
        website: member.website ?? "",
      })),
    [data],
  );

  if (!isLoading && members.length === 0) return null;

  return (
    <section
      id="staff"
      className="relative overflow-hidden border-t border-white/5 bg-background px-6 py-24 md:px-10 md:py-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/3 h-[55%] opacity-70"
        style={{
          background:
            "radial-gradient(42% 60% at 50% 55%, rgba(212,162,47,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1400px]">
        <AnimatedSection className="mb-12 flex max-w-[42rem] flex-col gap-5 md:mb-16">
          <AnimatedItem>
            <EyebrowBadge>{t("staff_eyebrow")}</EyebrowBadge>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-sans text-4xl font-semibold leading-[0.98] tracking-tighter text-foreground md:text-5xl">
              {t("staff_title")}{" "}
              <span className="text-accent">{t("staff_title_accent")}</span>
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-base leading-relaxed text-zinc-400 md:text-lg">
              {t("staff_desc")}
            </p>
          </AnimatedItem>
        </AnimatedSection>

        {isLoading ? (
          <div className="mx-auto h-[420px] max-w-[1100px] animate-pulse rounded-[28px] bg-white/[0.04]" />
        ) : (
          <StaffPhoneShowcase members={members} />
        )}

        <div className="mt-10 flex justify-center md:mt-12">
          <Link
            href="/staff"
            className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-foreground transition-all duration-200 hover:bg-white/[0.08]"
          >
            {t("staff_team")}
            <ArrowUpRight
              size={14}
              weight="bold"
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
