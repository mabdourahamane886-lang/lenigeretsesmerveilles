import { NextResponse } from 'next/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { createClient as createServerClient } from '../../../../lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const MAX_REDIRECTS = 3
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
])

function getAllowedHosts() {
  const hosts = new Set<string>()
  const configuredSupabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL

  if (configuredSupabaseUrl) {
    try {
      hosts.add(new URL(configuredSupabaseUrl).hostname.toLowerCase())
    } catch {
      // An invalid optional URL must not expand the allowlist.
    }
  }

  for (const host of (process.env.OG_IMAGE_ALLOWED_HOSTS || '').split(',')) {
    const normalized = host.trim().toLowerCase()
    if (normalized && /^[a-z0-9.-]+$/.test(normalized)) hosts.add(normalized)
  }

  // Smooth Bundle serves publication assets from its dedicated CDN host.
  hosts.add('smoothbundle.com')
  hosts.add('www.smoothbundle.com')
  hosts.add('cdn.smoothbundle.com')

  // Wikimedia Special:FilePath redirects to its controlled upload CDN.
  hosts.add('commons.wikimedia.org')
  hosts.add('upload.wikimedia.org')
  return hosts
}

function isAllowedImageUrl(url: URL, allowedHosts: Set<string>) {
  return (
    url.protocol === 'https:' &&
    !url.port &&
    !url.username &&
    !url.password &&
    allowedHosts.has(url.hostname.toLowerCase())
  )
}

function isRedirect(status: number) {
  return [301, 302, 303, 307, 308].includes(status)
}

async function fetchImageSafely(sourceUrl: string, allowedHosts: Set<string>) {
  let currentUrl = new URL(sourceUrl)

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
    if (!isAllowedImageUrl(currentUrl, allowedHosts)) {
      throw new Error('Source image non autorisée')
    }

    const response = await fetch(currentUrl.toString(), {
      redirect: 'manual',
      signal: AbortSignal.timeout(12000),
      headers: { Accept: 'image/avif,image/webp,image/png,image/jpeg' },
      cache: 'no-store',
    })

    if (isRedirect(response.status)) {
      const location = response.headers.get('location')
      if (!location || redirectCount === MAX_REDIRECTS) {
        throw new Error('Trop de redirections ou destination manquante')
      }
      currentUrl = new URL(location, currentUrl)
      continue
    }

    if (!response.ok) throw new Error(`Image source inaccessible (${response.status})`)

    const contentType = (response.headers.get('content-type') || '')
      .split(';')[0].trim().toLowerCase()
    const declaredSize = Number(response.headers.get('content-length') || 0)

    if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
      throw new Error('Format d’image non pris en charge')
    }
    if (declaredSize > MAX_IMAGE_BYTES) throw new Error('Image trop volumineuse')
    if (!response.body) throw new Error('Réponse image vide')

    const reader = response.body.getReader()
    const chunks: Uint8Array[] = []
    let totalBytes = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      totalBytes += value.byteLength
      if (totalBytes > MAX_IMAGE_BYTES) {
        await reader.cancel()
        throw new Error('Image trop volumineuse')
      }
      chunks.push(value)
    }

    if (!totalBytes) throw new Error('Image vide')

    const bytes = new Uint8Array(totalBytes)
    let offset = 0
    for (const chunk of chunks) {
      bytes.set(chunk, offset)
      offset += chunk.byteLength
    }

    // Reject HTML or arbitrary payloads even if the upstream server labels them as images.
    const isValidSignature =
      (contentType === 'image/jpeg' && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) ||
      (contentType === 'image/png' && bytes.subarray(0, 8).join(',') === '137,80,78,71,13,10,26,10') ||
      (contentType === 'image/webp' && String.fromCharCode(...bytes.subarray(0, 4)) === 'RIFF' &&
        String.fromCharCode(...bytes.subarray(8, 12)) === 'WEBP') ||
      (contentType === 'image/avif' && String.fromCharCode(...bytes.subarray(4, 12)).includes('ftypavif'))

    if (!isValidSignature) throw new Error('Le contenu reçu ne correspond pas à une image valide')

    return { bytes, contentType }
  }

  throw new Error('Impossible de récupérer l’image')
}

function fallbackImage(request: Request) {
  const fallbackUrl = new URL('/opengraph-image', request.url)
  return NextResponse.redirect(fallbackUrl, {
    status: 307,
    headers: {
      'Cache-Control': 'public, max-age=300, s-maxage=300',
      'X-Robots-Tag': 'noindex',
    },
  })
}

/**
 * Public same-origin Open Graph image endpoint.
 * The original storage URL is never exposed to social crawlers.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    if (!UUID_PATTERN.test(id)) {
      return NextResponse.json(
        { error: 'Image de publication introuvable' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } },
      )
    }

    const supabase = createAdminClient() ?? await createServerClient()
    if (!supabase) return fallbackImage(request)

    const { data: publication, error } = await supabase
      .from('niger_publications')
      .select('media_url,media_type')
      .eq('id', id)
      .eq('published', true)
      .eq('visibility', 'public')
      .maybeSingle()

    if (error) {
      console.error('[publications/og] Erreur Supabase:', error.message)
      return fallbackImage(request)
    }

    if (!publication || publication.media_type !== 'photo' || !publication.media_url) {
      return fallbackImage(request)
    }

    const allowedHosts = getAllowedHosts()
    const { bytes, contentType } = await fetchImageSafely(publication.media_url, allowedHosts)

    return new Response(bytes, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(bytes.byteLength),
        'Content-Disposition': 'inline',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        'X-Content-Type-Options': 'nosniff',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('[publications/og] Échec de génération:', error)
    return fallbackImage(request)
  }
}
