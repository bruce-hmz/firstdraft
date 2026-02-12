'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from '@/lib/next-intl'
import { DraftCard } from '@/components/drafts/draft-card'
import { EmptyDraftsState } from '@/components/drafts/empty-state'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, ArrowLeft } from 'lucide-react'
import { getUserPages, deletePage } from '@/lib/pages/service'
import type { PageDbModel } from '@/types'

export function DraftList() {
  const t = useTranslations()
  const [drafts, setDrafts] = useState<PageDbModel[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadUserDrafts()
  }, [])

  const loadUserDrafts = async () => {
    try {
      const response = await fetch('/api/pages')
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to load drafts')
      }

      const data = await response.json()
      if (data.success) {
        setDrafts(data.data)
      }
    } catch (error) {
      console.error('Failed to load drafts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (deletingId) return

    try {
      setDeletingId(id)
      
      const response = await fetch(`/api/pages?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete draft')
      }
      
      setDrafts(prev => prev.filter(draft => draft.id !== id))
    } catch (error) {
      console.error('Failed to delete draft:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleNewDraft = () => {
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    )
  }

  if (drafts.length === 0) {
    return <EmptyDraftsState onNewDraft={handleNewDraft} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{t('nav.myDrafts')}</h1>
          <p className="text-neutral-600">
            {t('drafts.emptyDescription')}
          </p>
        </div>
        
        <Button onClick={handleNewDraft} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('drafts.title')}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {drafts.map((draft) => (
          <DraftCard
            key={draft.id}
            draft={draft}
            onDelete={handleDelete}
            isDeleting={deletingId === draft.id}
          />
        ))}
      </div>
    </div>
  )
}