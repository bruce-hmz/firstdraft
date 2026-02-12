import { createClient } from '@/lib/supabase/server'
import { NextResponse, NextRequest } from 'next/server'
import { COOKIE_NAME, QUERY_PARAM, locales, type Locale, defaultLocale } from '@/i18n/config'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Language detection
  let locale: Locale = defaultLocale
  const queryLocale = request.nextUrl.searchParams.get(QUERY_PARAM)

  // Priority: Query param > Cookie > Default
  if (queryLocale && locales.includes(queryLocale as Locale)) {
    locale = queryLocale as Locale
  } else {
    const cookieLocale = request.cookies.get(COOKIE_NAME)?.value
    if (cookieLocale && locales.includes(cookieLocale as Locale)) {
      locale = cookieLocale as Locale
    }
  }

  // Create response with locale cookie
  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  // Set locale cookie if not already set or different
  if (!request.cookies.get(COOKIE_NAME) || request.cookies.get(COOKIE_NAME)?.value !== locale) {
    response.cookies.set(COOKIE_NAME, locale, {
      maxAge: 31536000, // 1 year
      path: '/',
      sameSite: 'lax',
    })
  }

  // Skip public API routes
  const publicApiRoutes = ['/api/billing/plans', '/api/generate/questions']
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return response
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const protectedRoutes = ['/drafts']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.includes(pathname)

  if (!user && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    loginUrl.searchParams.set(QUERY_PARAM, locale)
    return NextResponse.redirect(loginUrl)
  }

  if (user && isAuthRoute) {
    const draftsUrl = new URL('/drafts', request.url)
    draftsUrl.searchParams.set(QUERY_PARAM, locale)
    return NextResponse.redirect(draftsUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}