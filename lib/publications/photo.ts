const photoPath = /^publications\/photos\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/photo\.(?:jpg|png|webp|avif|gif)$/

export function isUploadedPhoto(path: string) {
  return photoPath.test(path)
}

export function publicationPreview(media: string | null, type: string | null, origin: string) {
  if (type !== 'photo' || !media) return origin + '/opengraph-image'
  try {
    const url = new URL(media, origin)
    if (url.protocol !== 'https:') return origin + '/opengraph-image'
    const project = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const prefix = '/storage/v1/object/public/niger-media/'
    if (project && url.origin === new URL(project).origin && url.pathname.startsWith(prefix) && isUploadedPhoto(url.pathname.slice(prefix.length))) {
      return new URL('partage.jpg', url).href
    }
    return url.href
  } catch { return origin + '/opengraph-image' }
}
