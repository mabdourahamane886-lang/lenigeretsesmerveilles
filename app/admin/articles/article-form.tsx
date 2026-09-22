'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createArticle } from '../actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return <button className="btn primary" disabled={pending} type="submit">{pending ? 'Publication…' : 'Enregistrer la publication'}</button>
}

type State = { error?: string; slug?: string } | null

export default function ArticleForm() {
  const [state, action] = useActionState(async (_state: State, formData: FormData): Promise<State> => {
    try { const result = await createArticle(formData); return { slug: result.slug } }
    catch (e) { return { error: e instanceof Error ? e.message : 'Une erreur est survenue.' } }
  }, null)

  const copyLink = async () => {
    if (!state?.slug) return
    const url = window.location.origin + '/articles/' + state.slug
    await navigator.clipboard.writeText(url)
    alert('Lien copié : ' + url)
  }

  return <form className="adminForm" action={action} encType="multipart/form-data">
    <label>Titre<input required name="title" placeholder="Titre de la publication" /></label>
    <label>Extrait<textarea name="excerpt" rows={3} placeholder="Résumé de la publication" /></label>
    <label>Contenu<textarea required name="content" rows={10} placeholder="Rédige le contenu…" /></label>
    <div className="formRow">
      <label>Catégorie<select name="category" defaultValue="culture">
        <option value="tourisme">Tourisme</option><option value="culture">Culture</option><option value="histoire">Histoire</option><option value="patrimoine">Patrimoine</option><option value="gastronomie">Gastronomie</option><option value="nature">Nature</option><option value="artisanat">Artisanat</option><option value="architecture">Architecture</option><option value="evenements">Événements</option><option value="actualites">Actualités</option><option value="portraits">Portraits</option>
      </select></label>
      <label>Région<select name="region_id" defaultValue="">
        <option value="">Toutes les régions</option>
        <option value="4c7302c8-92b4-4f74-a2a9-763e096b37b4">Agadez</option>
        <option value="e299b661-cc78-480d-bcec-f3f4990e72d8">Diffa</option>
        <option value="47cb5df7-fd12-48ba-86a7-e8f27a889ea3">Dosso</option>
        <option value="b7b8bec2-b882-4b8d-badf-f7f1a41415e1">Maradi</option>
        <option value="f1bb789a-333d-464d-981a-63f42cf658c9">Niamey</option>
        <option value="a920073a-aed9-4256-a32b-06b3a4c9ce5a">Tahoua</option>
        <option value="0d36ab66-e28c-48d9-bd50-971b6bd8ec8a">Tillabéri</option>
        <option value="5ec4952d-441d-4fd4-adfe-ea33f388d2f8">Zinder</option>
      </select></label>
    </div>
    <label>Image de couverture<input type="file" name="cover_file" accept="image/*" /></label>
    <label>Ou URL de l’image<input name="cover_url" placeholder="https://..." /></label>
    <label>Auteur<input name="author_name" defaultValue="Mohamed Bickri Jr" /></label>
    <label className="check"><input type="checkbox" name="published" /> Publier immédiatement</label>
    {state?.error && <p className="formError">{state.error}</p>}
    {state?.slug && <div className="notice proNotice"><strong>Publication enregistrée.</strong><p>Votre lien : <a href={'/articles/' + state.slug} target="_blank" rel="noreferrer">{window.location.origin + '/articles/' + state.slug}</a></p><button type="button" className="btn primary" onClick={copyLink}>Copier le lien</button></div>}
    <SubmitButton />
  </form>
}
