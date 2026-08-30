"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import { STAFF } from "@/lib/optech";
import { useI18n } from "@/components/providers/I18nProvider";
import { TiltStaffCard, type StaffMember } from "./TiltStaffCard";
import { useGetStaffQuery } from "@/lib/api";

// Smile-shaped curve: middle pair sits highest/flattest, each step outward
// drops lower and rotates more. No horizontal overlap — cards sit in a normal
// flex row with gaps, so every photo stays fully visible.
const ARC = [
  { rotate: -22, y: "34%" },
  { rotate: -13, y: "14%" },
  { rotate: -4, y: "3%" },
  { rotate: 4, y: "3%" },
  { rotate: 13, y: "14%" },
  { rotate: 22, y: "34%" },
] as const;

export function StaffView() {
  const { t } = useI18n();
  const { data } = useGetStaffQuery();
  const members: StaffMember[] = data?.data?.length
    ? data.data.map((member) => ({
        name: member.name,
        role: member.role ?? "",
        focus: member.focus ?? "",
        bio: member.bio ?? "",
        photo: member.photo?.url ?? "",
        linkedin: member.linkedin ?? "",
        twitter: member.twitter ?? "",
        website: member.website ?? "",
      }))
    : STAFF.map((member) => ({ ...member }));
  const featured = members.filter((m) => m.photo).slice(0, 6);

  return (
    <>
      <section className="relative overflow-hidden px-6 pb-6 pt-36 md:px-10 md:pb-10 md:pt-44">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 top-1/3"
          style={{
            background:
              "radial-gradient(46% 58% at 50% 82%, rgba(168,85,247,0.30) 0%, rgba(236,72,153,0.20) 26%, rgba(96,114,255,0.10) 50%, transparent 74%)",
          }}
        />

        <div className="relative mx-auto max-w-[860px] text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
            {t("staff_eyebrow")}
          </p>
          <h1 className="mt-4 font-sans text-5xl font-semibold tracking-tighter text-foreground md:text-7xl">
            {t("staff_meet")}
          </h1>
          <p className="mx-auto mt-5 max-w-[46ch] font-sans text-base leading-relaxed text-zinc-400 md:text-lg">
            {t("staff_desc")}
          </p>
        </div>

        <div className="relative mx-auto mt-12 max-w-[1100px] md:mt-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-[10%] bottom-0 h-32 rounded-[999px] blur-3xl"
            style={{
              background:
                "radial-gradient(60% 100% at 50% 60%, rgba(168,85,247,0.30) 0%, rgba(236,72,153,0.18) 34%, transparent 74%)",
            }}
          />

          <div className="relative flex flex-nowrap items-start justify-center gap-1.5 px-1 pb-12 sm:gap-2.5 sm:pb-16 md:gap-3 md:pb-20 lg:gap-4">
            {featured.map((member, i) => {
              const pose = ARC[i];
              if (!pose) return null;
              return (
                <div
                  key={member.name}
                  className="w-[40px] flex-none sm:w-[70px] md:w-[96px] lg:w-[128px]"
                  style={{
                    transform: `rotate(${pose.rotate}deg) translateY(${pose.y})`,
                  }}
                >
                  <div className="overflow-hidden rounded-[14px] border border-white/10 bg-zinc-900 shadow-[0_16px_32px_-14px_rgba(0,0,0,0.85)] transition-transform duration-300 hover:-translate-y-1 sm:rounded-[18px] md:rounded-[22px]">
                    <Image
                      src={member.photo}
                      alt=""
                      width={380}
                      height={480}
                      className="aspect-[4/5] h-auto w-full object-cover"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto mb-14 max-w-[640px] text-center">
          <h2 className="font-sans text-4xl font-semibold tracking-tighter text-foreground md:text-5xl">
            {t("staff_team")}
          </h2>
          <p className="mt-4 font-sans text-sm leading-relaxed text-zinc-400 md:text-base">
            {t("staff_desc")}
          </p>
        </div>

        <div className="mx-auto grid max-w-[1400px] gap-x-7 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((member) => (
            <TiltStaffCard key={member.name} member={member} />
          ))}
        </div>
      </section>

      <section className="border-t border-white/5 px-6 py-16 md:px-10 md:py-20">
        <div className="card-surface mx-auto flex max-w-[1400px] flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-10">
          <div className="max-w-xl">
            <h2 className="font-sans text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {t("staff_cta_title")}
            </h2>
            <p className="mt-3 font-sans text-sm leading-relaxed text-zinc-400 md:text-base">
              {t("staff_cta_body")}
            </p>
          </div>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 self-start rounded-full border border-accent/40 bg-accent/15 px-5 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-accent transition-all duration-200 hover:bg-accent/25"
          >
            {t("staff_cta")}
            <ArrowUpRight size={14} weight="bold" />
          </Link>
        </div>
      </section>
    </>
  );
}