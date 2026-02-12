import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale, type Locale } from './src/i18n/config';
import { messages } from './src/messages';

export default getRequestConfig(async ({ requestLocale }) => {
  // Validate that the incoming locale parameter is valid
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: messages[locale as Locale],
    timeZone: 'Asia/Shanghai',
  };
});
