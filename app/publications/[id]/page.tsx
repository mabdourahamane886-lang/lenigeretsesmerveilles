import { cache } from 'react'
import { publicationPreview } from '../../../lib/publications/photo'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MapPin } from 'lucide-react'
import Breadcrumbs from '../../../components/site/breadcrumbs'
import ShareButton from '../../../components/site/share-button'
import { normalizePublicationContent, getPublicationTitle } from '../../../lib/publications/format'
import { createAdminClient } from '../../../lib/supabase/admin'
import { createClient as createServerClient } from '../../../lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://lenigeretsesmerveilles-ngr.vercel.app').replace(/\/$/, '')

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isValidPublicationId(id: string) {
  return UUID_PATTERN.test(id)
}

const getPublicPublication = cache(async (id: string) => {
  // Never send malformed route parameters to PostgreSQL UUID columns.
  if (!isValidPublicationId(id)) return null

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
})

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
  const description = normalizePublicationContent(publication.content).replace(/\s+/g, ' ').slice(0, 180) ||
    'Découvrez cette publication sur Le Niger et ses Merveilles.'
  const previewImage = publicationPreview(publication.media_url, publication.media_type, baseUrl)
  const canonicalUrl = `${baseUrl}/publications/${publication.id}`
  const publicationTags = [
    publication.location,
    publication.mood,
    publication.activity,
    ...(publication.tagged_people || []),
  ].filter((tag): tag is string => Boolean(tag))
  const validPublishedDate = publication.published_at && !Number.isNaN(new Date(publication.published_at).getTime())
    ? publication.published_at
    : undefined

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    authors: [{ name: publication.author_name || 'Le Niger et ses Merveilles' }],
    category: publication.location || 'Culture du Niger',
    keywords: [...new Set(['Niger', 'Le Niger et ses Merveilles', 'publication', ...publicationTags])],
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      title,
      description,
      siteName: 'Le Niger et ses Merveilles',
      locale: 'fr_FR',
      publishedTime: validPublishedDate,
      authors: [publication.author_name || 'Le Niger et ses Merveilles'],
      section: publication.location || 'Publications',
      tags: publicationTags.length ? publicationTags : ['Niger', 'Culture'],
      images: [{
        url: previewImage,
        secureUrl: previewImage,
        ...(previewImage.endsWith('/partage.jpg') ? { type: 'image/jpeg' } : {}),
        alt: title,
      }],
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
  const content = normalizePublicationContent(publication.content)
  const description = normalizePublicationContent(publication.content).replace(/\s+/g, ' ').slice(0, 180) ||
    'Découvrez cette publication sur Le Niger et ses Merveilles.'
  const canonicalUrl = `${baseUrl}/publications/${publication.id}`
  const socialImage = publicationPreview(publication.media_url, publication.media_type, baseUrl)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: canonicalUrl,
    datePublished: publication.published_at || undefined,
    author: {
      '@type': 'Organization',
      name: publication.author_name || 'Le Niger et ses Merveilles',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Le Niger et ses Merveilles',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/icon.svg`,
      },
    },
    image: [socialImage],
    inLanguage: 'fr-FR',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
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

            <h1 className="publicationScreenReaderTitle">{title}</h1>

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
