'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from '@/lib/next-intl'
import { Button } from '@/components/ui/button'
import { DraftList } from '@/components/drafts/draft-list'
import { Navbar } from '@/components/navigation/navbar'
import { MobileMenu } from '@/components/navigation/mobile-menu'

export default function DraftsPage() {
  const router = useRouter()
  const t = useTranslations()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-white pt-24 pb-8">
      <Navbar />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="max-w-6xl mx-auto px-6">
        <DraftList />
      </div>
    </main>
  )
}
