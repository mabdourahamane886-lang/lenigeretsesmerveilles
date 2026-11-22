import { adminDatabase } from '../../../lib/admin/database'
import Link from 'next/link'
import EventForm from './event-form'

export default async function AdminEvenements() {
  const db = await adminDatabase()
  const [{data: regionOptions}, {data: events}] = await Promise.all([
    db.from('niger_regions').select('id,name').order('name', {ascending:true}).throwOnError(),
    db.from('niger_events').select('id,name,slug,city,published,starts_at').order('starts_at', {ascending:true}).throwOnError(),
  ])
  return <main className="section"><div className="container">
    <Link className="textlink" href="/admin">← Administration</Link>
    <div className="adminHero"><div><span className="kicker">Événements</span><h1>Festivals et rendez-vous</h1></div></div>
    <EventForm regions={regionOptions} />
    <div className="grid">{(events || []).map(e => <article className="card" key={e.id}><div className="cardbody"><span className="tag">{e.published ? 'Publié' : 'Brouillon'}</span><h3>{e.name}</h3><p>{e.city || ''}</p>{e.published && e.slug && <Link className="textlink" href={'/evenements/' + e.slug}>Voir et partager →</Link>}</div></article>)}</div>
  </div></main>
}
