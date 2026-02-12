import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { TranslationsProvider } from '@/lib/use-translations';
import { COOKIE_NAME, defaultLocale, locales, type Locale } from '@/i18n/config';
import { cookies } from 'next/headers';
import "./globals.css";

// 强制动态渲染，改善水合问题
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "FirstDraft - 把一个模糊的想法，变成真实存在的第一稿",
  description: "Turn your first idea into something real. AI驱动的产品页面生成器，几分钟内生成可分享的产品页面。",
};

/**
 * Get locale from cookie or fallback to default
 */
async function getLocaleFromCookie(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get(COOKIE_NAME);
    if (localeCookie && locales.includes(localeCookie.value as Locale)) {
      return localeCookie.value as Locale;
    }
  } catch (error) {
    // Cookies might not be available in all contexts
  }
  return defaultLocale;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get locale from cookie or use default
  const locale = await getLocaleFromCookie();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <TranslationsProvider locale={locale}>
          {children}
        </TranslationsProvider>
      </body>
    </html>
  );
}
