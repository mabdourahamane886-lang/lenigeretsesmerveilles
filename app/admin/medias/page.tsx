import Link from 'next/link'
import { createClient } from '../../../lib/supabase/server'
import { createMedia } from '../actions'
import MediaPicker from './media-picker'

type OptionRow = { id: string; name: string }
type MediaRow = {
 id: string
 title: string
 url: string
 credit: string
 published: boolean
 region_id: string | null
 media_type: 'photo' | 'video'
 media_category: string | null
 created_at: string
}

export default async function AdminMedias({ searchParams }: { searchParams?: Promise<{ error?: string; success?: string }> }){
 const params = searchParams ? await searchParams : {}
 const errorMessage = params.error || ''
 const successMessage = params.success === '1' ? 'Média publié avec succès dans la galerie.' : ''
 let regions:OptionRow[]=[]
 let wonders:OptionRow[]=[]
 let media:MediaRow[]=[]
 try {
  const supabase=await createClient()
  if(supabase){
   const results=await Promise.allSettled([
    supabase.from('niger_regions').select('id,name').order('name'),
    supabase.from('niger_wonders').select('id,name').order('name'),
    supabase.from('niger_media').select('id,title,url,credit,published,region_id,media_type,media_category,created_at').order('created_at',{ascending:false}),
   ])
   if(results[0].status==='fulfilled'&&!results[0].value.error) regions=results[0].value.data||[]
   if(results[1].status==='fulfilled'&&!results[1].value.error) wonders=results[1].value.data||[]
   if(results[2].status==='fulfilled'&&!results[2].value.error) media=results[2].value.data||[]
  }
 } catch {
  // La page reste rendable avec des listes vides si une lecture échoue.
 }
 return <main className="section"><div className="container" style={{paddingBottom:100}}>
  <Link className="textlink" href="/admin">← Administration</Link>
  {errorMessage && <div role="alert" style={{margin:'16px 0',padding:'14px 16px',borderRadius:12,background:'#fff1f0',border:'1px solid #f3b7b2',color:'#9b1c1c',fontWeight:700}}>⚠️ {errorMessage}</div>}
  {successMessage && <div role="status" style={{margin:'16px 0',padding:'14px 16px',borderRadius:12,background:'#eefbf3',border:'1px solid #b7e4c7',color:'#176b3a',fontWeight:700}}>✅ {successMessage}</div>}
  <div className="adminHero"><div><span className="kicker">Médias</span><h1>Galerie du Niger</h1><p className="muted">Ajoute une photo ou une vidéo depuis la galerie de ton téléphone, comme dans WhatsApp. Le média est prévisualisé avant publication.</p></div></div>
  <form className="adminForm" action={createMedia} encType="multipart/form-data">
   <label>Titre<input required name="title" placeholder="Grande Mosquée d’Agadez"/></label>
   <label>Description<textarea name="description" rows={3} placeholder="Décris le lieu, l’événement ou le contexte…"/></label>
   <div><span style={{display:'block',fontSize:13,fontWeight:850,marginBottom:8}}>📸 Ajouter une photo ou une vidéo</span><MediaPicker/></div>
   <label>Ou URL du média<span className="optional">Optionnel si tu sélectionnes un fichier</span><input name="url" placeholder="https://..."/></label>
   <label>Crédit / licence<input required name="credit" placeholder="Auteur — source — licence"/></label>
   <div className="formRow">
    <label>Type<select name="media_type"><option value="photo">Photo</option><option value="video">Vidéo</option></select></label>
    <label>Catégorie<select name="media_category"><option value="photo">Photo</option><option value="illustration">Illustration</option><option value="patrimoine">Patrimoine</option><option value="tourisme">Tourisme</option><option value="culture">Culture</option><option value="evenement">Événement</option></select></label>
   </div>
   <div className="formRow">
    <label>Région<select name="region_id"><option value="">Toutes</option>{regions.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
    <label>Merveille<select name="wonder_id"><option value="">Aucune</option>{wonders.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
   </div>
   <label className="check"><input type="checkbox" name="published" defaultChecked/> Publier immédiatement</label>
   <button className="btn primary">Publier dans la galerie du site</button>
  </form>
  <section className="adminList" style={{marginTop:24}}><div className="sectionHead"><div><div className="kicker">Bibliothèque</div><h2>Médias enregistrés</h2></div></div>
   {!media.length?<p className="muted">Aucun média pour le moment.</p>:<div className="grid">{media.map(item=><article className="card" key={item.id}>
    <div style={{aspectRatio:'16/9',overflow:'hidden',background:'#eee'}}>{item.media_type==='video'?<video src={item.url} controls preload="metadata" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<img src={item.url} alt={item.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>}</div>
    <div className="cardbody"><span className="tag">{item.published?'Publié':'Brouillon'} · {item.media_type==='video'?'Vidéo':'Photo'}</span><h3>{item.title}</h3><p className="muted">{item.credit}</p><a className="textlink" href={item.url} target="_blank" rel="noreferrer">Ouvrir le média direct ↗</a></div>
   </article>)}</div>}
  </section>
 </div></main>
}
