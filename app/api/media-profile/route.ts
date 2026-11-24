import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '../../../lib/admin-auth'
import { createAdminClient } from '../../../lib/supabase/admin'

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Accès interdit' }, { status: 403 })
  const db = createAdminClient()
  if (!db) return NextResponse.json({ error: 'Stockage non configuré' }, { status: 503 })
  const form = await request.formData()
  const kind = form.get('kind')
  const file = form.get('file')
  if ((kind !== 'avatar' && kind !== 'cover') || !(file instanceof File)) return NextResponse.json({ error: 'Fichier invalide' }, { status: 400 })
  if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 5_000_000 || file.size === 0) return NextResponse.json({ error: 'Image JPEG, PNG ou WebP de 5 Mo maximum' }, { status: 400 })
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = 'media-profile/' + kind + '-' + crypto.randomUUID() + '.' + ext
  const { error } = await db.storage.from('niger-media').upload(path, file, { contentType: file.type, upsert: false })
  if (error) return NextResponse.json({ error: 'Enregistrement impossible' }, { status: 500 })
  const { error: saveError } = await db.from('niger_media_profile').update({ [kind === 'avatar' ? 'avatar_path' : 'cover_path']: path, updated_at: new Date().toISOString() }).eq('id', 1).select('id').single()
  if (saveError) {
    await db.storage.from('niger-media').remove([path])
    return NextResponse.json({ error: 'Profil non configuré dans Supabase' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
