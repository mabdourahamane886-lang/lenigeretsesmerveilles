'use client'

import { useRef, useState } from 'react'
import { createPublication } from '../actions'

type Result = { id: string; scheduled?: boolean; targets?: string[] }

const platforms = [
  { key: 'facebook', label: 'Facebook', icon: '📘' },
  { key: 'instagram', label: 'Instagram', icon: '📸' },
  { key: 'tiktok', label: 'TikTok', icon: '🎵' },
  { key: 'whatsapp', label: 'WhatsApp', icon: '💬' },
] as const

export default function PublicationComposer() {
  const photoRef = useRef<HTMLInputElement>(null)
  const [photoName, setPhotoName] = useState('')
  const [musicName, setMusicName] = useState('')
  const [loading, setLoading] = useState(false)
  const [publicationUrl, setPublicationUrl] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  async function submit(formData: FormData) {
    setLoading(true)
    setError('')
    setNotice('')
    setPublicationUrl('')
    try {
      const result = await createPublication(formData) as Result
      const url = `${window.location.origin}/publications/${result.id}`
      if (result.scheduled) {
        setNotice('Publication programmée. Elle apparaîtra sur le site à la date choisie. Les réseaux sélectionnés sont ajoutés à la file de diffusion, sous réserve de connecter leurs comptes.')
      } else {
        setPublicationUrl(url)
        setNotice('Publication enregistrée sur le site. Les réseaux sélectionnés ont été ajoutés à la file de diffusion ; leur envoi nécessite une connexion officielle active.')
        await navigator.clipboard.writeText(url).catch(() => undefined)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible d’enregistrer cette publication.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form className="adminForm publicationComposer" action={submit} encType="multipart/form-data">
        <div className="publicationIdentity">
          <div className="publicationAvatar">🇳🇪</div>
          <div>
            <strong>Le Niger et ses Merveilles NE</strong>
            <select name="visibility" defaultValue="public" aria-label="Visibilité">
              <option value="public">🌐 Public</option>
              <option value="private">🔒 Privé</option>
            </select>
          </div>
        </div>

        <label className="publicationTextLabel">
          <span>Quoi de neuf ?</span>
          <textarea name="content" rows={6} placeholder="Partagez une actualité, une histoire, une merveille ou un événement du Niger…" />
        </label>

        <div className="publicationMediaPreview">
          <div>
            <strong>Photos/Vidéos</strong>
            <span>{photoName || 'Ajoutez une photo ou une vidéo depuis votre appareil.'}</span>
          </div>
          <button type="button" className="btn" onClick={() => photoRef.current?.click()}>📷 Choisir</button>
          <input
            ref={photoRef}
            hidden
            name="media_file"
            type="file"
            accept="image/*,video/*"
            capture="environment"
            onChange={(e) => setPhotoName(e.target.files?.[0]?.name || '')}
          />
        </div>

        <div className="publicationOption">
          <span>🎵 <strong>Musique</strong></span>
          <input name="music_file" type="file" accept="audio/*" onChange={(e) => setMusicName(e.target.files?.[0]?.name || '')} />
          {musicName && <small>{musicName}</small>}
        </div>

        <div className="formRow">
          <label>Identifier des personnes
            <input name="tagged_people" placeholder="Noms séparés par des virgules" />
          </label>
          <label>Ajouter un lieu
            <input name="location" placeholder="Ex. Palais du 29 Juillet, Niamey" />
          </label>
        </div>

        <div className="formRow">
          <label>Humeur
            <select name="mood" defaultValue="">
              <option value="">Aucune</option>
              <option value="😊 Heureux">😊 Heureux</option>
              <option value="❤️ Fier du Niger">❤️ Fier du Niger</option>
              <option value="🎉 Célébration">🎉 Célébration</option>
              <option value="🙏 Reconnaissant">🙏 Reconnaissant</option>
            </select>
          </label>
          <label>Activité
            <input name="activity" placeholder="Ex. Festival, patrimoine, sport…" />
          </label>
        </div>

        <section className="adminPanelPro" style={{padding:18,marginTop:18}}>
          <div className="adminPanelHead">
            <div><span className="proMiniLabel">NIGER MEDIA AUTOMATION</span><h2>Diffusion multicanale</h2></div>
            <span aria-hidden="true">🌍</span>
          </div>
          <p className="muted">Le contenu sera publié sur le site. Sélectionne les réseaux où tu souhaites aussi le diffuser.</p>
          <div className="formRow" style={{display:'flex',flexWrap:'wrap',gap:16}}>
            {platforms.map((platform) => (
              <label className="check" key={platform.key} style={{minWidth:130}}>
                <input type="checkbox" name={`target_${platform.key}`} />
                {platform.icon} {platform.label}
              </label>
            ))}
          </div>
          <label style={{display:'block',marginTop:16}}>
            📅 Programmer la publication (facultatif)
            <input name="scheduled_at" type="datetime-local" min={new Date(Date.now()+60000).toISOString().slice(0,16)} style={{display:'block',width:'100%',marginTop:8}} />
          </label>
          <p className="muted" style={{fontSize:13,marginTop:10}}>Sans date, la publication est mise en ligne immédiatement. Les envois sociaux restent en attente tant que les comptes et autorisations API ne sont pas connectés.</p>
        </section>

        <label className="check">
          <input type="checkbox" name="allow_messages" />
          Recevoir des messages sur cette publication
        </label>

        <button className="btn primary" disabled={loading}>
          {loading ? 'Enregistrement en cours…' : 'PUBLIER / PROGRAMMER'}
        </button>

        {error && <p role="alert" style={{color:'#b42318',fontWeight:700}}>{error}</p>}
        {notice && <div className="notice proNotice" role="status"><strong>{notice}</strong>{publicationUrl && <><p>Le lien direct a été copié si le navigateur l’autorise :</p><a href={publicationUrl} target="_blank" rel="noreferrer">{publicationUrl}</a><button type="button" className="btn" onClick={() => navigator.clipboard.writeText(publicationUrl)}>Copier le lien</button></>}</div>}
      </form>
    </div>
  )
}
