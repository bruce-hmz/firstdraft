'use client'

import { useEffect } from 'react'
import { analytics } from '@/lib/analytics'

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    analytics.init()
  }, [])

  return <>{children}</>
}
