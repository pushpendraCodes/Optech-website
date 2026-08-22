"use client";

import { useI18n } from "@/components/providers/I18nProvider";
import type { MessageKey } from "@/lib/i18n";

export function Tx({
  k,
  vars,
}: {
  k: MessageKey;
  vars?: Record<string, string | number>;
}) {
  const { t } = useI18n();
  return <>{t(k, vars)}</>;
}
