import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

let cachedConfig: { url: string; anonKey: string } | null = null
let lastFetchTime = 0
const CACHE_TTL = 60000

async function getSupabaseConfig() {
  const now = Date.now()
  
  if (cachedConfig && (now - lastFetchTime) < CACHE_TTL) {
    return cachedConfig
  }

  try {
    const [urlConfig, keyConfig] = await Promise.all([
      prisma.adminConfig.findUnique({ where: { key: 'SUPABASE_URL' } }),
      prisma.adminConfig.findUnique({ where: { key: 'SUPABASE_ANON_KEY' } }),
    ])

    if (urlConfig?.value && keyConfig?.value) {
      cachedConfig = {
        url: urlConfig.value,
        anonKey: keyConfig.value,
      }
      lastFetchTime = now
      return cachedConfig
    }
  } catch (error) {
    console.error('Failed to fetch Supabase config from database:', error)
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }
  }

  throw new Error(
    'Supabase configuration not found. Please configure it in the admin panel or set environment variables.'
  )
}

export async function createClient() {
  const cookieStore = await cookies()
  const config = await getSupabaseConfig()

  return createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options)
        })
      },
    },
  })
}

export async function isSupabaseConfigured() {
  try {
    const config = await getSupabaseConfig()
    return !!config.url && !!config.anonKey
  } catch {
    return false
  }
}
