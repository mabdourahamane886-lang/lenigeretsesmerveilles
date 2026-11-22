import { adminDatabase } from '../../../lib/admin/database'
import Link from 'next/link'
import { createRegion } from '../actions'

export default async function AdminRegions() {
  const db = await adminDatabase()
  const [{data: regions}] = await Promise.all([
    db.from('niger_regions').select('id,name,slug,description,cover_url').order('name', {ascending:true}).throwOnError(),
  ])
  return <main className="section"><div className="container"><Link className="textlink" href="/admin">← Administration</Link><div className="adminHero"><div><span className="kicker">Régions</span><h1>Les 8 régions du Niger</h1><p className="muted">Ajoute et mets à jour les fiches régionales.</p></div></div><form className="adminForm" action={createRegion}><label>Nom<input required name="name" placeholder="Agadez" /></label><label>Description<textarea name="description" rows={4}/></label><label>Photo du Niger<input name="cover_url" placeholder="URL d'une photo authentique du Niger" /></label><button className="btn primary">Enregistrer la région</button></form><div className="grid">{(regions || []).map(r=><article className="card" key={r.id}><div className="cardbody"><span className="tag">{r.slug}</span><h3>{r.name}</h3><p>{r.description || 'Aucune description.'}</p></div></article>)}</div></div></main>
}
