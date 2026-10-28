import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const jsonError = (error: string, status: number) => NextResponse.json({ error }, { status })

async function getAuthenticatedClient() {
  const supabase = await createClient()
  if (!supabase) return { error: jsonError('Le service de mémoire n’est pas configuré.', 503) }
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return { error: jsonError('Connectez-vous pour utiliser la mémoire durable.', 401) }
  return { supabase, user: data.user }
}

// List only the current user's unexpired memories.
export async function GET() {
  const auth = await getAuthenticatedClient()
  if ('error' in auth) return auth.error
  const { data, error } = await auth.supabase
    .from('merveilles_ai_user_memories')
    .select('id, memory_key, content, consent_at, expires_at, created_at, updated_at')
    .eq('user_id', auth.user.id)
    .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
    .order('updated_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Niger IA memory list failed:', error.message)
    return jsonError('Impossible de charger la mémoire pour le moment.', 500)
  }
  return NextResponse.json({ memories: data || [] }, { headers: { 'Cache-Control': 'no-store' } })
}

// Saving is explicit: callers must send consent: true.
export async function POST(request: Request) {
  const auth = await getAuthenticatedClient()
  if ('error' in auth) return auth.error

  const body = await request.json().catch(() => null)
  if (!body || body.consent !== true) {
    return jsonError('Un consentement explicite est nécessaire pour enregistrer une mémoire.', 400)
  }

  const memoryKey = typeof body.memory_key === 'string' ? body.memory_key.trim() : ''
  const content = typeof body.content === 'string' ? body.content.trim() : ''
  if (memoryKey.length < 1 || memoryKey.length > 100 || content.length < 1 || content.length > 2000) {
    return jsonError('La clé doit contenir 1 à 100 caractères et le contenu 1 à 2000 caractères.', 400)
  }

  const days = body.expires_in_days === undefined ? 90 : Number(body.expires_in_days)
  if (!Number.isInteger(days) || days < 1 || days > 365) {
    return jsonError('La durée doit être comprise entre 1 et 365 jours.', 400)
  }

  const now = new Date()
  const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await auth.supabase
    .from('merveilles_ai_user_memories')
    .upsert({
      user_id: auth.user.id,
      memory_key: memoryKey,
      content,
      consent_at: now.toISOString(),
      expires_at: expiresAt,
      updated_at: now.toISOString(),
    }, { onConflict: 'user_id,memory_key' })
    .select('id, memory_key, content, consent_at, expires_at, created_at, updated_at')
    .single()

  if (error) {
    console.error('Niger IA memory save failed:', error.message)
    return jsonError('Impossible d’enregistrer cette mémoire pour le moment.', 500)
  }
  return NextResponse.json({ memory: data }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
}

// Delete one memory by key, or all memories for the signed-in user.
export async function DELETE(request: Request) {
  const auth = await getAuthenticatedClient()
  if ('error' in auth) return auth.error

  const body = await request.json().catch(() => ({}))
  let query = auth.supabase
    .from('merveilles_ai_user_memories')
    .delete()
    .eq('user_id', auth.user.id)

  if (body && typeof body.memory_key === 'string' && body.memory_key.trim()) {
    query = query.eq('memory_key', body.memory_key.trim())
  }

  const { error } = await query
  if (error) {
    console.error('Niger IA memory delete failed:', error.message)
    return jsonError('Impossible de supprimer la mémoire pour le moment.', 500)
  }
  return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
}
