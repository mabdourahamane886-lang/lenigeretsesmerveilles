'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../lib/supabase/server'

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
  const supabase = await createClient()
  if (!supabase) throw new Error('Supabase n’est pas configuré.')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Connexion administrateur requise.')
  const { data: admin } = await supabase
    .from('niger_admins')
    .select('user_id, role')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!admin) throw new Error('Accès administrateur refusé.')
  return supabase
}

export async function createArticle(formData: FormData) {
  const supabase = await getAdminClient()
  const title = String(formData.get('title') || '').trim()
  const content = String(formData.get('content') || '').trim()
  if (!title || !content) throw new Error('Le titre et le contenu sont obligatoires.')

  const { error } = await supabase.from('niger_articles').insert({
    title,
    slug: `${slugify(title)}-${Date.now()}`,
    category: String(formData.get('category') || 'culture'),
    excerpt: String(formData.get('excerpt') || '').trim() || null,
    content,
    cover_url: String(formData.get('cover_url') || '').trim() || null,
    author_name: String(formData.get('author_name') || 'Abdourahamane Mohamed').trim(),
    published: formData.get('published') === 'on',
    published_at: formData.get('published') === 'on' ? new Date().toISOString() : null,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/articles')
  revalidatePath('/')
}

export async function createAdvertisement(formData: FormData) {
  const supabase = await getAdminClient()
  const name = String(formData.get('name') || '').trim()
  const title = String(formData.get('title') || '').trim()
  if (!name || !title) throw new Error('Le nom et le titre sont obligatoires.')

  const { error } = await supabase.from('niger_advertisements').insert({
    name,
    title,
    body: String(formData.get('body') || '').trim() || null,
    media_url: String(formData.get('media_url') || '').trim() || null,
    media_type: 'image',
    cta_label: String(formData.get('cta_label') || '').trim() || null,
    destination_url: String(formData.get('destination_url') || '').trim() || null,
    placement: String(formData.get('placement') || 'home'),
    starts_at: String(formData.get('starts_at') || '').trim() || null,
    ends_at: String(formData.get('ends_at') || '').trim() || null,
    active: formData.get('active') === 'on',
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/publicites')
  revalidatePath('/')
}
