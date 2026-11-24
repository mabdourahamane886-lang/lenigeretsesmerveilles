import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key || url.includes('YOUR_PROJECT')) return null
  const store = await cookies()
  return createServerClient(url, key, {
    cookies: {
      getAll() { return store.getAll() },
      setAll(entries) {
        try {
          entries.forEach(({ name, value, options }) => store.set(name, value, options))
        } catch {
          // Les Server Components ne peuvent pas écrire les cookies;
          // les Route Handlers sont autorisés à le faire.
        }
      },
    },
  })
}
