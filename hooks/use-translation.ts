"use client";

import { useLanguageStore } from "@/lib/language-store";
import { translations } from "@/lib/i18n";

export function useTranslation() {
  const language = useLanguageStore((s) => s.language);
  return translations[language];
}
