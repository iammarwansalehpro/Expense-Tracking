import { create } from 'zustand';

type Theme = 'light' | 'dark';
export type AppFont = 'Noto Sans Thai' | 'Prompt' | 'Sarabun';

interface ThemeState {
  theme: Theme;
  font: AppFont;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setFont: (font: AppFont) => void;
}

function getInitialTheme(): Theme {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('slipsave-theme') as Theme | null;
    if (stored) return stored;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  }
  return 'light';
}

function getInitialFont(): AppFont {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('slipsave-font') as AppFont | null;
    if (stored) return stored;
  }
  return 'Noto Sans Thai';
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),
  font: getInitialFont(),
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('slipsave-theme', next);
      return { theme: next };
    }),
  setTheme: (theme) => {
    localStorage.setItem('slipsave-theme', theme);
    set({ theme });
  },
  setFont: (font) => {
    localStorage.setItem('slipsave-font', font);
    set({ font });
  },
}));
