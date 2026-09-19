import Link from 'next/link'
import { ArrowRight, CalendarDays, MapPin, Send } from 'lucide-react'
import Header from '../../components/site/header'
import Footer from '../../components/site/footer'
import { createClient } from '../../lib/supabase/server'
import { nigerMedia } from '../../data/media'

export const dynamic = 'force-dynamic'

function formatEventDate(value?: string | null) {
  if (!value) return null
  return new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(value))
}

export default async function EvenementsPage() {
  const supabase=await createClient()
  const {data:events}=supabase
    ? await supabase.from('niger_events').select('id,name,slug,city,starts_at,ends_at,description,location,image_url,published').eq('published',true).order('starts_at',{ascending:true})
    : {data:null}

  const featured = events && events.length > 0 ? events[0] : null

  return (
    <>
      <Header />
      <main className="page">
        <div className="container">
          <div className="contentHeader contentHeaderLarge">
            <div><span className="kicker">Agenda du Niger</span><h1>Les rendez-vous qui font vivre le pays.</h1><p>Festivals, rencontres, cérémonies et événements publiés sur la plateforme.</p></div>
            <div className="contentHeaderMark"><CalendarDays size={24}/><span>Agenda culturel</span></div>
          </div>

          {!featured ? (
            <div className="catalogEmpty large"><CalendarDays size={25}/><div><strong>L’agenda se prépare.</strong><span>Les prochains événements publiés apparaîtront ici.</span></div><Link className="proButton proButtonDark" href="/contribution">Proposer un événement <Send size={15}/></Link></div>
          ) : (
            <>
              <section className="featuredEvent">
                <div className="featuredEventImage" style={{backgroundImage:'url(' + (featured.image_url || nigerMedia.niamey.image) + ')'}}><span className="catalogPill">À venir</span></div>
                <div className="featuredEventBody">
                  <span className="kicker">{featured.city || 'Niger'}{featured.location ? ' · ' + featured.location : ''}</span>
                  <h2>{featured.name}</h2>
                  <div className="featuredEventDate"><strong>{featured.starts_at ? new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short'}).format(new Date(featured.starts_at)) : '—'}</strong><span>{formatEventDate(featured.starts_at) || 'Date à confirmer'}</span></div>
                  <p>{featured.description || 'Découvrez les informations et le programme de cet événement.'}</p>
                  <Link className="proButton proButtonDark" href={'/evenements/' + featured.slug}>Voir l’événement <ArrowRight size={15}/></Link>
                </div>
              </section>

              {events.length>1 && <section className="catalogSection">
                <div className="contentHeader"><div><span className="kicker">Programmation</span><h2>Les autres rendez-vous.</h2></div></div>
                <div className="eventList">{events.slice(1).map(event=><Link href={'/evenements/' + event.slug} className="eventListRow" key={event.id}><div className="eventListDate"><strong>{event.starts_at ? new Intl.DateTimeFormat('fr-FR',{day:'2-digit'}).format(new Date(event.starts_at)) : '—'}</strong><span>{event.starts_at ? new Intl.DateTimeFormat('fr-FR',{month:'short'}).format(new Date(event.starts_at)) : ''}</span></div><div><span className="kicker">{event.city || 'Niger'}</span><h3>{event.name}</h3><p>{event.description || 'Informations sur ce rendez-vous.'}</p></div><ArrowRight size={17}/></Link>)}</div>
              </section>}
            </>
          )}

          <section className="proPhotoNotice"><MapPin size={20}/><div><strong>Un événement manque à l’agenda ?</strong><p>Partagez les informations. Une vérification est effectuée avant publication.</p></div><Link href="/contribution" className="textlink">Proposer <ArrowRight size={14}/></Link></section>
        </div>
      </main>
      <Footer />
    </>
  )
}
