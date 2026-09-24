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
              <span aria-hidden="true" style={{fontSize:22}}>🖼️</span>
              <span>Photo — Galerie</span>
              <input style={fileInputStyle} type="file" name="photo_gallery_file" accept="image/*" />
            </label>

            <label style={mediaActionStyle}>
              <span aria-hidden="true" style={{fontSize:22}}>🎬</span>
              <span>Vidéo — Galerie</span>
              <input style={fileInputStyle} type="file" name="video_gallery_file" accept="video/*" />
            </label>

            <label style={{...mediaActionStyle, background:'#0b5d3b',color:'#fff',borderColor:'#0b5d3b'}}>
              <span aria-hidden="true" style={{fontSize:22}}>📷</span>
              <span>Prendre une photo</span>
              <input style={fileInputStyle} type="file" name="camera_file" accept="image/*" capture="environment" />
            </label>

            <label style={{...mediaActionStyle, background:'#10231c',color:'#fff',borderColor:'#10231c'}}>
              <span aria-hidden="true" style={{fontSize:22}}>🎥</span>
              <span>Prendre une vidéo</span>
              <input style={fileInputStyle} type="file" name="video_camera_file" accept="video/*" capture="environment" />
            </label>
          </div>div>

          <details style={{border:'1px solid #dfe6df',borderRadius:16,background:'#f8faf8',padding:'4px 12px'}}>
            <summary style={{cursor:'pointer',fontWeight:850,padding:'10px 2px'}}>➕ Plus d’options</summary>
            <div style={{display:'grid',gap:8,padding:'4px 0 10px',color:'#5f6d65',fontSize:12}}>
              <span>📎 Galerie : « Photo — Galerie » et « Vidéo — Galerie » ouvrent la galerie/fichiers de ton appareil.</span>
              <span>📱 Caméra : les boutons dédiés ouvrent directement la caméra sur les téléphones compatibles.</span>
              <span>🔗 URL : tu peux aussi utiliser une URL publique ci-dessous.</span>
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
        <label className="check"><input type="checkbox" name="published" defaultChecked /> Publier immédiatement</label>
        <button className="btn primary">Publier dans la galerie du site</button>

        <label
          aria-label="Prendre une photo"
          title="Prendre une photo"
          style={{
            position:'fixed',
            right:'18px',
            bottom:'18px',
            zIndex:60,
            width:62,
            height:62,
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            borderRadius:'50%',
            background:'#fff',
            color:'#4f5b56',
            boxShadow:'0 4px 18px rgba(0,0,0,.22)',
            cursor:'pointer',
            border:'1px solid rgba(0,0,0,.08)',
          }}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 7.5h3l1.5-2h5L16 7.5h3A2 2 0 0 1 21 9.5v8A2 2 0 0 1 19 19.5H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z"/>
            <circle cx="12" cy="13.5" r="3.25"/>
          </svg>
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
