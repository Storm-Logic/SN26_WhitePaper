"use client";

import { useEffect } from "react";
import i18n, { LANGUAGES } from "@/i18n";

const SUPPORTED = LANGUAGES.map((l) => l.code);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Apply saved / browser language only after hydration to avoid SSR mismatch
    const saved = localStorage.getItem("i18nextLng");
    const browserLang = navigator.language.split("-")[0];
    const lang = saved ?? browserLang;
    const resolved = SUPPORTED.find((l) => l === lang) ?? "en";
    if (resolved !== i18n.language) {
      i18n.changeLanguage(resolved);
    }
  }, []);

  return <>{children}</>;
}
