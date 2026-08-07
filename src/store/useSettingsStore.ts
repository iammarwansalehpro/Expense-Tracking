import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'th' | 'en';

interface SettingsState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'th',
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'paysave-settings',
    }
  )
);
