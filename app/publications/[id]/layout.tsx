import type { Metadata } from 'next'
import { createAdminClient } from '../../../lib/supabase/admin'

const siteUrl = 'https://lenigeretsesmerveilles.vercel.app'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = createAdminClient()
  const { data: publication } = supabase
    ? await supabase
        .from('niger_publications')
        .select('author_name,content,media_url,media_type,published_at')
        .eq('id', id)
        .eq('published', true)
        .eq('visibility', 'public')
        .maybeSingle()
    : { data: null }

  if (!publication) {
    return {
      title: 'Publication introuvable',
      robots: { index: false, follow: false },
    }
  }

  const title = (publication.content || 'Publication').replace(/\s+/g, ' ').trim().slice(0, 90)
  const description = (publication.content || 'Découvrez les actualités du Niger et ses Merveilles.')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200)
  const image = publication.media_type === 'photo' ? publication.media_url : undefined
  const url = `${siteUrl}/publications/${id}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      siteName: 'Le Niger et ses Merveilles',
      locale: 'fr_FR',
      title,
      description,
      publishedTime: publication.published_at || undefined,
      authors: [publication.author_name || 'Le Niger et ses Merveilles'],
      images: image ? [{ url: image, alt: title }] : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default function PublicationLayout({ children }: { children: React.ReactNode }) {
  return children
}
