import { adminDatabase } from '../../../lib/admin/database'
import Link from 'next/link'
import { createCulture } from '../actions'

export default async function AdminCultures() {
  const db = await adminDatabase()
  const [{data: regions}, {data: cultures}] = await Promise.all([
    db.from('niger_regions').select('id,name').order('name', {ascending:true}).throwOnError(),
    db.from('niger_cultures').select('id,title,published,cover_url').order('created_at', {ascending:false}).throwOnError(),
  ])
  return <main className="section"><div className="container"><Link className="textlink" href="/admin">← Administration</Link><div className="adminHero"><div><span className="kicker">Cultures</span><h1>Peuples, traditions et patrimoine</h1></div></div><form className="adminForm" action={createCulture}><label>Titre<input required name="title" placeholder="Culture et traditions…"/></label><label>Région<select name="region_id"><option value="">Choisir</option>{(regions||[]).map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label><label>Langue<input name="language"/></label><label>Traditions<textarea name="traditions" rows={4}/></label><label>Vêtements<textarea name="clothing" rows={3}/></label><label>Gastronomie<textarea name="gastronomy" rows={3}/></label><label>Musique et danses<textarea name="music_dance" rows={3}/></label><label>Artisanat<textarea name="crafts" rows={3}/></label><label>Fêtes<textarea name="festivals" rows={3}/></label><label>Histoire<textarea name="history" rows={5}/></label><label>Photo du Niger<input name="cover_url" placeholder="URL d'une photo authentique du Niger"/></label><label className="check"><input type="checkbox" name="published"/> Publier</label><button className="btn primary">Enregistrer la culture</button></form><div className="grid">{(cultures||[]).map(c=><article className="card" key={c.id}><div className="cardbody"><span className="tag">{c.published?'Publié':'Brouillon'}</span><h3>{c.title}</h3></div></article>)}</div></div></main>
}
