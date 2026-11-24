'use server'

import { revalidatePath } from 'next/cache'
import { adminDatabase } from '../../lib/admin/database'

export async function setPublicationPin(id: string, shouldPin: boolean) {
  const database = await adminDatabase()
  if (typeof shouldPin !== 'boolean' || typeof id !== 'string' || !/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(id)) {
    return { error: 'Publication invalide.' }
  }

  const { data, error } = await database.rpc('set_niger_publication_pin', {
    publication_id: id,
    should_pin: shouldPin,
  })
  if (error) return { error: 'La modification a échoué. Réessayez dans un instant.' }
  if (!data) return { error: 'Cette publication n’est plus publique.' }

  revalidatePath('/admin/publications')
  revalidatePath('/publications')
  revalidatePath('/publications/' + id)
  revalidatePath('/')
  return { error: null }
}
