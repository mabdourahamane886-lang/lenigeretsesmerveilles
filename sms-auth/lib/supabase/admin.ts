import { createClient } from '@supabase/supabase-js'

export function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !secret || url.includes('YOUR_PROJECT')) return null
  return createClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
