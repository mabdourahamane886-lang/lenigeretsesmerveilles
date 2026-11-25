import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '../../../lib/admin-auth'
import { createAdminClient } from '../../../lib/supabase/admin'

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Accès interdit' }, { status: 403 })
  const db = createAdminClient()
  if (!db) return NextResponse.json({ error: 'Stockage non configuré' }, { status: 503 })
  const form = await request.formData()
  const kind = form.get('kind')
  const description = kind === 'profile' || kind === 'description' ? form.get('description') : null
  if ((kind === 'profile' || kind === 'description') && (typeof description !== 'string' || description.length > 1000)) {
    return NextResponse.json({ error: 'Description invalide (1000 caractères maximum)' }, { status: 400 })
  }

  const images: { field: 'avatar' | 'cover'; file: File; extension: string }[] = []
  const extensions = new Map([['image/jpeg', 'jpg'], ['image/png', 'png'], ['image/webp', 'webp']])
  for (const field of ['avatar', 'cover'] as const) {
    const file = kind === 'profile' ? form.get(field) : kind === field ? form.get('file') : null
    if (file === null || (kind === 'profile' && file instanceof File && file.name === '' && file.size === 0)) continue
    const extension = file instanceof File ? extensions.get(file.type) : undefined
    if (!(file instanceof File) || !extension || file.size === 0 || file.size > 5_000_000) {
      return NextResponse.json({ error: 'Image JPEG, PNG ou WebP de 5 Mo maximum' }, { status: 400 })
    }
    images.push({ field, file, extension })
  }
  if (typeof description !== 'string' && !images.length) {
    return NextResponse.json({ error: 'Fichier invalide' }, { status: 400 })
  }

  const bucket = db.storage.from('niger-media')
  const uploaded: string[] = []
  const changes: { description?: string; avatar_path?: string; cover_path?: string; updated_at: string } = {
    updated_at: new Date().toISOString(),
  }
  if (typeof description === 'string') changes.description = description.trim()

  for (const { field, file, extension } of images) {
    const path = 'media-profile/' + field + '-' + crypto.randomUUID() + '.' + extension
    const { error } = await bucket.upload(path, file, { contentType: file.type, upsert: false })
    if (error) {
      if (uploaded.length) await bucket.remove(uploaded)
      return NextResponse.json({ error: 'Impossible de transférer les images' }, { status: 500 })
    }
    uploaded.push(path)
    changes[field === 'avatar' ? 'avatar_path' : 'cover_path'] = path
  }
  const { error } = await db.from('niger_media_profile').update(changes).eq('id', 1).select('id').single()
  if (error) {
    if (uploaded.length) await bucket.remove(uploaded)
    return NextResponse.json({ error: 'Enregistrement impossible' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
