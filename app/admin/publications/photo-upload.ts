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
  const supabase = createClient()
  if (!supabase) throw new Error('La connexion au stockage est indisponible.')
  const upload = await preparePhoto(file.type, file.size)
  if ('error' in upload) throw new Error(upload.error)
  const preview = await socialPreview(file)
  const bucket = supabase.storage.from('niger-media')
  const [original, small] = await Promise.all([
    bucket.uploadToSignedUrl(upload.photo.path, upload.photo.token, file, {contentType:file.type}),
    bucket.uploadToSignedUrl(upload.preview.path, upload.preview.token, preview, {contentType:'image/jpeg'}),
  ])
  if (original.error || small.error) throw new Error('Le transfert de la photo a échoué. Vérifie ta connexion et réessaie.')
  return upload.photo.path
}
