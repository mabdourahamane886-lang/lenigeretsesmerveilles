import { NextRequest, NextResponse } from 'next/server'
import { ownsProject, requireOwner } from '@/lib/auth'
import { getAdminClient } from '@/lib/supabase/admin'
import { goodUuid, newApiKey, sha256 } from '@/lib/security'

export const runtime = 'nodejs'
export async function POST(request: NextRequest) {
  const user = await requireOwner()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const admin = getAdminClient()
  if (!admin) return NextResponse.json({ error: 'supabase_not_configured' }, { status: 503 })
  const body = await request.json().catch(() => ({}))
  if (!goodUuid(body.project_id) || !await ownsProject(body.project_id, user.id)) {
    return NextResponse.json({ error: 'project_not_found' }, { status: 404 })
  }
  if (body.action === 'revoke') {
    if (!goodUuid(body.key_id)) return NextResponse.json({ error: 'invalid_key' }, { status: 422 })
    const { data, error } = await admin.from('sms_auth_keys')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', body.key_id).eq('project_id', body.project_id)
      .is('revoked_at', null).select('id').maybeSingle()
    if (error || !data) return NextResponse.json({ error: 'key_not_found' }, { status: 404 })
    return NextResponse.json({ success: true })
  }
  if (body.action === 'rotate') {
    const { count } = await admin.from('sms_auth_keys')
      .select('id', { head: true, count: 'exact' })
      .eq('project_id', body.project_id).is('revoked_at', null)
    if ((count ?? 0) >= 4) return NextResponse.json({ error: 'active_keys_limit' }, { status: 429 })
    const key = newApiKey()
    const { error } = await admin.from('sms_auth_keys')
      .insert({ project_id: body.project_id, prefix: key.slice(0, 18), key_hash: sha256(key) })
    if (error) return NextResponse.json({ error: 'key_creation_failed' }, { status: 500 })
    return NextResponse.json({ api_key: key }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
  }
  return NextResponse.json({ error: 'invalid_action' }, { status: 422 })
}
