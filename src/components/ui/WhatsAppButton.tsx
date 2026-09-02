"use client";

import { WhatsappLogo } from "@phosphor-icons/react";
import { useI18n } from "@/components/providers/I18nProvider";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export function WhatsAppButton() {
  const { t } = useI18n();
  const site = useSiteSettings();

  if (!site.whatsapp) return null;

  const href = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(t("whatsapp_msg"))}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("whatsapp_label")}
      className="group fixed bottom-5 right-5 z-[60] flex items-center md:bottom-8 md:right-8"
    >
      <span className="pointer-events-none mr-3 hidden translate-x-2 rounded-full border border-white/10 bg-black/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground opacity-0 backdrop-blur-md transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 md:inline-block">
        {t("whatsapp_hint")}
      </span>
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_40px_-8px_rgba(37,211,102,0.7)] transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
        <span
          aria-hidden
          className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/opacity-25"
        />
        <WhatsappLogo size={28} weight="fill" className="relative" />
      </span>
    </a>
  );
}
