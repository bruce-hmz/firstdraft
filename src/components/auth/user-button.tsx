'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from '@/lib/next-intl'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogIn, User, LogOut, FileText, Coins, CreditCard, RefreshCw, X, Menu } from 'lucide-react'
import { Paywall } from '@/components/billing/Paywall'

interface UserButtonProps {
  className?: string
}

export function UserButton({ className }: UserButtonProps) {
  const t = useTranslations()
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkUserAuth()
    window.addEventListener('focus', handleFocus)
    window.addEventListener('click', handleClickOutside)
    return () => window.removeEventListener('focus', handleFocus)
    return () => window.removeEventListener('click', handleClickOutside)
  }, [])

  const handleFocus = () => {
    if (user) {
      document.documentElement.classList.add('user-menu-open')
    }
  }

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Element
    if (isOpen && !target.closest('[data-user-button]')) {
      setIsOpen(false)
      document.documentElement.classList.remove('user-menu-open')
    }
  }

  const checkUserAuth = async () => {
    try {
      const response = await fetch('/api/auth/user')
      if (!response.ok) return
      const userData = await response.json()
      if (userData.data?.email) {
        setUser(userData.data)

        const billingRes = await fetch('/api/billing/status')
        if (billingRes.ok) {
          const billingData = await billingRes.json()
          setCredits(billingData.remainingCredits)
        }
      }
    } catch (error) {
      console.error('Failed to check user auth:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshCredits = async () => {
    setCredits(null)
    await checkUserAuth()
  }

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      setUser(null)
      setCredits(null)
      router.push('/')
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

  const isDraftsPage = pathname === '/drafts'

  return (
    <div className={`relative ${className}`} data-user-button>
      <Button
        variant="ghost"
        className="flex items-center gap-2 h-8 sm:h-9"
        onClick={() => {
          setIsOpen(!isOpen)
          if (isMobileMenuOpen) setIsMobileMenuOpen(false)
        }}
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-neutral-100 text-neutral-600 text-sm">
            {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
          </AvatarFallback>
        </Avatar>
        <User className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className={`absolute right-0 top-full mt-2 sm:mt-3 w-48 sm:w-56 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 ${isMobileMenuOpen ? 'sm:hidden' : ''}`}>
          <div className="px-4 py-3 border-b border-neutral-100">
            <p className="text-sm font-medium text-neutral-900 truncate">{user?.email}</p>
            
            {credits !== null && (
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-neutral-500 flex items-center gap-1">
                    <Coins className="h-3 w-3 flex-shrink-0" />
                    <span className="whitespace-nowrap">{t('admin.remainingCredits')}: {credits} {t('common.times')}</span>
                  </p>
                  <button
                    onClick={refreshCredits}
                    className="p-0.5 hover:bg-neutral-100 rounded flex-shrink-0"
                    title={t('common.refresh')}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
            
            {credits !== null && (
              <button
                onClick={() => {
                  setShowPaywall(true)
                  setIsOpen(false)
                }}
                className="mt-3 w-full text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded flex items-center justify-center gap-1 transition-colors"
              >
                <CreditCard className="h-3 w-3" />
                {t('billing.getCredits')}
              </button>
            )}
          </div>

          <nav className="py-2">
            <Link
              href="/drafts"
              className="flex items-center gap-3 px-3 py-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <FileText className="h-4 w-4" />
              <span className="font-medium">{t('nav.myDrafts')}</span>
            </Link>

            <form action="/api/auth/signout" method="post">
              <Button
                variant="ghost"
                className="w-full justify-start px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                type="submit"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t('nav.logout')}
              </Button>
            </form>
          </nav>
        </div>
      )}

      {showPaywall && (
        <Paywall onClose={() => setShowPaywall(false)} />
      )}
    </div>
  )
}
