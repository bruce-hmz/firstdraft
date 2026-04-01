import { createClient } from '@supabase/supabase-js'
import type { PageDbModel, CreatePageInput, PageContent } from '@/types'

import type { SupabaseClient } from '@supabase/supabase-js'

export type PageServiceErrorCode = 'CONFIG_MISSING' | 'DB_ERROR'

export class PageServiceError extends Error {
  code: PageServiceErrorCode
  cause?: unknown

  constructor(code: PageServiceErrorCode, message: string, cause?: unknown) {
    super(message)
    this.name = 'PageServiceError'
    this.code = code
    this.cause = cause
  }
}

let supabaseInstance: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new PageServiceError(
        'CONFIG_MISSING',
        'Supabase environment variables not configured',
        { supabaseUrlPresent: !!supabaseUrl, supabaseServiceKeyPresent: !!supabaseServiceKey }
      )
    }

    supabaseInstance = createClient(supabaseUrl, supabaseServiceKey)
  }
  return supabaseInstance
}

const PAGE_TABLE = 'pages'

function looksLikeMissingColumnError(error: { code?: string | null; message?: string | null } | null | undefined): boolean {
  const code = error?.code || ''
  const message = (error?.message || '').toLowerCase()
  return code === '42703' || message.includes('column') && message.includes('does not exist')
}

export async function createPage(input: CreatePageInput & { userId?: string; anonymousId?: string }): Promise<PageDbModel | null> {
  const supabase = getSupabase()
  console.log('Creating page with input:', { title: input.title, hasUser: !!input.userId, hasAnonymous: !!input.anonymousId })

  const slug = await generateUniqueSlug()
  console.log('Generated slug:', slug)

  // 简化插入数据，只包含必要字段
  const insertData = {
    slug,
    title: input.title,
    content: input.content,
    metadata: input.metadata || {},
  }

  console.log('Inserting data:', JSON.stringify(insertData, null, 2))

  let { data, error } = await supabase.from(PAGE_TABLE).insert(insertData).select().single()

  if (error) {
    console.error('Failed to create page:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    console.error('Error details:', error.details)
    throw new PageServiceError('DB_ERROR', `Failed to create page: ${error.message} (code: ${error.code})`, error)
  }

  console.log('Page created successfully:', data?.id)
  return data as PageDbModel
}

export async function getPageBySlug(slug: string): Promise<PageDbModel | null> {
  const supabase = getSupabase()
  try {
    const { data, error } = await supabase
      .from(PAGE_TABLE)
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Failed to get page:', error)
      throw new Error(`Failed to get page: ${error.message}`)
    }

    return data as PageDbModel
  } catch (error) {
    console.error('Error in getPageBySlug:', error)
    throw error
  }
}

export async function incrementViewCount(slug: string): Promise<void> {
  const supabase = getSupabase()
  try {
    const { error } = await supabase.rpc('increment_view_count', { page_slug: slug })

    if (error) {
      console.error('Failed to increment view count:', error)
    }
  } catch (error) {
    console.error('Error in incrementViewCount:', error)
  }
}

export async function deletePage(id: string, userId?: string): Promise<boolean> {
  const supabase = getSupabase()
  let query = supabase
    .from(PAGE_TABLE)
    .update({ status: 'deleted' })
    .eq('id', id)

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { error } = await query

  if (error) {
    console.error('Failed to delete page:', error)
    throw new Error(`Failed to delete page: ${error.message}`)
  }

  return true
}

export async function generateUniqueSlug(): Promise<string> {
  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('generate_unique_slug')

  if (error || !data) {
    // Fallback: generate slug manually
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  return data as string
}

export async function getRecentPages(limit = 10): Promise<PageDbModel[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from(PAGE_TABLE)
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to get recent pages:', error)
    throw new Error(`Failed to get recent pages: ${error.message}`)
  }

  return (data || []) as PageDbModel[]
}

export async function getUserPages(userId: string, options: { limit?: number; offset?: number } = {}): Promise<PageDbModel[]> {
  const { limit = 20, offset = 0 } = options
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from(PAGE_TABLE)
    .select('*')
    .eq('user_id', userId)
    .neq('status', 'deleted')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Failed to get user pages:', error)
    throw new Error(`Failed to get user pages: ${error.message}`)
  }

  return (data || []) as PageDbModel[]
}

export function getShareUrl(slug: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/share/${slug}`
}
