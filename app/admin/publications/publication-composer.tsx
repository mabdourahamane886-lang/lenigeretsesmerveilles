'use client'

import { useRef, useState } from 'react'
import { createPublication, syncCodaPublications } from '../actions'

export default function PublicationComposer() {
  const photoRef = useRef<HTMLInputElement>(null)
  const musicRef = useRef<HTMLInputElement>(null)
  const [photoName, setPhotoName] = useState('')
  const [musicName, setMusicName] = useState('')
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState('')
  const [syncMessage, setSyncMessage] = useState('')

  async function submit(formData: FormData) {
    setLoading(true)
    setError('')
    try {
      await createPublication(formData)
      window.location.reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de publier cette publication.')
    } finally {
      setLoading(false)
    }
  }

  async function syncCoda() {
    setSyncing(true)
    setError('')
    setSyncMessage('')
    try {
      const result = await syncCodaPublications()
      setSyncMessage(`Coda synchronisé : ${result.created} créée(s), ${result.updated} mise(s) à jour.`)
      window.location.reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Synchronisation Coda impossible.')
    } finally {
      setSyncing(false)
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
          <input
            ref={musicRef}
            name="music_file"
            type="file"
            accept="audio/*"
            onChange={(e) => setMusicName(e.target.files?.[0]?.name || '')}
          />
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

        <label className="check">
          <input type="checkbox" name="allow_messages" />
          Recevoir des messages sur cette publication
        </label>

        <button className="btn primary" disabled={loading}>
          {loading ? 'Publication en cours…' : 'PUBLIER'}
        </button>

        {error && <p role="alert" style={{color:'#b42318',fontWeight:700}}>{error}</p>}
      </form>

      <div style={{marginTop:16,display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
        <button type="button" className="btn" onClick={syncCoda} disabled={syncing}>
          {syncing ? 'Synchronisation…' : '↻ Synchroniser Coda'}
        </button>
        <span className="muted" style={{fontSize:13}}>
          Publie depuis la table Coda « Publications du site » puis synchronise ici.
        </span>
      </div>

      {syncMessage && <p role="status" style={{color:'#16794c',fontWeight:700}}>{syncMessage}</p>}
    </div>
  )
}
