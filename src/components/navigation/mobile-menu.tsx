'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useTranslations } from '@/lib/next-intl';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  href: string;
  label: string;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const t = useTranslations();

  const menuItems: MenuItem[] = [
    { href: '/drafts', label: t('nav.myDrafts') },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 animate-in fade-in"
          onClick={onClose}
        >
          {/* Mobile menu content */}
          <div
            className={cn(
              "fixed top-0 right-0 h-full w-72 bg-white shadow-xl transform transition-transform duration-200",
              isOpen ? "translate-x-0" : "translate-x-full"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-100">
              <h2 className="text-lg font-semibold text-neutral-900">Menu</h2>
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Menu items */}
            <nav className="p-4">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 py-3 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg px-4 -mx-4 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
