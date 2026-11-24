import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const requestedNext = request.nextUrl.searchParams.get('next') || '/application/profil'
  const safeNext = requestedNext.startsWith('/application/') && !requestedNext.startsWith('//') && !requestedNext.includes('\\')
    ? requestedNext : '/application/profil'
  const target = new URL(safeNext, request.url)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  const code = request.nextUrl.searchParams.get('code')

  if (!url || !key || !code) {
    const failed = new URL('/application/compte', request.url)
    failed.searchParams.set('error', 'Lien de vérification manquant ou expiré.')
    return NextResponse.redirect(failed)
  }

  const response = NextResponse.redirect(target)
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookies) {
        cookies.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    const failed = new URL('/application/compte', request.url)
    failed.searchParams.set('error', 'Lien invalide ou expiré. Redemandez une confirmation.')
    return NextResponse.redirect(failed)
  }
  return response
}
