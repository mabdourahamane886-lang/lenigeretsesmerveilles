import Link from 'next/link'
import { createClient } from '../../../lib/supabase/server'
import EventForm from './event-form'

export default async function AdminEvenements() {
  const s = await createClient()
  const [{ data: regions }, { data: events }] = s
    ? await Promise.all([
        s.from('niger_regions').select('id,name').order('name'),
        s.from('niger_events').select('id,name,slug,city,published,starts_at').order('starts_at', { ascending: true }),
      ])
    : [{ data: [] }, { data: [] }]

  return <main className="section"><div className="container">
    <Link className="textlink" href="/admin">← Administration</Link>
    <div className="adminHero"><div><span className="kicker">Événements</span><h1>Festivals et rendez-vous</h1></div></div>
    <EventForm regions={regions || []} />
    <div className="grid">{(events || []).map(e => <article className="card" key={e.id}><div className="cardbody"><span className="tag">{e.published ? 'Publié' : 'Brouillon'}</span><h3>{e.name}</h3><p>{e.city || ''}</p>{e.published && e.slug && <Link className="textlink" href={'/evenements/' + e.slug}>Voir et partager →</Link>}</div></article>)}</div>
  </div></main>
}
