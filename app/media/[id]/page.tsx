import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ExternalLink, Film, Image as ImageIcon } from 'lucide-react'
import Header from '../../../components/site/header'
import Footer from '../../../components/site/footer'
import Breadcrumbs from '../../../components/site/breadcrumbs'
import ShareButton from '../../../components/site/share-button'
import { JsonLd } from '../../../components/site/pro-meta'
import { createClient } from '../../../lib/supabase/server'

export const dynamic = 'force-dynamic'

const categoryLabels: Record<string, string> = {
  photo: 'Photographie',
  illustration: 'Illustration',
  patrimoine: 'Patrimoine',
  tourisme: 'Tourisme',
  culture: 'Culture',
  evenement: 'Événement',
}

function formatDate(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(date)
}

async function getMedia(id: string) {
  const supabase = await createClient()
  if (!supabase) return null
  const { data } = await supabase
    .from('niger_media')
    .select('id,title,description,url,credit,media_type,media_category,created_at')
    .eq('id', id)
    .eq('published', true)
    .maybeSingle()
  return data
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const item = await getMedia(id)
  if (!item) return { title: 'Média introuvable | Le Niger et ses Merveilles' }
  return {
    title: `${item.title} | Photothèque du Niger`,
    description: item.description || `Média documentaire du Niger : ${item.title}.`,
    openGraph: {
      title: item.title,
      description: item.description || `Média documentaire du Niger : ${item.title}.`,
      type: item.media_type === 'video' ? 'video.other' : 'article',
      images: item.media_type === 'video' ? undefined : [{ url: item.url, alt: item.title }],
    },
  }
}

export default async function MediaDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await getMedia(id)
  if (!item) notFound()

  const isVideo = item.media_type === 'video'
  const date = formatDate(item.created_at)
  const category = categoryLabels[item.media_category || ''] || item.media_category || 'Média'
  const detailUrl = `https://lenigeretsesmerveilles.vercel.app/media/${id}`
  const structuredType = isVideo ? 'VideoObject' : 'ImageObject'

  return (
    <>
      <Header />
      <main className="page">
        <div className="container narrowEvent">
          <Breadcrumbs items={[{ label: 'Photothèque', href: '/media' }, { label: item.title }]} />
          <JsonLd data={{ '@context': 'https://schema.org', '@type': structuredType, name: item.title, description: item.description || 'Média documentaire du Niger.', contentUrl: item.url, thumbnailUrl: isVideo ? undefined : item.url, creditText: item.credit || undefined, dateCreated: item.created_at || undefined, url: detailUrl }} />

          <figure className="proseCard mediaDetailCard" style={{ margin: 0 }}>
            <div className="mediaDetailVisual">
              {isVideo ? <video src={item.url} controls preload="metadata" aria-label={item.title} /> : <img src={item.url} alt={item.title} />}
            </div>
            <figcaption style={{ padding: '18px 4px 4px' }}>
              <div className="mediaDetailMeta"><span className="kicker">{isVideo ? <Film size={13} /> : <ImageIcon size={13} />} {isVideo ? 'Vidéo documentaire' : 'Photothèque documentaire'}</span><span className="mediaCategory">{category}</span>{date && <time dateTime={item.created_at}>{date}</time>}</div>
              <h1>{item.title}</h1>
              <p>{item.description || 'Média documentaire du Niger.'}</p>
              <p><strong>Crédit :</strong> {item.credit || 'Non renseigné'}</p>
            </figcaption>
          </figure>

          <div className="articleShare"><ShareButton title={item.title} />{item.url && <a className="proButton proButtonDark" href={item.url} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Ouvrir le média original</a>}</div>
          <div className="mediaDetailBack"><Link className="proBack" href="/media"><ArrowLeft size={15} /> Retour à la photothèque</Link><Link className="textlink" href="/media/explorer">Explorer les médias <ArrowRight size={14} /></Link></div>
        </div>
      </main>
      <Footer />
    </>
  )
}
