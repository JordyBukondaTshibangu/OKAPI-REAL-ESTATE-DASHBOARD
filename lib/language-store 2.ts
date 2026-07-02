import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Language } from "./i18n";

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: "english",
      setLanguage: (language) => set({ language }),
    }),
    { name: "okapi-language" },
  ),
);
