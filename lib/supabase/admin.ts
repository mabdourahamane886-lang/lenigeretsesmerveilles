import "server-only"

import { createClient } from '@supabase/supabase-js'

/**
 * Client Supabase strictement serveur pour les écritures administrateur.
 * La clé secrète/service-role ne doit jamais être importée dans un Client Component.
 */
export function createAdminClient() {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)?.trim()
  const secretKey =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!url || !secretKey) return null

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })
}
