'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '../../lib/supabase/admin'
import { isAdminAuthenticated } from '../../lib/admin-auth'
import { uploadToSmoothBundle } from '../../lib/smooth-bundle'

function slugify(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

async function getAdminClient() {
  if (!(await isAdminAuthenticated())) throw new Error('Connexion administrateur requise.')
  const supabase = createAdminClient()
  if (!supabase) throw new Error('La connexion sécurisée à la base de données n’est pas configurée.')
  return supabase
}

const text = (formData: FormData, name: string) => String(formData.get(name) || '').trim() || null

export async function createArticle(formData: FormData) {
  const supabase = await getAdminClient()
  const title = String(formData.get('title') || '').trim()
  const content = String(formData.get('content') || '').trim()
  if (!title || !content) throw new Error('Le titre et le contenu sont obligatoires.')

  const published = formData.get('published') === 'on'
  const slug = `${slugify(title)}-${Date.now()}`
  const imageFile = formData.get('cover_file')
  let coverUrl = text(formData, 'cover_url')

  const mediaType = String(formData.get('media_type') || 'photo')

  if (imageFile instanceof File && imageFile.size > 0) {
    const isVideo = imageFile.type.startsWith('video/')
    const isImage = imageFile.type.startsWith('image/')
    if (!isImage && !isVideo) throw new Error('Le fichier doit être une image ou une vidéo.')
    if (imageFile.size > 50 * 1024 * 1024) throw new Error('Le fichier ne doit pas dépasser 50 Mo.')
    const ext = imageFile.name.split('.').pop()?.toLowerCase() || (isVideo ? 'mp4' : 'jpg')
    const path = `gallery/${mediaType}/${new Date().getUTCFullYear()}/${Date.now()}-${slugify(title)}.${ext}`
    const uploaded = await uploadToSmoothBundle(imageFile, path)
    url = uploaded.url
  }

  if (!url) throw new Error('Sélectionne une photo/vidéo depuis ta galerie ou indique une URL.')

  const { error } = await supabase.from('niger_media').insert({
    title,
    description: text(formData, 'description') || '',
    media_type: mediaType,
    media_category: text(formData, 'media_category') || 'photo',
    url,
    credit,
    region_id: text(formData, 'region_id'),
    wonder_id: text(formData, 'wonder_id'),
    published: formData.get('published') === 'on'
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/medias'); revalidatePath('/media'); revalidatePath('/')
}
