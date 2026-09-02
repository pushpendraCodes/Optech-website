"use client";

import { Tx } from "@/components/i18n/Tx";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export function ContactDetails() {
  const site = useSiteSettings();

  const rows = [
    { key: "contact_location" as const, value: site.address },
    { key: "contact_email" as const, value: site.email },
    { key: "contact_phone" as const, value: site.mobile },
    { key: "contact_hours" as const, value: "Mon — Sat: 9:00 AM – 6:00 PM" },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col divide-y divide-white/8 border-t border-white/8 font-mono">
        {rows.map((row) => (
          <div key={row.key} className="flex flex-col gap-2 py-5">
            <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              <Tx k={row.key} />
            </span>
            <span className="font-sans text-[15px] leading-relaxed text-foreground">
              {row.value || "—"}
            </span>
          </div>
        ))}
      </div>

      <div className="card-surface flex flex-col gap-3 p-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
          <Tx k="contact_campus" />
        </span>
        <h2 className="font-sans text-xl font-semibold tracking-tight text-foreground">
          {site.name || "Optech Deori"}
        </h2>
        <p className="font-sans text-sm leading-relaxed text-zinc-400">
          <Tx k="contact_closed" vars={{ rating: "" }} />
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          {site.mobile ? (
            <>
              <a
                href={`tel:${site.mobile.replace(/\s/g, "")}`}
                className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-300 transition-colors hover:text-accent"
              >
                <Tx k="contact_call" />
              </a>
              <span className="text-zinc-600">·</span>
            </>
          ) : null}
          {site.email ? (
            <a
              href={`mailto:${site.email}`}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-300 transition-colors hover:text-accent"
            >
              <Tx k="contact_mail" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
