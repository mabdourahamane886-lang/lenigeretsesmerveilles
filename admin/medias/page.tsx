import Link from 'next/link'
import { ArrowLeft, Camera, CheckCircle2, FileVideo, ImagePlus, Plus, Upload, Video } from 'lucide-react'
import { createClient } from '../../../lib/supabase/server'
import { createMedia } from '../actions'

const hiddenFile = {
  position: 'absolute' as const,
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden' as const,
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap' as const,
  border: 0,
}

export default async function AdminMedias() {
  const supabase = await createClient()
  const [{ data: regions }, { data: wonders }, { data: media }] = supabase
    ? await Promise.all([
        supabase.from('niger_regions').select('id,name').order('name'),
        supabase.from('niger_wonders').select('id,name').order('name'),
        supabase
          .from('niger_media')
          .select('id,title,url,credit,published,region_id,media_type,media_category,created_at')
          .order('created_at', { ascending: false }),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }]

  return (
    <main className="adminPagePro">
      <div className="container" style={{ paddingBottom: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
          <Link className="textlink" href="/admin"><ArrowLeft size={16} /> Administration</Link>
          <Link className="proButton proButtonGhostOnLight" href="/media">Voir la galerie publique ↗</Link>
        </div>

        <header className="adminHero">
          <div>
            <div className="kicker">Publication • Galerie</div>
            <h1>Publier un média</h1>
            <p className="muted">
              Ajoutez une photo ou une vidéo depuis votre galerie, prenez directement une photo/vidéo avec l’appareil,
              ou utilisez une URL publique.
            </p>
          </div>
        </header>

        <form className="adminForm" action={createMedia} encType="multipart/form-data">
          <div className="adminSectionTitle" style={{ marginTop: 0 }}>
            <div>
              <span className="proMiniLabel">1 • Contenu</span>
              <h2>Informations de publication</h2>
            </div>
          </div>

          <label>
            Titre
            <input required name="title" placeholder="Ex. Grande Mosquée d’Agadez" />
          </label>

          <label>
            Description
            <textarea name="description" rows={4} placeholder="Décrivez brièvement ce que montre la photo ou la vidéo…" />
          </label>

          <div className="adminSectionTitle">
            <div>
              <span className="proMiniLabel">2 • Média</span>
              <h2>Choisir la source</h2>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 12 }}>
            <label className="adminModuleCard" style={{ position: 'relative', cursor: 'pointer', minHeight: 120 }}>
              <ImagePlus size={24} />
              <div><h2>Photo galerie</h2><p>Choisir une image sur l’appareil</p></div>
              <input style={hiddenFile} type="file" name="photo_gallery_file" accept="image/*" />
            </label>

            <label className="adminModuleCard" style={{ position: 'relative', cursor: 'pointer', minHeight: 120 }}>
              <FileVideo size={24} />
              <div><h2>Vidéo galerie</h2><p>Choisir une vidéo sur l’appareil</p></div>
              <input style={hiddenFile} type="file" name="video_gallery_file" accept="video/*" />
            </label>

            <label className="adminModuleCard" style={{ position: 'relative', cursor: 'pointer', minHeight: 120, borderColor: '#0b5d3b' }}>
              <Camera size={24} />
              <div><h2>Prendre une photo</h2><p>Ouvre la caméra sur mobile</p></div>
              <input style={hiddenFile} type="file" name="camera_file" accept="image/*" capture="environment" />
            </label>

            <label className="adminModuleCard" style={{ position: 'relative', cursor: 'pointer', minHeight: 120, borderColor: '#10231c' }}>
              <Video size={24} />
              <div><h2>Prendre une vidéo</h2><p>Ouvre la caméra vidéo</p></div>
              <input style={hiddenFile} type="file" name="video_camera_file" accept="video/*" capture="environment" />
            </label>
          </div>

          <div style={{ padding: 14, borderRadius: 16, background: '#f5f8f5', border: '1px solid #dfe6df' }}>
            <strong>Conseil :</strong> une seule source est nécessaire. Si un fichier est sélectionné, il est envoyé automatiquement vers
            Smooth Bundle puis son URL CDN est enregistrée dans Supabase.
          </div>

          <label>
            URL du média
            <span className="optional">Optionnel si vous sélectionnez un fichier</span>
            <input name="url" placeholder="https://exemple.com/photo.jpg" />
          </label>

          <label>
            Crédit / licence
            <input required name="credit" placeholder="Auteur — source — licence" />
          </label>

          <div className="formRow">
            <label>
              Type
              <select name="media_type">
                <option value="photo">Photo</option>
                <option value="video">Vidéo</option>
              </select>
            </label>
            <label>
              Catégorie
              <select name="media_category">
                <option value="photo">Photo</option>
                <option value="illustration">Illustration</option>
                <option value="patrimoine">Patrimoine</option>
                <option value="tourisme">Tourisme</option>
                <option value="culture">Culture</option>
                <option value="evenement">Événement</option>
              </select>
            </label>
          </div>

          <div className="formRow">
            <label>
              Région
              <select name="region_id">
                <option value="">Toutes les régions</option>
                {(regions || []).map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}
              </select>
            </label>
            <label>
              Merveille associée
              <select name="wonder_id">
                <option value="">Aucune</option>
                {(wonders || []).map((wonder) => <option key={wonder.id} value={wonder.id}>{wonder.name}</option>)}
              </select>
            </label>
          </div>

          <label className="check">
            <input type="checkbox" name="published" defaultChecked />
            <span><strong>Publier immédiatement</strong><br /><small>Le média sera visible sur la galerie publique après enregistrement.</small></span>
          </label>

          <button className="btn primary" type="submit">
            <Upload size={17} /> Publier le média
          </button>
        </form>

        <section style={{ marginTop: 40 }}>
          <div className="adminSectionTitle">
            <div>
              <span className="proMiniLabel">Bibliothèque</span>
              <h2>Médias récents</h2>
            </div>
            <span className="tag">{media?.length ?? 0} média{(media?.length ?? 0) > 1 ? 's' : ''}</span>
          </div>

          <div className="grid">
            {(media || []).map((item) => (
              <article className="card" key={item.id}>
                <div style={{ aspectRatio: '16/9', overflow: 'hidden', background: '#eee' }}>
                  {item.media_type === 'video'
                    ? <video src={item.url} controls preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <img src={item.url} alt={item.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div className="cardbody">
                  <span className="tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <CheckCircle2 size={13} /> {item.published ? 'Publié' : 'Brouillon'}
                  </span>
                  <h3>{item.title}</h3>
                  <p className="muted">{item.credit}</p>
                  <a className="textlink" href={item.url} target="_blank" rel="noreferrer">Ouvrir le média direct ↗</a>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
