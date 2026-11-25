'use server'
import { revalidatePath } from 'next/cache'
import { isAdminAuthenticated } from '../../../lib/admin-auth'
import { createAdminClient } from '../../../lib/supabase/admin'
import { normalizePublicationContent } from '../../../lib/publications/format'

export async function updatePublication(id: string, content: string) {
  if (!(await isAdminAuthenticated())) return { error: 'Accès administrateur requis.' }
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: 'Identifiant invalide.' }
  const normalized = normalizePublicationContent(content)
  if (!normalized || normalized.length > 20000) return { error: 'Texte invalide (1 à 20 000 caractères).' }
  const supabase = createAdminClient()
  if (!supabase) return { error: 'Base de données indisponible.' }
  const { data, error } = await supabase.from('niger_publications').update({ content: normalized }).eq('id',id).select('id').maybeSingle()
  if (error || !data) return { error: error?.message || 'Publication introuvable.' }
  revalidatePath('/publications')
  revalidatePath('/publications/'+id)
  revalidatePath('/admin/publications')
  revalidatePath('/')
  return { success: true }
}
