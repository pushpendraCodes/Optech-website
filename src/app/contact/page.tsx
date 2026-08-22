import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { INSTITUTE } from "@/lib/optech";
import { Tx } from "@/components/i18n/Tx";

export const metadata: Metadata = {
  title: "Contact & Enquiry",
  description:
    "Contact Optech Computer Institute Deori. Submit an enquiry for admissions counseling, course details, or campus visit.",
};

const contactRows = [
  { key: "contact_location" as const, value: INSTITUTE.address },
  { key: "contact_email" as const, value: INSTITUTE.email },
  { key: "contact_phone" as const, value: INSTITUTE.phone },
  { key: "contact_hours" as const, value: INSTITUTE.hours },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="contact_eyebrow"
        title="contact_title"
        titleAccent="contact_title_accent"
        description="contact_desc"
      />

      <section className="px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[5fr_4fr] lg:gap-16">
          <EnquiryForm />

          <div className="flex flex-col gap-10">
            <div className="flex flex-col divide-y divide-white/8 border-t border-white/8 font-mono">
              {contactRows.map((row) => (
                <div key={row.key} className="flex flex-col gap-2 py-5">
                  <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                    <Tx k={row.key} />
                  </span>
                  <span className="font-sans text-[15px] leading-relaxed text-foreground">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="card-surface flex flex-col gap-3 p-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
                <Tx k="contact_campus" />
              </span>
              <h2 className="font-sans text-xl font-semibold tracking-tight text-foreground">
                Optech Deori
              </h2>
              <p className="font-sans text-sm leading-relaxed text-zinc-400">
                <Tx k="contact_closed" vars={{ rating: INSTITUTE.rating }} />
              </p>
              <div className="mt-2 flex flex-wrap gap-3">
                <a
                  href={`tel:${INSTITUTE.phone.replace(/\s/g, "")}`}
                  className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-300 transition-colors hover:text-accent"
                >
                  <Tx k="contact_call" />
                </a>
                <span className="text-zinc-600">·</span>
                <a
                  href={`mailto:${INSTITUTE.email}`}
                  className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-300 transition-colors hover:text-accent"
                >
                  <Tx k="contact_mail" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
