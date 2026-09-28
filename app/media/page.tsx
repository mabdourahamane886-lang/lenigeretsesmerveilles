import Link from 'next/link'
import { ArrowRight, Camera, Film, Image as ImageIcon } from 'lucide-react'
import Header from '../../components/site/header'
import Footer from '../../components/site/footer'
import { JsonLd } from '../../components/site/pro-meta'
import { createClient } from '../../lib/supabase/server'

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

export default async function MediaPage() {
  const supabase = await createClient()
  const { data: media } = supabase
    ? await supabase
        .from('niger_media')
        .select('id,title,description,url,credit,media_type,media_category,created_at')
        .eq('published', true)
        .order('created_at', { ascending: false })
    : { data: [] }

  const items = media ?? []
  const itemList = items.map((item, index) => ({
    '@type': item.media_type === 'video' ? 'VideoObject' : 'ImageObject',
    position: index + 1,
    name: item.title,
    description: item.description || 'Média documentaire du Niger.',
    contentUrl: item.url,
    url: `https://lenigeretsesmerveilles.vercel.app/media/${item.id}`,
    creditText: item.credit || undefined,
    dateCreated: item.created_at || undefined,
  }))

  return (
    <>
      <Header />
      <main className="page">
        <div className="container">
          <JsonLd
            data={{
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: 'Photothèque du Niger',
              description: 'Médias documentaires du Niger avec crédits, catégories et informations de publication.',
              url: 'https://lenigeretsesmerveilles.vercel.app/media',
              mainEntity: { '@type': 'ItemList', numberOfItems: items.length, itemListElement: itemList },
            }}
          />

          <div className="contentHeader contentHeaderLarge">
            <div>
              <span className="kicker">Photothèque</span>
              <h1>Voir le Niger.</h1>
              <p>Une collection de médias publics documentés, avec leur catégorie, leur date de publication et leur crédit.</p>
            </div>
            <div className="contentHeaderMark"><Camera size={24} /><span>{items.length} média{items.length > 1 ? 's' : ''} documenté{items.length > 1 ? 's' : ''}</span></div>
          </div>

          {!items.length ? (
            <div className="catalogEmpty large"><Camera size={25} /><div><strong>La photothèque est en cours de constitution.</strong><span>Les médias validés depuis l’administration apparaîtront ici.</span></div></div>
          ) : (
            <div className="galleryMasonry" aria-label="Médias publics du Niger">
              {items.map((item, index) => {
                const isVideo = item.media_type === 'video'
                const date = formatDate(item.created_at)
                const category = categoryLabels[item.media_category || ''] || item.media_category || 'Média'
                return (
                  <figure className={`galleryCard galleryCard-${index % 4}`} key={item.id}>
                    <div className="galleryMedia">
                      {isVideo ? (
                        <video src={item.url} controls preload="metadata" aria-label={item.title} />
                      ) : (
                        <img src={item.url} alt={item.title} loading={index < 3 ? 'eager' : 'lazy'} />
                      )}
                      <span className="galleryType">{isVideo ? <Film size={12} /> : <ImageIcon size={12} />}{isVideo ? 'Vidéo' : 'Photo'}</span>
                    </div>
                    <figcaption>
                      <div className="galleryMainMeta">
                        <div className="galleryTags"><span>{category}</span>{date && <time dateTime={item.created_at}>{date}</time>}</div>
                        <Link href={`/media/${item.id}`} className="galleryTitle">{item.title}</Link>
                        <span>{item.description || 'Média documentaire du Niger.'}</span>
                      </div>
                      <div className="galleryCredit">
                        <small>{item.credit || 'Crédit non renseigné'}</small>
                        <Link href={`/media/${item.id}`} aria-label={`Voir la fiche de ${item.title}`}><ArrowRight size={14} /></Link>
                      </div>
                    </figcaption>
                  </figure>
                )
              })}
            </div>
          )}

          <section className="proPhotoNotice"><Camera size={21} /><div><strong>Une image n’est jamais sans contexte.</strong><p>La plateforme conserve les crédits et les informations de licence pour les médias référencés.</p></div><Link className="textlink" href="/contribution">Proposer une image <ArrowRight size={15} /></Link></section>
        </div>
      </main>
      <Footer />
    </>
  )
}
