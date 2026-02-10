'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Trash2, ExternalLink, Calendar } from 'lucide-react'
import { formatDistanceToNow } from '@/lib/utils'
import type { PageDbModel } from '@/types'

interface DraftCardProps {
  draft: PageDbModel
  onDelete: (id: string) => void
  isDeleting?: boolean
}

export function DraftCard({ draft, onDelete, isDeleting = false }: DraftCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(draft.id)
      setShowDeleteConfirm(false)
    } else {
      setShowDeleteConfirm(true)
    }
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{draft.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Calendar className="h-3 w-3" />
              {formatDistanceToNow(new Date(draft.created_at))}
            </CardDescription>
          </div>
          <Badge variant={draft.status === 'active' ? 'default' : 'secondary'}>
            {draft.status === 'active' ? '已发布' : '草稿'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-neutral-600 line-clamp-2">
          {draft.content.description || draft.content.tagline || '暂无描述'}
        </p>
        {draft.view_count > 0 && (
          <div className="flex items-center gap-1 text-xs text-neutral-500 mt-2">
            <Eye className="h-3 w-3" />
            {draft.view_count} 次浏览
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 gap-2">
        <Link href={`/share/${draft.slug}`} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="flex-1">
            <ExternalLink className="h-4 w-4 mr-2" />
            查看
          </Button>
        </Link>

        {showDeleteConfirm ? (
          <div className="flex gap-1 flex-1">
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              确认
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={cancelDelete}
              disabled={isDeleting}
            >
              取消
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}