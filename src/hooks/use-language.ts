'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { type Locale, defaultLocale, COOKIE_NAME, QUERY_PARAM } from '@/i18n/config';

function getLocaleFromCookie(): Locale {
  try {
    const cookies = document.cookie;
    const match = cookies.match(new RegExp('(^| )' + COOKIE_NAME + '=([^;]+)'));
    return match ? (match[2] as Locale) : defaultLocale;
  } catch {
    return defaultLocale;
  }
}

export function useLanguage() {
  const router = useRouter();
  const pathname = usePathname();
  // Start with defaultLocale for SSR, sync from cookie in useEffect
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const isHydratedRef = useRef(false);

  // Sync locale from URL param or cookie after hydration to avoid hydration mismatch
  useEffect(() => {
    isHydratedRef.current = true;
    const searchParams = new URLSearchParams(window.location.search);
    const urlLocale = searchParams.get(QUERY_PARAM) as Locale | null;
    const stored = urlLocale && (['zh-CN', 'en'] as const).includes(urlLocale)
      ? urlLocale
      : getLocaleFromCookie();
    if (stored !== locale) {
      setLocaleState(stored);
    }
  }, []);

  const switchLanguage = useCallback(
    (newLocale: Locale) => {
      if (newLocale === locale) return;

      setLocaleState(newLocale);
      document.cookie = `${COOKIE_NAME}=${newLocale};path=/;max-age=31536000`;

      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set('lang', newLocale);
      const newUrl = `${pathname}?${searchParams.toString()}`;

      router.push(newUrl, { scroll: false });
      router.refresh();
    },
    [locale, pathname, router]
  );

  return {
    locale,
    switchLanguage,
  };
}
