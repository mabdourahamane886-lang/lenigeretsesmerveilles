import Link from 'next/link'
import { createRegion } from '../actions'
import { createClient } from '../../../lib/supabase/server'

export default async function AdminRegions() {
  const supabase = await createClient()
  const { data: regions } = supabase ? await supabase.from('niger_regions').select('id,name,slug,description,cover_url').order('name') : { data: [] }
  return <main className="section"><div className="container"><Link className="textlink" href="/admin">← Administration</Link><div className="adminHero"><div><span className="kicker">Régions</span><h1>Les 8 régions du Niger</h1><p className="muted">Ajoute et mets à jour les fiches régionales.</p></div></div><form className="adminForm" action={createRegion}><label>Nom<input required name="name" placeholder="Agadez" /></label><label>Description<textarea name="description" rows={4}/></label><label>Photo du Niger<input name="cover_url" placeholder="URL d'une photo authentique du Niger" /></label><button className="btn primary">Enregistrer la région</button></form><div className="grid">{(regions || []).map(r=><article className="card" key={r.id}><div className="cardbody"><span className="tag">{r.slug}</span><h3>{r.name}</h3><p>{r.description || 'Aucune description.'}</p></div></article>)}</div></div></main>
}
