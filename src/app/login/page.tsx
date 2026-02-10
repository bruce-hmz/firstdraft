'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AuthForm } from '@/components/auth/auth-form'

function LoginPageContent() {
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('error') === 'auth_callback_error') {
      console.error('Authentication callback error')
    }
  }, [searchParams])

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <AuthForm mode="signin" />
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="animate-pulse">Loading...</div>
        </div>
      </main>
    }>
      <LoginPageContent />
    </Suspense>
  )
}