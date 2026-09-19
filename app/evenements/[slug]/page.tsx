import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CalendarDays, Clock3, MapPin, Share2 } from 'lucide-react'
import Header from '../../../components/site/header'
import Footer from '../../../components/site/footer'
import { createClient } from '../../../lib/supabase/server'
import { nigerMedia } from '../../../data/media'
import ShareButton from '../../../components/site/share-button'

export const dynamic='force-dynamic'

function formatDate(value?:string|null){
  if(!value) return 'Date à confirmer'
  return new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(value))
}

export default async function EventDetailPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params
  const supabase=await createClient()
  if(!supabase) notFound()
  const {data:event}=await supabase.from('niger_events').select('id,name,slug,city,starts_at,ends_at,description,program,location,image_url,published').eq('slug',slug).eq('published',true).maybeSingle()
  if(!event) notFound()

  return (
    <>
      <Header />
      <main className="page">
        <div className="container narrowEvent">
          <Link className="proBack" href="/evenements"><ArrowLeft size={15}/> Retour à l’agenda</Link>
          <article className="proDetailHero" style={{backgroundImage:'linear-gradient(180deg,rgba(4,39,27,.03),rgba(4,39,27,.90)),url(' + (event.image_url || nigerMedia.niamey.image) + ')'}}>
            <span className="catalogPill">🇳🇪 Événement au Niger</span>
            <h1>{event.name}</h1>
            <div className="proDetailHeroMeta"><span><MapPin size={14}/>{event.city || 'Niger'}{event.location ? ' · ' + event.location : ''}</span><span><CalendarDays size={14}/>{event.starts_at ? new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(event.starts_at)) : 'Date à confirmer'}</span></div>
          </article>
          <div className="eventInfoGrid">
            <section className="eventInfoCard"><Clock3 size={18}/><div><span>Date & heure</span><strong>{formatDate(event.starts_at)}</strong>{event.ends_at && <small>Fin : {formatDate(event.ends_at)}</small>}</div></section>
            <section className="eventInfoCard"><MapPin size={18}/><div><span>Lieu</span><strong>{event.location || event.city || 'À confirmer'}</strong><small>Informations fournies par l’organisation.</small></div></section>
            <section className="eventInfoCard"><Share2 size={18}/><div><span>Événement</span><strong>À partager</strong><small>Cette page possède un lien public unique.</small><ShareButton title={event.name}/></div></section>
          </div>
          <section className="proseCard"><span className="kicker">Présentation</span><h2>À propos de l’événement</h2><p>{event.description || 'Aucune présentation détaillée disponible.'}</p></section>
          {event.program && <section className="proseCard"><span className="kicker">Programme</span><h2>Le programme</h2><div className="prose">{event.program}</div></section>}
        </div>
      </main>
      <Footer />
    </>
  )
}
