import Link from 'next/link'
import Header from '../../components/site/header'
import Footer from '../../components/site/footer'
import { createClient } from '../../lib/supabase/server'
import { nigerMedia } from '../../data/media'

export const dynamic = 'force-dynamic'

function formatEventDate(value?: string | null) {
  if (!value) return null
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(value))
}

export default async function EvenementsPage() {
  const supabase = await createClient()
  const { data: events } = supabase
    ? await supabase
        .from('niger_events')
        .select('id,name,slug,city,starts_at,ends_at,description,program,location,image_url,published')
        .eq('published', true)
        .order('starts_at', { ascending: true })
    : { data: null }

  return (
    <>
      <Header />
      <main className="page">
        <div className="container">
          <div className="kicker">Agenda du Niger</div>
          <h1>Événements & rendez-vous</h1>
          <p className="lead">Retrouvez les événements culturels, rencontres, festivals et rendez-vous annoncés sur la plateforme.</p>

          {!events?.length ? (
            <div className="emptyState">
              <span className="emptyIcon">✦</span>
              <div>
                <h2>L’agenda se prépare</h2>
                <p className="muted">Les prochains événements publiés par l’administration apparaîtront ici.</p>
                <Link className="btn primary" href="/contribution">Proposer une information</Link>
              </div>
            </div>
          ) : (
            <div className="eventGrid">
              {events.map((event) => (
                <article className="eventCard" key={event.id}>
                  <div className="eventImage" style={{ backgroundImage: `url(${event.image_url || nigerMedia.niamey.image})` }}>
                    <span className="eventBadge">🇳🇪 Niger</span>
                    <span className="eventDate">{formatEventDate(event.starts_at) || 'Date à confirmer'}</span>
                  </div>
                  <div className="eventBody">
                    <div className="eventMeta">{event.city || 'Niger'}{event.location ? ` · ${event.location}` : ''}</div>
                    <h2>{event.name}</h2>
                    <p>{event.description || 'Découvrez les informations et le programme de cet événement.'}</p>
                    <Link className="cardLink" href={`/evenements/${event.slug}`}>Voir l’événement <span>→</span></Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
