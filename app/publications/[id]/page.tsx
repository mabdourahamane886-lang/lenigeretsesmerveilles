import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MapPin } from 'lucide-react'
import Breadcrumbs from '../../../components/site/breadcrumbs'
import ShareButton from '../../../components/site/share-button'
import { getPublicationBody, getPublicationTitle, normalizePublicationContent } from '../../../lib/publications/format'
import { createAdminClient } from '../../../lib/supabase/admin'
import { createClient as createServerClient } from '../../../lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const baseUrl = 'https://lenigeretsesmerveilles-ngr.vercel.app'

async function getPublicPublication(id: string) {
  const supabase = createAdminClient() ?? await createServerClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('niger_publications')
    .select('id,author_name,content,media_url,media_type,music_url,tagged_people,location,mood,activity,allow_messages,published,published_at,visibility')
    .eq('id', id)
    .eq('published', true)
    .eq('visibility', 'public')
    .maybeSingle()

  if (error) {
    console.error('[publications/detail] Erreur de chargement:', error.message)
    return null
  }

  return data
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const publication = await getPublicPublication(id)

  if (!publication) {
    return { title: 'Publication introuvable' }
  }

  const title = getPublicationTitle(publication.content)
  const description = normalizePublicationContent(publication.content).slice(0, 160) ||
    'Découvrez cette publication sur Le Niger et ses Merveilles.'
  // Always serve publication previews through our own public URL. This avoids
  // social crawlers failing on storage URLs, redirects, or storage permissions.
  const previewImage = publication.media_url && publication.media_type === 'photo'
    ? `${baseUrl}/publications/${publication.id}/og`
    : `${baseUrl}/opengraph-image`

  return {
    title,
    description,
    alternates: { canonical: `${baseUrl}/publications/${publication.id}` },
    openGraph: {
      type: 'article',
      url: `${baseUrl}/publications/${publication.id}`,
      title,
      description,
      siteName: 'Le Niger et ses Merveilles',
      images: [{ url: previewImage, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [previewImage],
    },
  }
}

function formatDate(value?: string | null) {
  if (!value) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default async function PublicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const publication = await getPublicPublication(id)

  if (!publication) notFound()

  const title = getPublicationTitle(publication.content)
  const content = getPublicationBody(publication.content)

  return (
    <>
      <main className="page">
        <div className="container narrowEvent">
          <Breadcrumbs items={[
            { label: 'Publications', href: '/publications' },
            { label: title },
          ]} />

          <article className="proseCard articleProse">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div className="publicationAvatar" aria-hidden="true">NM</div>
              <div>
                <strong>{publication.author_name || 'Le Niger et ses Merveilles'}</strong>
                <div className="muted">{formatDate(publication.published_at)}</div>
              </div>
            </div>

            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', lineHeight: 1.25, margin: '0 0 18px' }}>{title}</h1>

            {content && (
              <div className="prose publicationDetailBody">
                {content.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}

            {publication.media_url && publication.media_type === 'photo' && (
              <img
                src={publication.media_url}
                alt={title}
                fetchPriority="high"
                style={{ width: '100%', borderRadius: 14, marginTop: 16, objectFit: 'cover' }}
              />
            )}
            {publication.media_url && publication.media_type === 'video' && (
              <video
                src={publication.media_url}
                controls
                preload="metadata"
                style={{ width: '100%', borderRadius: 14, marginTop: 16 }}
              />
            )}
            {publication.music_url && (
              <audio src={publication.music_url} controls preload="metadata" style={{ width: '100%', marginTop: 16 }} />
            )}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
              {publication.location && <span className="tag"><MapPin size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> {publication.location}</span>}
              {publication.mood && <span className="tag">{publication.mood}</span>}
              {publication.activity && <span className="tag">{publication.activity}</span>}
              {publication.tagged_people?.length ? (
                <span className="tag">{publication.tagged_people.join(', ')}</span>
              ) : null}
            </div>

            {publication.allow_messages && (
              <p className="muted" style={{ marginTop: 16 }}>💬 Cette publication accepte les messages.</p>
            )}

            <div className="articleShare" style={{ marginTop: 24 }}>
              <ShareButton title={title} />
            </div>
          </article>
        </div>
      </main>
      
    </>
  )
}
