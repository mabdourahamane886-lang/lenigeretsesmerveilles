import { createClient } from '../../../lib/supabase/client'
import { preparePhoto } from './photo-actions'

async function socialPreview(file: File) {
  const objectUrl = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = objectUrl
    await image.decode()
    const canvas = document.createElement('canvas')
    const ratio = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight))
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Aperçu indisponible.')
    context.fillStyle = '#ffffff'
    context.fillRect(0,0,canvas.width,canvas.height)
    context.drawImage(image,0,0,canvas.width,canvas.height)
    return await new Promise<Blob>((resolve,reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Aperçu indisponible.')), 'image/jpeg', .82))
  } finally { URL.revokeObjectURL(objectUrl) }
}

export async function uploadPhoto(file: File) {
  if (file.size < 1 || file.size > 50 * 1024 * 1024) throw new Error('Photo de 50 Mo maximum.')
  const preview = await socialPreview(file)
  const form = new FormData()
  form.append('photo', file)
  form.append('preview', preview, 'partage.jpg')
  const response = await fetch('/api/publication-photo', { method: 'POST', body: form, credentials: 'same-origin' })
  if (response.status !== 503) {
    const result = await response.json()
    if (!response.ok || typeof result.path !== 'string') throw new Error(result.error || 'Transfert impossible.')
    return result.path as string
  }
  const supabase = createClient()
  if (!supabase) throw new Error('La connexion au stockage est indisponible.')
  const upload = await preparePhoto(file.type, file.size)
  if ('error' in upload) throw new Error(upload.error)
  const bucket = supabase.storage.from('niger-media')
  const [original, small] = await Promise.all([
    bucket.uploadToSignedUrl(upload.photo.path, upload.photo.token, file, {contentType:file.type}),
    bucket.uploadToSignedUrl(upload.preview.path, upload.preview.token, preview, {contentType:'image/jpeg'}),
  ])
  if (original.error || small.error) throw new Error('Le transfert de la photo a échoué. Vérifie ta connexion et réessaie.')
  return upload.photo.path
}
