import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { authConfig, isProtectedRoute, isPublicRoute } from '@/lib/config/navigation'

/**
 * Middleware for authentication and route protection
 * Runs on every request to protected routes
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes (except auth check)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next()
  }

  // Check for session cookie (better-auth uses this cookie name)
  const sessionCookie =
    request.cookies.get('better-auth.session_token') ||
    request.cookies.get('__Secure-better-auth.session_token')

  const isAuthenticated = !!sessionCookie?.value

  // If user is on a protected route and not authenticated, redirect to sign-in
  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const signInUrl = new URL(authConfig.signInRedirect, request.url)
    // Add callback URL so user can be redirected back after login
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (isAuthenticated && (pathname === '/sign-in' || pathname === '/sign-up')) {
    return NextResponse.redirect(new URL(authConfig.afterLoginRedirect, request.url))
  }

  return NextResponse.next()
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
