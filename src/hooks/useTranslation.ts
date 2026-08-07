import { useSettingsStore } from '@/store/useSettingsStore';
import { th } from '@/locales/th';
import { en } from '@/locales/en';

type Path<T> = T extends object
  ? { [K in keyof T]: `${K & string}` | `${K & string}.${Path<T[K]>}` }[keyof T]
  : never;

type TranslationPaths = Path<typeof th>;

export function useTranslation() {
  const language = useSettingsStore((s) => s.language);
  const translations = language === 'en' ? en : th;

  const t = (path: TranslationPaths, fallback?: string): string => {
    const keys = path.split('.');
    let current: any = translations;
    
    for (const key of keys) {
      if (current[key] === undefined) {
        return fallback || path; // Fallback to key if not found
      }
      current = current[key];
    }
    
    return current;
  };

  return { t, language };
}
