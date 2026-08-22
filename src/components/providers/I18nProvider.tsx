"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  interpolate,
  LOCALE_KEY,
  LOCALES,
  MESSAGES,
  type Locale,
  type MessageKey,
} from "@/lib/i18n";

type Vars = Record<string, string | number>;

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, vars?: Vars) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(LOCALE_KEY) as Locale | null;
    if (stored && stored in MESSAGES) setLocaleState(stored);
  }, []);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(LOCALE_KEY, next);
    document.documentElement.lang = next === "en" ? "en" : next;
  };

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, vars) =>
        interpolate(MESSAGES[locale][key] ?? MESSAGES.en[key] ?? key, vars),
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return {
      locale: "en" as Locale,
      setLocale: () => undefined,
      t: (key: MessageKey, vars?: Vars) =>
        interpolate(MESSAGES.en[key] ?? key, vars),
    };
  }
  return ctx;
}

export { LOCALES };
