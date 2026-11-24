import { NextRequest, NextResponse } from 'next/server'
import { requireOwner } from '@/lib/auth'
import { getAdminClient } from '@/lib/supabase/admin'
import { newApiKey, sha256 } from '@/lib/security'

export const runtime = 'nodejs'
export async function POST(request: NextRequest) {
  const user = await requireOwner()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const admin = getAdminClient()
  if (!admin) return NextResponse.json({ error: 'supabase_not_configured' }, { status: 503 })
  const payload = await request.json().catch(() => ({}))
  const name = typeof payload.name === 'string' ? payload.name.trim().slice(0, 80) : ''
  if (name.length < 2) return NextResponse.json({ error: 'invalid_project_name' }, { status: 422 })
  const { count } = await admin.from('sms_auth_projects')
    .select('id', { head: true, count: 'exact' }).eq('owner_id', user.id)
  if ((count ?? 0) >= 5) return NextResponse.json({ error: 'project_limit_reached' }, { status: 429 })
  const { data: project, error } = await admin.from('sms_auth_projects')
    .insert({ name, owner_id: user.id }).select('id,name').single()
  if (error || !project) return NextResponse.json({ error: 'project_creation_failed' }, { status: 500 })
  const key = newApiKey()
  const { error: keyError } = await admin.from('sms_auth_keys')
    .insert({ project_id: project.id, prefix: key.slice(0, 18), key_hash: sha256(key) })
  if (keyError) {
    await admin.from('sms_auth_projects').delete().eq('id', project.id)
    return NextResponse.json({ error: 'api_key_creation_failed' }, { status: 500 })
  }
  return NextResponse.json({ project, api_key: key }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
}
