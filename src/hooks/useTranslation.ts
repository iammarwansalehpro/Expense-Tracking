import { useCallback } from 'react';
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

  const t = useCallback((
    path: TranslationPaths, 
    paramsOrFallback?: string | Record<string, string | number>,
    maybeFallback?: string
  ): string => {
    const keys = path.split('.');
    let current: any = translations;
    
    for (const key of keys) {
      if (current[key] === undefined) {
        return typeof paramsOrFallback === 'string' ? paramsOrFallback : (maybeFallback || path);
      }
      current = current[key];
    }
    
    if (typeof current === 'string' && typeof paramsOrFallback === 'object' && paramsOrFallback !== null) {
      let result = current;
      Object.entries(paramsOrFallback).forEach(([k, v]) => {
        result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
      return result;
    }
    
    return typeof current === 'string' ? current : (maybeFallback || path);
  }, [translations]);

  return { t, language };
}
