import { NextRequest } from 'next/server'
import { getServerClient } from './supabase/server'
import { getAdminClient } from './supabase/admin'
import { sha256 } from './security'

export async function requireOwner() {
  const session = await getServerClient()
  const { data, error } = session
    ? await session.auth.getUser()
    : { data: { user: null }, error: null }
  if (error || !data.user) return null
  return data.user
}

export async function projectForApiKey(request: NextRequest): Promise<string | null> {
  const token = request.headers.get('authorization')?.match(/^Bearer (sa_live_[a-f0-9]{64})$/)?.[1]
  if (!token) return null
  const admin = getAdminClient()
  if (!admin) return null
  const { data, error } = await admin.from('sms_auth_keys')
    .select('project_id')
    .eq('key_hash', sha256(token))
    .is('revoked_at', null)
    .maybeSingle()
  if (error || !data) return null
  return data.project_id as string
}

export async function ownsProject(projectId: string, userId: string) {
  const admin = getAdminClient()
  if (!admin) return false
  const { data } = await admin.from('sms_auth_projects')
    .select('id').eq('id', projectId).eq('owner_id', userId).maybeSingle()
  return Boolean(data)
}
