import Link from 'next/link'
import { createClient } from '../../../lib/supabase/server'
import { createMedia } from '../actions'

export default async function AdminMedias() {
  const supabase = await createClient()
  const [{ data: regions }, { data: wonders }, { data: media }] = supabase
    ? await Promise.all([
        supabase.from('niger_regions').select('id,name').order('name'),
        supabase.from('niger_wonders').select('id,name').order('name'),
        supabase.from('niger_media').select('id,title,url,credit,published,region_id').order('created_at',{ascending:false}),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }]

  return (
    <main className="section"><div className="container">
      <Link className="textlink" href="/admin">← Administration</Link>
      <div className="adminHero"><div><div className="kicker">Médias</div><h1>Galerie du Niger</h1><p className="muted">Choisis directement des photos depuis ta galerie. Elles sont enregistrées dans le stockage sécurisé et leur URL publique est affichée directement.</p></div></div>
      <form className="adminForm" action={createMedia} encType="multipart/form-data">
        <label>Titre<input required name="title" placeholder="Grande Mosquée d’Agadez" /></label>
        <label>Description<textarea name="description" rows={3} /></label>
        <label>Photo depuis ma galerie<input required type="file" name="image_file" accept="image/*" /></label>
        <label>Ou URL de l’image<input name="url" placeholder="https://..." /></label>
        <label>Crédit / licence<input required name="credit" placeholder="Auteur — source — licence" /></label>
        <div className="formRow">
          <label>Catégorie<select name="media_category"><option value="photo">Photo</option><option value="illustration">Illustration</option><option value="patrimoine">Patrimoine</option><option value="tourisme">Tourisme</option></select></label>
          <label>Région<select name="region_id"><option value="">Toutes</option>{(regions || []).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
        </div>
        <label>Merveille<select name="wonder_id"><option value="">Aucune</option>{(wonders || []).map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select></label>
        <label className="check"><input type="checkbox" name="published" /> Publier immédiatement</label>
        <button className="btn primary">Enregistrer dans la galerie</button>
      </form>
      <div className="grid" style={{marginTop:24}}>{(media || []).map((item) => <article className="card" key={item.id}>
        <div style={{aspectRatio:'16/9',overflow:'hidden',background:'#eee'}}><img src={item.url} alt={item.title} style={{width:'100%',height:'100%',objectFit:'cover'}} /></div>
        <div className="cardbody"><span className="tag">{item.published?'Publié':'Brouillon'}</span><h3>{item.title}</h3><p className="muted">{item.credit}</p><a className="textlink" href={item.url} target="_blank" rel="noreferrer">Ouvrir l’image directe ↗</a></div>
      </article>)}</div>
    </div></main>
  )
}
