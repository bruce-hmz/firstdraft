'use client';

import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { localeNames, localeFlags, type Locale } from '@/i18n/config';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { locale, switchLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLocaleName = localeNames[locale as Locale];
  const currentLocaleFlag = localeFlags[locale as Locale];

  const handleLanguageChange = (newLocale: Locale) => {
    switchLanguage(newLocale);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <span className="text-lg">{currentLocaleFlag}</span>
        <span className="hidden sm:inline">{currentLocaleName}</span>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 z-50 min-w-[140px]">
          {Object.entries(localeNames).map(([code, name]) => {
            const isSelected = code === locale;
            return (
              <button
                key={code}
                onClick={() => handleLanguageChange(code as Locale)}
                className={`w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-neutral-50 transition-colors ${
                  isSelected ? 'bg-neutral-100 font-medium' : ''
                }`}
              >
                <span className="text-lg">{localeFlags[code as Locale]}</span>
                <span>{name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
