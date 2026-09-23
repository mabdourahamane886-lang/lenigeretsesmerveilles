import { type NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Force UTF-8 for HTML responses so French accents and punctuation
  // are always interpreted correctly by browsers, crawlers and CDNs.
  const accept = request.headers.get('accept') || ''
  if (accept.includes('text/html')) {
    response.headers.set('Content-Type', 'text/html; charset=utf-8')
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
