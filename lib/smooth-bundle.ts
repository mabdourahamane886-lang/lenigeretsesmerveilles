const SMOOTH_BUNDLE_API = 'https://api.smoothbundle.com'
const PROJECT_ID = 'e190336f-2bf0-44df-accd-f36f63c70625'

function getToken() {
  const token = process.env.SBUNDLE_TOKEN
  if (!token) throw new Error('Smooth Bundle n’est pas configuré : ajoute SBUNDLE_TOKEN dans les variables serveur.')
  return token
}

export async function uploadToSmoothBundle(file: File, path: string) {
  const body = new FormData()
  body.append('projectId', PROJECT_ID)
  body.append('asset', file, file.name)
  body.append('path', path)
  body.append('protected', '0')

  const response = await fetch(`${SMOOTH_BUNDLE_API}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body,
    cache: 'no-store',
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(payload?.error || payload?.message || 'Échec de l’envoi vers Smooth Bundle.')
  }

  const asset = payload?.data?.asset || payload?.asset || payload?.data || payload
  const url = asset?.url || asset?.cdnUrl || asset?.deliveryUrl || asset?.publicUrl || asset?.assetUrl
  if (!url) throw new Error('Smooth Bundle a accepté le fichier, mais aucune URL CDN n’a été retournée.')
  return { url: String(url), asset }
}
