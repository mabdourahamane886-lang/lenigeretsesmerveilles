'use client'
import { useState } from 'react'

export default function SignalForm() {
  const [sent, setSent] = useState(false)

  if (sent) {
    return (
      <div className="successBanner" role="status">
        <strong>Signalement préparé.</strong>
        <span>Votre message a été enregistré localement. Pour une transmission effective à l’équipe, utilisez également la contribution.</span>
      </div>
    )
  }

  return (
    <form
      className="contributionForm"
      onSubmit={(e) => {
        e.preventDefault()
        setSent(true)
      }}
    >
      <label>
        URL de la page
        <input required type="url" name="url" placeholder="https://lenigeretsesmerveilles.vercel.app/..." />
      </label>
      <label>
        Problème
        <select name="type">
          <option>Information inexacte</option>
          <option>Information obsolète</option>
          <option>Source manquante</option>
          <option>Crédit / licence incorrect</option>
          <option>Autre</option>
        </select>
      </label>
      <label>
        Description
        <textarea required name="description" rows={7} placeholder="Expliquez précisément ce qui doit être vérifié…" />
      </label>
      <label>
        Source de correction <span className="optional">(facultatif)</span>
        <input name="source" placeholder="Lien, ouvrage, institution ou référence" />
      </label>
      <button className="btn primary" type="submit">Préparer le signalement <span>→</span></button>
    </form>
  )
}
