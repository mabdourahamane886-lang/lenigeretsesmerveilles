import { NextResponse } from 'next/server'
import { requireOwner } from '@/lib/auth'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export async function GET() {
  const user = await requireOwner()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const admin = getAdminClient()
  if (!admin) return NextResponse.json({ error: 'supabase_not_configured' }, { status: 503 })
  const { data: projects, error } = await admin.from('sms_auth_projects')
    .select('id,name,created_at').eq('owner_id', user.id).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'overview_failed' }, { status: 500 })
  const ids = (projects || []).map(p => p.id)
  const [{ data: keys }, { data: attempts }] = await Promise.all([
    ids.length ? admin.from('sms_auth_keys').select('id,project_id,prefix,created_at,revoked_at')
      .in('project_id', ids).order('created_at', { ascending: false }) : Promise.resolve({ data: [] }),
    ids.length ? admin.from('sms_auth_challenges')
      .select('id,project_id,phone,status,provider_status,created_at,verified_at')
      .in('project_id', ids).order('created_at', { ascending: false }).limit(100) : Promise.resolve({ data: [] }),
  ])
  // Les codes OTP, leur empreinte HMAC et les clés complètes ne quittent jamais le serveur.
  const phoneMasked = (attempts || []).map(a => ({
    ...a,
    phone: a.phone.slice(0, 5) + '••••' + a.phone.slice(-2),
  }))
  return NextResponse.json({
    user: { id: user.id, email: user.email },
    projects: projects || [],
    keys: keys || [],
    attempts: phoneMasked,
    summary: {
      projects: ids.length,
      sent: (attempts || []).filter(a => a.status === 'sent' || a.status === 'verified').length,
      verified: (attempts || []).filter(a => a.status === 'verified').length,
      failed: (attempts || []).filter(a => a.status === 'failed').length,
    },
  }, { headers: { 'Cache-Control': 'no-store' } })
}
