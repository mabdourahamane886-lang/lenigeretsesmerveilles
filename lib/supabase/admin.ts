import "server-only"

import { createClient } from '@supabase/supabase-js'

function isServiceRoleKey(key: string) {
  try {
    const payload = key.split('.')[1]
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))).role === 'service_role'
  } catch {
    return false
  }
}

/**
 * Client Supabase strictement serveur pour les écritures administrateur.
 * La clé secrète/service-role ne doit jamais être importée dans un Client Component.
 */
export function createAdminClient() {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)?.trim()
  const configuredSecret = process.env.SUPABASE_SECRET_KEY?.trim() ?? ''
  const legacyKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? ''

  // Une clé publique configurée par erreur ne doit pas masquer une clé serveur.
  const secretKey = configuredSecret.startsWith('sb_secret_')
    ? configuredSecret
    : [legacyKey, configuredSecret].find(isServiceRoleKey)

  if (!url || !secretKey) return null

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })
}
