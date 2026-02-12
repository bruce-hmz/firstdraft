'use client'

import { Suspense } from 'react'
import { useTranslations } from '@/lib/next-intl'
import { AuthForm } from '@/components/auth/auth-form'

function SignupPageContent() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <AuthForm mode="signup" />
      </div>
    </main>
  )
}

export default function SignupPage() {
  const t = useTranslations()

  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="animate-pulse">{t('common.loading')}</div>
        </div>
      </main>
    }>
      <SignupPageContent />
    </Suspense>
  )
}