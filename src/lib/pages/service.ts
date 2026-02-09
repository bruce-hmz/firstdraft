import { createClient } from '@supabase/supabase-js'
import type { PageDbModel, CreatePageInput, PageContent } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase environment variables not configured')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const PAGE_TABLE = 'pages'

export async function createPage(input: CreatePageInput): Promise<PageDbModel | null> {
  const slug = await generateUniqueSlug()

  const { data, error } = await supabase
    .from(PAGE_TABLE)
    .insert({
      slug,
      title: input.title,
      content: input.content,
      metadata: input.metadata || {},
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create page:', error)
    throw new Error(`Failed to create page: ${error.message}`)
  }

  return data as PageDbModel
}

export async function getPageBySlug(slug: string): Promise<PageDbModel | null> {
  const { data, error } = await supabase
    .from(PAGE_TABLE)
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Failed to get page:', error)
    throw new Error(`Failed to get page: ${error.message}`)
  }

  return data as PageDbModel
}

export async function incrementViewCount(slug: string): Promise<void> {
  const { error } = await supabase.rpc('increment_view_count', { page_slug: slug })

  if (error) {
    console.error('Failed to increment view count:', error)
  }
}

export async function deletePage(id: string): Promise<boolean> {
  const { error } = await supabase
    .from(PAGE_TABLE)
    .update({ status: 'deleted' })
    .eq('id', id)

  if (error) {
    console.error('Failed to delete page:', error)
    throw new Error(`Failed to delete page: ${error.message}`)
  }

  return true
}

export async function generateUniqueSlug(): Promise<string> {
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

export function getShareUrl(slug: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/share/${slug}`
}
