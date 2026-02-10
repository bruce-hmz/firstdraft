import { createClient } from '@/lib/supabase/server'
import { NextResponse, NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip public API routes
  const publicApiRoutes = ['/api/billing/plans', '/api/generate/questions']
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next({
      request: { headers: request.headers },
    })
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
    return NextResponse.redirect(loginUrl)
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/drafts', request.url))
  }

  return NextResponse.next({
    request: { headers: request.headers },
  })
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}