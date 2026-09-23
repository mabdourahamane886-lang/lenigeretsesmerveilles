'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '../../lib/supabase/admin'
import { isAdminAuthenticated } from '../../lib/admin-auth'
import { uploadToSmoothBundle } from '../../lib/smooth-bundle'

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function getAdminClient() {
  if (!(await isAdminAuthenticated())) {
    throw new Error('Connexion administrateur requise.')
  }

  const supabase = createAdminClient()
  if (!supabase) {
    throw new Error('La connexion sécurisée à la base de données n’est pas configurée.')
  }

  return supabase
}

const text = (formData: FormData, name: string) =>
  String(formData.get(name) || '').trim() || null

const allowedMediaTypes = new Set(['photo', 'video'])
const allowedCategories = new Set([
  'photo',
  'illustration',
  'patrimoine',
  'tourisme',
  'culture',
  'evenement',
])

export async function createMedia(formData: FormData) {
  const supabase = await getAdminClient()

  const title = String(formData.get('title') || '').trim()
  const description = text(formData, 'description') || ''
  const credit = text(formData, 'credit')
  const url = text(formData, 'url')
  const selectedMediaType = String(formData.get('media_type') || 'photo').trim().toLowerCase()
  const mediaCategory = String(formData.get('media_category') || 'photo').trim().toLowerCase()
  const regionId = text(formData, 'region_id')
  const wonderId = text(formData, 'wonder_id')
  const published = formData.get('published') === 'on'

  if (!title) throw new Error('Le titre est obligatoire.')
  if (!credit) throw new Error('Le crédit / la licence est obligatoire.')

  if (!allowedMediaTypes.has(selectedMediaType)) {
    throw new Error('Le type de média est invalide.')
  }

  if (!allowedCategories.has(mediaCategory)) {
    throw new Error('La catégorie du média est invalide.')
  }

  const imageFile = formData.get('image_file')
  let mediaUrl = url
  let mediaType = selectedMediaType

  if (imageFile instanceof File && imageFile.size > 0) {
    const isVideo = imageFile.type.startsWith('video/')
    const isImage = imageFile.type.startsWith('image/')

    if (!isImage && !isVideo) {
      throw new Error('Le fichier doit être une image ou une vidéo.')
    }

    if (imageFile.size > 50 * 1024 * 1024) {
      throw new Error('Le fichier ne doit pas dépasser 50 Mo.')
    }

    mediaType = isVideo ? 'video' : 'photo'

    const ext =
      imageFile.name.split('.').pop()?.toLowerCase() ||
      (isVideo ? 'mp4' : 'jpg')

    const path = `gallery/${mediaType}/${new Date().getUTCFullYear()}/${Date.now()}-${slugify(title)}.${ext}`

    const uploaded = await uploadToSmoothBundle(imageFile, path)
    mediaUrl = uploaded.url
  }

  if (!mediaUrl) {
    throw new Error('Sélectionne une photo/vidéo depuis ta galerie ou indique une URL.')
  }

  const { error } = await supabase.from('niger_media').insert({
    title,
    description,
    media_type: mediaType,
    media_category: mediaCategory,
    url: mediaUrl,
    credit,
    region_id: regionId,
    wonder_id: wonderId,
    published,
  })

  if (error) {
    throw new Error(`Impossible d’enregistrer le média : ${error.message}`)
  }

  revalidatePath('/admin/medias')
  revalidatePath('/media')
  revalidatePath('/')
}

// Conservé pour compatibilité avec d’éventuelles anciennes pages d’administration.
export async function createArticle(formData: FormData) {
  return createMedia(formData)
}
