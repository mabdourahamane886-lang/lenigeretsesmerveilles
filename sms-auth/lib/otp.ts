import { randomUUID } from 'node:crypto'
import { getAdminClient } from './supabase/admin'
import { equalsHash, goodUuid, hmacCode, newCode, normalizePhone } from './security'
import { sendWhatsAppCode } from './meta'

export class ApiProblem extends Error {
  constructor(public status: number, public code: string) { super(code) }
}

export async function issueOtp(projectId: string, inputPhone: unknown, consent: unknown) {
  const phone = normalizePhone(inputPhone)
  if (!phone) throw new ApiProblem(422, 'invalid_phone')
  if (consent !== true) throw new ApiProblem(422, 'consent_required')
  const admin = getAdminClient()
  if (!admin) throw new ApiProblem(503, 'supabase_not_configured')
  const id = randomUUID()
  const code = newCode()
  const codeHash = hmacCode(id, phone, code)
  const expiry = new Date(Date.now() + 5 * 60 * 1000).toISOString()
  const { error } = await admin.from('sms_auth_challenges').insert({
    id, project_id: projectId, phone, code_hash: codeHash,
    status: 'pending', channel: 'whatsapp', expires_at: expiry,
    consent_at: new Date().toISOString(),
  })
  if (error) {
    if (/otp_(cooldown|phone_limit|project_limit)/.test(error.message)) {
      throw new ApiProblem(429, error.message.match(/otp_(cooldown|phone_limit|project_limit)/)?.[0] || 'rate_limited')
    }
    throw new ApiProblem(500, 'challenge_creation_failed')
  }
  try {
    const messageId = await sendWhatsAppCode(phone, code)
    const { error: updateError } = await admin.from('sms_auth_challenges')
      .update({ status: 'sent', provider_status: 'accepted', provider_message_id: messageId })
      .eq('id', id).eq('project_id', projectId)
    if (updateError) throw new Error('delivery_log_failed')
    return { success: true, challenge_id: id, expires_in: 300, status: 'sent' }
  } catch (error) {
    await admin.from('sms_auth_challenges').update({
      status: 'failed', provider_status: error instanceof Error ? error.message.slice(0, 90) : 'send_failed',
    }).eq('id', id)
    throw new ApiProblem(503, error instanceof Error && error.message === 'meta_not_configured'
      ? 'meta_not_configured' : 'whatsapp_send_failed')
  }
}

export async function checkOtp(projectId: string, challengeId: unknown, code: unknown) {
  if (!goodUuid(challengeId) || typeof code !== 'string' || !/^\d{6}$/.test(code)) {
    throw new ApiProblem(422, 'invalid_code_or_challenge')
  }
  const admin = getAdminClient()
  if (!admin) throw new ApiProblem(503, 'supabase_not_configured')
  const { data: row } = await admin.from('sms_auth_challenges')
    .select('id,phone,code_hash,attempts,expires_at,status,verified_at')
    .eq('project_id', projectId).eq('id', challengeId).maybeSingle()
  if (!row || row.verified_at || row.status !== 'sent' || row.attempts >= 5) {
    throw new ApiProblem(400, 'code_invalid_or_used')
  }
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await admin.from('sms_auth_challenges').update({ status: 'expired' })
      .eq('id', row.id).eq('status', 'sent')
    throw new ApiProblem(400, 'code_expired')
  }
  const valid = equalsHash(row.code_hash, hmacCode(row.id, row.phone, code))
  if (!valid) {
    await admin.from('sms_auth_challenges').update({ attempts: row.attempts + 1 })
      .eq('id', row.id).eq('attempts', row.attempts).eq('status', 'sent')
    throw new ApiProblem(400, 'code_invalid_or_used')
  }
  // Consommation unique optimiste : 2 validations concurrentes ne peuvent pas réussir.
  const { data: updated, error } = await admin.from('sms_auth_challenges')
    .update({ status: 'verified', verified_at: new Date().toISOString() })
    .eq('id', row.id).eq('project_id', projectId).eq('attempts', row.attempts)
    .eq('status', 'sent').is('verified_at', null)
    .select('id').maybeSingle()
  if (error || !updated) throw new ApiProblem(409, 'already_verified')
  return { verified: true, phone: row.phone }
}
