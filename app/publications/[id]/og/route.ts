import { NextResponse } from 'next/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { createClient as createServerClient } from '../../../../lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
])

/**
 * Public, same-origin Open Graph image endpoint for a published photo.
 * The social platforms fetch this URL instead of depending on direct access
 * to the underlying Supabase Storage URL.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const supabase = createAdminClient() ?? await createServerClient()

    if (!supabase) {
      return NextResponse.json({ error: 'Service temporairement indisponible' }, { status: 503 })
    }

    const { data: publication, error } = await supabase
      .from('niger_publications')
      .select('media_url,media_type')
      .eq('id', id)
      .eq('published', true)
      .eq('visibility', 'public')
      .maybeSingle()

    if (error || !publication || publication.media_type !== 'photo' || !publication.media_url) {
      return NextResponse.json({ error: 'Image de publication introuvable' }, { status: 404 })
    }

    const imageUrl = new URL(publication.media_url)
    const configuredSupabaseUrl =
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL

    // Only fetch images from the configured Supabase project. This prevents
    // the endpoint from becoming an arbitrary server-side URL proxy.
    if (
      imageUrl.protocol !== 'https:' ||
      !configuredSupabaseUrl ||
      imageUrl.hostname !== new URL(configuredSupabaseUrl).hostname
    ) {
      return NextResponse.json({ error: 'Source image non autorisée' }, { status: 400 })
    }

    const upstream = await fetch(imageUrl.toString(), {
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
      headers: { Accept: 'image/avif,image/webp,image/png,image/jpeg' },
      cache: 'no-store',
    })

    if (!upstream.ok) {
      return NextResponse.json({ error: 'Image source inaccessible' }, { status: 502 })
    }

    const contentType = (upstream.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()
    const declaredSize = Number(upstream.headers.get('content-length') || 0)

    if (!ALLOWED_IMAGE_TYPES.has(contentType) || (declaredSize && declaredSize > MAX_IMAGE_BYTES)) {
      return NextResponse.json({ error: 'Format ou taille d’image non pris en charge' }, { status: 415 })
    }

    const image = await upstream.arrayBuffer()
    if (!image.byteLength || image.byteLength > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'Image trop volumineuse' }, { status: 413 })
    }

    return new Response(image, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(image.byteLength),
        'Content-Disposition': 'inline',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        'X-Content-Type-Options': 'nosniff',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('[publications/og] Erreur de génération de l’image:', error)
    return NextResponse.json({ error: 'Impossible de générer l’aperçu' }, { status: 500 })
  }
}
