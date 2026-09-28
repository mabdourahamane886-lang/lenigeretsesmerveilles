import { type NextRequest, NextResponse } from 'next/server'

/**
 * Lightweight request middleware.
 *
 * Authentication for the admin area is intentionally handled by the
 * server-side admin guard. This middleware only forwards requests so that
 * Next.js/Vercel can manage response headers and streaming normally.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
