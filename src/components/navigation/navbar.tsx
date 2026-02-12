'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { UserButton } from '@/components/auth/user-button';
import { LanguageSwitcher } from '@/components/language/language-switcher';

interface NavbarProps {
  showBackButton?: boolean;
  onBack?: () => void;
}

const ADMIN_EMAIL = '123387447@qq.com';

export function Navbar({ showBackButton = false, onBack }: NavbarProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/auth/user');
      if (!response.ok) return;
      const data = await response.json();
      if (data.data?.email === ADMIN_EMAIL) {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Failed to check admin status:', error);
    }
  };

  return (
    <nav className="w-full px-4 sm:px-6 py-4 flex justify-between items-center border-b border-neutral-100">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-neutral-900" />
          <span className="text-xl font-bold text-neutral-900">FirstDraft</span>
        </Link>
        {showBackButton && onBack && (
          <button
            onClick={onBack}
            className="text-neutral-600 hover:text-neutral-900 sm:hidden"
          >
            ←
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        {isAdmin && pathname !== '/admin' && (
          <Link
            href="/admin"
            className="text-neutral-600 hover:text-neutral-900 hidden sm:block"
          >
            Admin
          </Link>
        )}
        <LanguageSwitcher />
        <UserButton />
      </div>
    </nav>
  );
}
