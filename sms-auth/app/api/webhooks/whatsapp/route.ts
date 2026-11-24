import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  if (params.get('hub.mode') === 'subscribe'
    && process.env.WHATSAPP_VERIFY_TOKEN
    && params.get('hub.verify_token') === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(params.get('hub.challenge') || '', { status: 200, headers: { 'Content-Type': 'text/plain' } })
  }
  return new Response('Forbidden', { status: 403 })
}

export async function POST(request: NextRequest) {
  const secret = process.env.META_APP_SECRET
  if (!secret) return NextResponse.json({ error: 'webhook_not_configured' }, { status: 503 })
  const raw = await request.text()
  const received = request.headers.get('x-hub-signature-256') || ''
  const computed = 'sha256=' + createHmac('sha256', secret).update(raw).digest('hex')
  const sigValid = received.length === computed.length
    && timingSafeEqual(Buffer.from(received), Buffer.from(computed))
  if (!sigValid) return NextResponse.json({ error: 'invalid_signature' }, { status: 401 })
  let payload: unknown
  try { payload = JSON.parse(raw) } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }
  const admin = getAdminClient()
  if (!admin) return NextResponse.json({ error: 'database_unavailable' }, { status: 503 })
  type Status = { id?: string; status?: string }
  type Body = { entry?: Array<{ changes?: Array<{ value?: { statuses?: Status[] } }> }> }
  const body = payload as Body
  for (const entry of body.entry || []) for (const change of entry.changes || []) {
    for (const item of change.value?.statuses || []) {
      if (!item.id || !item.status || !['sent','delivered','read','failed'].includes(item.status)) continue
      await admin.from('sms_auth_challenges').update({ provider_status: item.status })
        .eq('provider_message_id', item.id)
    }
  }
  return NextResponse.json({ success: true })
}
