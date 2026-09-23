import Link from 'next/link'
import { createClient } from '../../../lib/supabase/server'
import { createMedia } from '../actions'

const fileInputStyle = {
  position: 'absolute' as const,
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden' as const,
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap' as const,
  border: 0,
}

const mediaActionStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  minHeight: 54,
  padding: '12px 16px',
  border: '1px solid #dfe6df',
  borderRadius: 16,
  background: '#fff',
  color: '#10231c',
  fontWeight: 800,
  cursor: 'pointer',
}

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
    <main className="section"><div className="container" style={{paddingBottom:100}}>
      <Link className="textlink" href="/admin">← Administration</Link>
      <div className="adminHero"><div><div className="kicker">Médias</div><h1>Galerie du Niger</h1><p className="muted">Ajoute une photo ou une vidéo comme dans WhatsApp : caméra, vidéo, galerie ou bouton +. Le fichier est envoyé vers Smooth Bundle puis enregistré dans Supabase.</p></div></div>

      <form className="adminForm" action={createMedia} encType="multipart/form-data">
        <label>Titre<input required name="title" placeholder="Grande Mosquée d’Agadez" /></label>
        <label>Description<textarea name="description" rows={3} />

        <div style={{display:'grid',gap:10}}>
          <span style={{fontSize:13,fontWeight:850}}>Ajouter un média</span>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:10}}>
            <label style={mediaActionStyle}>
              <span aria-hidden="true" style={{fontSize:22}}>🎥</span>
              <span>Vidéo</span>
              <input style={fileInputStyle} type="file" name="video_file" accept="video/*" capture="environment" />
            </label>

            <label style={{...mediaActionStyle, background:'#0b5d3b',color:'#fff',borderColor:'#0b5d3b'}}>
              <span aria-hidden="true" style={{fontSize:22}}>🖼️</span>
              <span>Galerie</span>
              <input style={fileInputStyle} type="file" name="image_file" accept="image/*,video/*" />
            </label>
          </div>

          <details style={{border:'1px solid #dfe6df',borderRadius:16,background:'#f8faf8',padding:'4px 12px'}}>
            <summary style={{cursor:'pointer',fontWeight:850,padding:'10px 2px'}}>➕ Plus d’options</summary>
            <div style={{display:'grid',gap:8,padding:'4px 0 10px',color:'#5f6d65',fontSize:12}}>
              <span>📎 Galerie de fichiers : utilise « Galerie » pour sélectionner une image ou une vidéo enregistrée sur ton appareil.</span>
              <span>🔗 URL : tu peux aussi utiliser une URL publique ci-dessous.</span>
              <span>📱 Le bouton Caméra en bas ouvre directement la caméra sur les téléphones compatibles.</span>
            </div>
          </details>
        </div>

        <label>Ou URL du média<span className="optional">Optionnel si tu utilises Caméra, Vidéo ou Galerie</span><input name="url" placeholder="https://..." /></label>
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
        <button className="btn primary">Publier dans la galerie du site</button>

        <label style={{
          position:'fixed',
          left:'50%',
          bottom:'18px',
          transform:'translateX(-50%)',
          zIndex:60,
          width:'min(220px,calc(100vw - 32px))',
          minHeight:58,
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          gap:10,
          borderRadius:999,
          background:'#0b5d3b',
          color:'#fff',
          boxShadow:'0 12px 35px rgba(5,45,32,.30)',
          fontWeight:900,
          cursor:'pointer',
          border:'3px solid rgba(255,255,255,.92)',
        }}>
          <span aria-hidden="true" style={{fontSize:25}}>📷</span>
          <span>Prendre une photo</span>
          <input
            style={fileInputStyle}
            type="file"
            name="camera_file"
            accept="image/*"
            capture="environment"
          />
        </label>
      </form>

      <div className="grid" style={{marginTop:24}}>{(media || []).map((item) => <article className="card" key={item.id}>
        <div style={{aspectRatio:'16/9',overflow:'hidden',background:'#eee'}}>{item.media_type === 'video' ? <video src={item.url} controls preload="metadata" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <img src={item.url} alt={item.title} style={{width:'100%',height:'100%',objectFit:'cover'}} />}</div>
        <div className="cardbody"><span className="tag">{item.published?'Publié':'Brouillon'}</span><h3>{item.title}</h3><p className="muted">{item.credit}</p><a className="textlink" href={item.url} target="_blank" rel="noreferrer">Ouvrir le média direct ↗</a></div>
      </article>)}</div>
    </div></main>
  )
}
