'use client';

import { useContext, createContext, ReactNode } from 'react';
import { messages } from '@/messages';
import { Locale, defaultLocale } from '@/i18n/config';

interface I18nContextValue {
  t: (key: string, params?: Record<string, string | number>) => string;
  locale: Locale;
}

const I18nContext = createContext<I18nContextValue>({
  t: (key: string) => key,
  locale: defaultLocale,
});

/**
 * Get a nested value from an object using dot notation
 */
function getNestedValue(obj: any, path: string): string | undefined {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Replace params in translation string
 * Example: "Hello {name}" + {name: "World"} → "Hello World"
 */
function replaceParams(str: string, params?: Record<string, string | number>): string {
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match;
  });
}

interface TranslationsProviderProps {
  children: ReactNode;
  locale?: Locale;
}

export function TranslationsProvider({ children, locale = defaultLocale }: TranslationsProviderProps) {
  const localeMessages = messages[locale] || messages[defaultLocale];

  const t = (key: string, params?: Record<string, string | number>): string => {
    const value = getNestedValue(localeMessages, key);
    const translation = value !== undefined ? value : key;
    return replaceParams(translation, params);
  };

  const value: I18nContextValue = { t, locale };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Hook to use translations
 * Replacement for useTranslations from next-intl
 */
export function useTranslations(namespace?: string) {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useTranslations must be used within a TranslationsProvider');
  }

  const t = (key: string, params?: Record<string, string | number>): string => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return context.t(fullKey, params);
  };

  return t;
}
