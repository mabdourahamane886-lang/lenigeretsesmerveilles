import type { Metadata } from 'next'
import { regions } from '../../../data/regions'
import { createClient } from '../../../lib/supabase/server'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const fallback = regions.find((region) => region.slug === slug)
  const supabase = await createClient()
  const { data } = supabase
    ? await supabase.from('niger_regions').select('name,description,cover_url').eq('slug', slug).maybeSingle()
    : { data: null }

  const name = data?.name || fallback?.name || 'Région du Niger'
  const rawDescription = data?.description || fallback?.description || 'Découvrez le patrimoine, la culture et les paysages de cette région du Niger.'
  const description = rawDescription.replace(/\\s+/g, ' ').slice(0, 155)
  const image = data?.cover_url || fallback?.image
  const title = `${name} : patrimoine, culture et tourisme au Niger`

  return {
    title,
    description,
    alternates: { canonical: `/regions/${slug}` },
    openGraph: {
      type: 'article',
      locale: 'fr_FR',
      title,
      description,
      url: `/regions/${slug}`,
      siteName: 'Le Niger et ses Merveilles',
      images: image ? [{ url: image, alt: `Découvrir la région de ${name}, au Niger` }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
