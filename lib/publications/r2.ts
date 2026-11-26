import 'server-only'
import { getCloudflareContext } from '@opennextjs/cloudflare'

type StoredPhoto = { body: ReadableStream<Uint8Array>; httpMetadata?: { contentType?: string }; httpEtag: string }
type MediaBucket = {
  put(key: string, value: ArrayBuffer, options: { httpMetadata: { contentType: string } }): Promise<unknown>
  head(key: string): Promise<unknown | null>
  get(key: string): Promise<StoredPhoto | null>
  delete(key: string): Promise<void>
}

export async function publicationBucket(): Promise<MediaBucket | null> {
  try {
    const { env } = await getCloudflareContext({ async: true })
    return (env as unknown as { NIGER_MEDIA?: MediaBucket }).NIGER_MEDIA ?? null
  } catch { return null }
}

export const publicationKey = (path: string) => 'Niger-media/' + path
export const publicationPhotoPattern = /^publications\/photos\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/(?:photo\.(?:jpg|png|webp|avif|gif)|partage\.jpg)$/
