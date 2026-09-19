'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../lib/supabase/server'

function slugify(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

async function getAdminClient() {
  const supabase = await createClient()
  if (!supabase) throw new Error('Supabase n’est pas configuré.')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Connexion administrateur requise.')
  const { data: admin } = await supabase.from('niger_admins').select('user_id, role').eq('user_id', user.id).maybeSingle()
  if (!admin) throw new Error('Accès administrateur refusé.')
  return supabase
}

const text = (formData: FormData, name: string) => String(formData.get(name) || '').trim() || null

export async function createArticle(formData: FormData) {
  const supabase = await getAdminClient()
  const title = String(formData.get('title') || '').trim(), content = String(formData.get('content') || '').trim()
  if (!title || !content) throw new Error('Le titre et le contenu sont obligatoires.')
  const published = formData.get('published') === 'on'
  const { error } = await supabase.from('niger_articles').insert({ title, slug: `${slugify(title)}-${Date.now()}`, category: text(formData,'category') || 'culture', excerpt: text(formData,'excerpt'), content, cover_url: text(formData,'cover_url'), author_name: text(formData,'author_name') || 'Abdourahamane Mohamed', published, published_at: published ? new Date().toISOString() : null })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/articles'); revalidatePath('/')
}

export async function createAdvertisement(formData: FormData) {
  const supabase = await getAdminClient(), name = String(formData.get('name') || '').trim(), title = String(formData.get('title') || '').trim()
  if (!name || !title) throw new Error('Le nom et le titre sont obligatoires.')
  const { error } = await supabase.from('niger_advertisements').insert({ name, title, body: text(formData,'body'), media_url: text(formData,'media_url'), media_type: 'image', cta_label: text(formData,'cta_label'), destination_url: text(formData,'destination_url'), placement: text(formData,'placement') || 'home', starts_at: text(formData,'starts_at'), ends_at: text(formData,'ends_at'), active: formData.get('active') === 'on' })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/publicites'); revalidatePath('/')
}

export async function createRegion(formData: FormData) {
  const supabase = await getAdminClient(), name = String(formData.get('name') || '').trim()
  if (!name) throw new Error('Le nom de la région est obligatoire.')
  const { error } = await supabase.from('niger_regions').insert({ name, slug: slugify(name), description: text(formData,'description'), cover_url: text(formData,'cover_url') })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/regions'); revalidatePath('/regions')
}

export async function createWonder(formData: FormData) {
  const supabase = await getAdminClient(), name = String(formData.get('name') || '').trim()
  if (!name) throw new Error('Le nom de la merveille est obligatoire.')
  const { error } = await supabase.from('niger_wonders').insert({ name, slug: `${slugify(name)}-${Date.now()}`, category_id: text(formData,'category_id'), region_id: text(formData,'region_id'), short_description: text(formData,'short_description'), description: text(formData,'description'), history: text(formData,'history'), why_visit: text(formData,'why_visit'), latitude: formData.get('latitude') ? Number(formData.get('latitude')) : null, longitude: formData.get('longitude') ? Number(formData.get('longitude')) : null, cover_url: text(formData,'cover_url'), video_url: text(formData,'video_url'), published: formData.get('published') === 'on', featured: formData.get('featured') === 'on' })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/merveilles'); revalidatePath('/merveilles'); revalidatePath('/')
}

export async function createCulture(formData: FormData) {
  const supabase = await getAdminClient(), title = String(formData.get('title') || '').trim()
  if (!title) throw new Error('Le titre est obligatoire.')
  const { error } = await supabase.from('niger_cultures').insert({ title, slug: `${slugify(title)}-${Date.now()}`, region_id: text(formData,'region_id'), language: text(formData,'language'), traditions: text(formData,'traditions'), clothing: text(formData,'clothing'), gastronomy: text(formData,'gastronomy'), music_dance: text(formData,'music_dance'), crafts: text(formData,'crafts'), festivals: text(formData,'festivals'), history: text(formData,'history'), cover_url: text(formData,'cover_url'), published: formData.get('published') === 'on' })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/cultures'); revalidatePath('/culture')
}

export async function createGastronomy(formData: FormData) {
  const supabase = await getAdminClient(), name = String(formData.get('name') || '').trim()
  if (!name) throw new Error('Le nom du plat est obligatoire.')
  const { error } = await supabase.from('niger_gastronomy').insert({ name, slug: `${slugify(name)}-${Date.now()}`, region_id: text(formData,'region_id'), description: text(formData,'description'), ingredients: text(formData,'ingredients'), preparation: text(formData,'preparation'), history: text(formData,'history'), image_url: text(formData,'image_url'), video_url: text(formData,'video_url'), published: formData.get('published') === 'on' })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/gastronomie')
}

export async function createEvent(formData: FormData) {
  const supabase = await getAdminClient(), name = String(formData.get('name') || '').trim()
  if (!name) throw new Error('Le nom de l’événement est obligatoire.')
  const startsAt = String(formData.get('starts_at') || '').trim()
  const endsAt = String(formData.get('ends_at') || '').trim()
  if (!startsAt) throw new Error('La date de début est obligatoire.')
  const startDate = new Date(startsAt)
  const endDate = endsAt ? new Date(endsAt) : null
  if (Number.isNaN(startDate.getTime())) throw new Error('La date de début est invalide.')
  if (endDate && Number.isNaN(endDate.getTime())) throw new Error('La date de fin est invalide.')
  if (endDate && endDate < startDate) throw new Error('La date de fin doit être après le début.')
  const { error } = await supabase.from('niger_events').insert({ name, slug: `${slugify(name)}-${Date.now()}`, region_id: text(formData,'region_id'), city: text(formData,'city'), starts_at: startDate.toISOString(), ends_at: endDate?.toISOString() ?? null, description: text(formData,'description') || '', program: text(formData,'program') || '', location: text(formData,'location'), image_url: text(formData,'image_url'), published: formData.get('published') === 'on' })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/evenements'); revalidatePath('/evenements'); revalidatePath('/')
}


export async function reviewContribution(formData: FormData) {
  const supabase = await getAdminClient()
  const id = String(formData.get('id') || '').trim()
  const status = String(formData.get('status') || '').trim()
  const reviewerNotes = text(formData, 'reviewer_notes')
  if (!id || !['approved', 'rejected', 'pending'].includes(status)) throw new Error('Décision de modération invalide.')

  const { error } = await supabase.from('niger_contributions').update({
    status,
    reviewer_notes: reviewerNotes,
    reviewed_at: status === 'pending' ? null : new Date().toISOString(),
  }).eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/contributions')
}


export async function createMedia(formData: FormData) {
  const supabase = await getAdminClient()
  const title = String(formData.get('title') || '').trim()
  const url = String(formData.get('url') || '').trim()
  const credit = String(formData.get('credit') || '').trim()
  if (!title || !url || !credit) throw new Error('Le titre, l’URL et le crédit sont obligatoires.')

  const { error } = await supabase.from('niger_media').insert({
    title,
    description: text(formData, 'description') || '',
    media_type: 'photo',
    url,
    credit,
    region_id: text(formData, 'region_id'),
    wonder_id: text(formData, 'wonder_id'),
    published: formData.get('published') === 'on',
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/medias')
  revalidatePath('/media')
  revalidatePath('/')
}
