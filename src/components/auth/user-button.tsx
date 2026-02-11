'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogIn, User, LogOut, FileText, Coins, CreditCard } from 'lucide-react'
import { Paywall } from '@/components/billing/Paywall'

interface UserButtonProps {
  className?: string
}

export function UserButton({ className }: UserButtonProps) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUserAuth()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (isOpen && !target.closest('[data-user-button]')) {
        setIsOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  const checkUserAuth = async () => {
    try {
      const response = await fetch('/api/auth/user')
      if (response.ok) {
        const userData = await response.json()
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

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

  if (loading) {
    return (
      <div className={`h-8 w-8 bg-neutral-200 rounded-full animate-pulse ${className}`} />
    )
  }

  if (!user) {
    return (
      <Link href="/login">
        <Button variant="outline" className="flex items-center gap-2">
          <LogIn className="h-4 w-4" />
          登录
        </Button>
      </Link>
    )
  }

  return (
    <div className={`relative ${className}`} data-user-button>
      <Button
        variant="ghost"
        className="flex items-center gap-2 h-8"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-neutral-100 text-neutral-600 text-sm">
            {user.email.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <User className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg py-2 z-50">
          <div className="px-4 py-2 border-b border-neutral-100">
            <p className="text-sm font-medium text-neutral-900">{user.email}</p>
            {credits !== null && (
              <div className="mt-2">
                <p className="text-xs text-neutral-500 flex items-center gap-1">
                  <Coins className="h-3 w-3" />
                  剩余额度: {credits} 次
                </p>
                <button
                  onClick={() => {
                    setShowPaywall(true)
                    setIsOpen(false)
                  }}
                  className="mt-2 w-full text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded flex items-center justify-center gap-1 transition-colors"
                >
                  <CreditCard className="h-3 w-3" />
                  充值
                </button>
              </div>
            )}
          </div>
          
          <Link href="/drafts" className="block">
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-2 text-sm"
              onClick={() => setIsOpen(false)}
            >
              <FileText className="h-4 w-4 mr-2" />
              My Drafts
            </Button>
          </Link>

          <Button
            variant="ghost"
            className="w-full justify-start px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            登出
          </Button>
        </div>
      )}

      {showPaywall && (
        <Paywall onClose={() => setShowPaywall(false)} />
      )}
    </div>
  )
}