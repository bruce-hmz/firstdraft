import { type Locale } from '@/i18n/config';
import zhCN from './zh-CN.json';
import en from './en.json';

export const messages = {
  'zh-CN': zhCN,
  en: en,
} as Record<Locale, typeof zhCN | typeof en>;
