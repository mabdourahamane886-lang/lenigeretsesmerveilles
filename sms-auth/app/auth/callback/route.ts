import { NextRequest, NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const code = params.get('code')
  const origin = request.nextUrl.origin
  const next = params.get('next')
  const safePath = next?.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'
  if (code) {
    const client = await getServerClient()
    if (client) {
      const { error } = await client.auth.exchangeCodeForSession(code)
      if (!error) return NextResponse.redirect(origin + safePath)
    }
  }
  return NextResponse.redirect(origin + '/login?error=confirmation')
}
