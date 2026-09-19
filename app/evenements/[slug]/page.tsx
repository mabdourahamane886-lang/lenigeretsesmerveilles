import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '../../../components/site/header'
import Footer from '../../../components/site/footer'
import { createClient } from '../../../lib/supabase/server'
import { nigerMedia } from '../../../data/media'

export const dynamic = 'force-dynamic'

function formatDate(value?: string | null) {
  if (!value) return 'Date à confirmer'
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(value))
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  if (!supabase) notFound()

  const { data: event } = await supabase
    .from('niger_events')
    .select('id,name,slug,city,starts_at,ends_at,description,program,location,image_url,published')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (!event) notFound()

  return (
    <>
      <Header />
      <main className="page">
        <div className="container narrowEvent">
          <Link className="back" href="/evenements">← Retour à l’agenda</Link>

          <div className="eventHero" style={{ backgroundImage: `linear-gradient(180deg,rgba(5,45,32,.08),rgba(5,45,32,.92)),url(${event.image_url || nigerMedia.niamey.image})` }}>
            <span className="tag tagLight">🇳🇪 Événement au Niger</span>
            <h1>{event.name}</h1>
            <p>{event.city || 'Niger'}{event.location ? ` · ${event.location}` : ''}</p>
          </div>

          <div className="eventDetailGrid">
            <section className="detailCard">
              <span className="kicker">Date & heure</span>
              <h2>{formatDate(event.starts_at)}</h2>
              {event.ends_at && <p className="muted">Fin : {formatDate(event.ends_at)}</p>}
            </section>
            <section className="detailCard">
              <span className="kicker">Lieu</span>
              <h2>{event.location || event.city || 'À confirmer'}</h2>
              <p className="muted">Informations fournies par l’organisation de l’événement.</p>
            </section>
          </div>

          <section className="contentCard">
            <div className="kicker">Présentation</div>
            <h2>À propos de l’événement</h2>
            <p>{event.description || 'Aucune présentation détaillée disponible.'}</p>
          </section>

          {event.program && (
            <section className="contentCard">
              <div className="kicker">Programme</div>
              <h2>Programme</h2>
              <div className="prose">{event.program}</div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
