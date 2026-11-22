import { adminDatabase } from '../../../lib/admin/database'
import Link from 'next/link'
import AdForm from './ad-form'

export default async function AdminPublicites() {
  const db = await adminDatabase()
  const [{data: ads}] = await Promise.all([
    db.from('niger_advertisements').select('id,name,title,placement,active,starts_at,ends_at,impressions,clicks').order('created_at', {ascending:false}).throwOnError(),
  ])
  return <main className="section"><div className="container">
    <Link className="textlink" href="/admin">← Administration</Link>
    <div className="adminHero"><div><span className="kicker">Publicités</span><h1>Gestion des campagnes</h1><p className="muted">Crée, active et programme les campagnes affichées sur la plateforme.</p></div></div>
    <AdForm />
    <section className="adminList"><div className="sectionHead"><div><div className="kicker">Campagnes</div><h2>Campagnes enregistrées</h2></div></div>
      {!ads?.length ? <p className="muted">Aucune campagne pour le moment.</p> : <div className="adminRows">{ads.map(ad => <div className="adminRow" key={ad.id}><div><b>{ad.name}</b><span className="muted">{ad.title} · {ad.placement} · {ad.active ? 'Active' : 'Inactive'}</span></div><span>{ad.impressions ?? 0} vues · {ad.clicks ?? 0} clics</span></div>)}</div>}
    </section>
  </div></main>
}
