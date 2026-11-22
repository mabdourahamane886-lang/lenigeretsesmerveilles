'use server'

import { adminDatabase } from '../../../lib/admin/database'

const extensions: Record<string,string> = {
  'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/avif':'avif','image/gif':'gif',
}

export async function preparePhoto(type: string, size: number) {
  const db = await adminDatabase()
  const ext = extensions[type]
  if (!ext || !Number.isSafeInteger(size) || size < 1 || size > 50 * 1024 * 1024)
    return { error: 'Choisis une photo JPEG, PNG, WebP, AVIF ou GIF de moins de 50 Mo.' } as const
  const bucket = db.storage.from('niger-media')
  const folder = 'publications/photos/' + crypto.randomUUID()
  const [photo, preview] = await Promise.all([
    bucket.createSignedUploadUrl(folder + '/photo.' + ext),
    bucket.createSignedUploadUrl(folder + '/partage.jpg'),
  ])
  if (!photo.data || !preview.data) return { error: 'Le stockage des photos est indisponible. Réessaie dans un instant.' } as const
  return { photo:photo.data, preview:preview.data } as const
}
