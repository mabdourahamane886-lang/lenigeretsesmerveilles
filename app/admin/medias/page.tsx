import Link from 'next/link'
import { createClient } from '../../../lib/supabase/server'
import { createMedia } from '../actions'

export default async function AdminMedias() {
  const supabase = await createClient()
  const [{ data: regions }, { data: wonders }, { data: media }] = supabase
    ? await Promise.all([
        supabase.from('niger_regions').select('id,name').order('name'),
        supabase.from('niger_wonders').select('id,name').order('name'),
        supabase.from('niger_media').select('id,title,url,credit,published,region_id,media_type,media_category').order('created_at',{ascending:false}),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }]

  return (
    <main className="section"><div className="container">
      <Link className="textlink" href="/admin">← Administration</Link>
      <div className="adminHero"><div><div className="kicker">Médias</div><h1>Galerie du Niger</h1><p className="muted">Les nouveaux médias envoyés depuis l’administration sont publiés sur Smooth Bundle pour une diffusion CDN rapide, tandis que Supabase conserve les métadonnées.</p></div></div>
      <form className="adminForm" action={createMedia} encType="multipart/form-data">
        <label>Titre<input required name="title" placeholder="Grande Mosquée d’Agadez" /></label>
        <label>Description<textarea name="description" rows={3} /></label>
        <label>Photo ou vidéo depuis ma galerie<input required type="file" name="image_file" accept="image/*,video/mp4,video/webm,video/quicktime,video/avi,video/x-matroska" /></label>
        <label>Ou URL du média<input name="url" placeholder="https://..." /></label>
        <label>Crédit / licence<input required name="credit" placeholder="Auteur — source — licence" /></label>
        <div className="formRow">
          <label>Type<select name="media_type"><option value="photo">Photo</option><option value="video">Vidéo</option></select></label>
          <label>Catégorie<select name="media_category"><option value="photo">Photo</option><option value="illustration">Illustration</option><option value="patrimoine">Patrimoine</option><option value="tourisme">Tourisme</option><option value="culture">Culture</option><option value="evenement">Événement</option></select></label>
        </div>
        <div className="formRow">
          <label>Région<select name="region_id"><option value="">Toutes</option>{(regions || []).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
          <label>Merveille<select name="wonder_id"><option value="">Aucune</option>{(wonders || []).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
        </div>
        <label className="check"><input type="checkbox" name="published" /> Publier immédiatement</label>
        <button className="btn primary">Envoyer sur Smooth Bundle</button>
      </form>
      <div className="grid" style={{marginTop:24}}>{(media || []).map((item) => <article className="card" key={item.id}>
        <div style={{aspectRatio:'16/9',overflow:'hidden',background:'#eee'}}>{item.media_type === 'video' ? <video src={item.url} controls preload="metadata" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <img src={item.url} alt={item.title} style={{width:'100%',height:'100%',objectFit:'cover'}} />}</div>
        <div className="cardbody"><span className="tag">{item.published?'Publié':'Brouillon'}</span><h3>{item.title}</h3><p className="muted">{item.credit}</p><a className="textlink" href={item.url} target="_blank" rel="noreferrer">Ouvrir le média direct ↗</a></div>
      </article>)}</div>
    </div></main>
  )
}
