export const locales = ['zh-CN', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'zh-CN';

export const localeNames: Record<Locale, string> = {
  'zh-CN': '简体中文',
  'en': 'English',
};

export const localeFlags: Record<Locale, string> = {
  'zh-CN': '🇨🇳',
  'en': '🇺🇸',
};

export const COOKIE_NAME = 'fd-locale';

export const QUERY_PARAM = 'lang';
