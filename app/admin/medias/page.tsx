import Link from 'next/link'
import { createClient } from '../../../lib/supabase/server'
import { createMedia } from '../actions'

export default async function AdminMedias() {
  const supabase = await createClient()
  const [{ data: regions }, { data: wonders }, { data: media }] = supabase
    ? await Promise.all([
        supabase.from('niger_regions').select('id,name').order('name'),
        supabase.from('niger_wonders').select('id,name').order('name'),
        supabase.from('niger_media').select('id,title,url,credit,published').order('created_at',{ascending:false}),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }]

  return (
    <main className="section"><div className="container">
      <Link className="textlink" href="/admin">← Administration</Link>
      <div className="adminHero"><div><div className="kicker">Médias</div><h1>Photothèque du Niger</h1><p className="muted">Ajoutez uniquement des images dont la source et les droits sont documentés.</p></div></div>
      <form className="adminForm" action={createMedia}>
        <label>Titre<input required name="title" placeholder="Grande Mosquée d’Agadez" /></label>
        <label>Description<textarea name="description" rows={3} /></label>
        <label>URL de l’image<input required name="url" placeholder="https://commons.wikimedia.org/..." /></label>
        <label>Crédit / licence<input required name="credit" placeholder="Auteur — Wikimedia Commons — CC BY-SA 4.0" /></label>
        <div className="formRow">
          <label>Région<select name="region_id"><option value="">Aucune</option>{(regions || []).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
          <label>Merveille<select name="wonder_id"><option value="">Aucune</option>{(wonders || []).map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select></label>
        </div>
        <label className="check"><input type="checkbox" name="published" /> Publier</label>
        <button className="btn primary">Enregistrer le média</button>
      </form>
      <div className="adminRows" style={{marginTop:24}}>{(media || []).map((item) => <div className="adminRow" key={item.id}><div><b>{item.title}</b><span className="muted">{item.credit} · {item.published ? 'Publié' : 'Brouillon'}</span></div><a href={item.url} target="_blank" rel="noreferrer">Ouvrir ↗</a></div>)}</div>
    </div></main>
  )
}
