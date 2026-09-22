'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createArticle } from '../actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return <button className="btn primary" disabled={pending} type="submit">{pending ? 'Publication…' : 'Enregistrer la publication'}</button>
}

type State = { error?: string; slug?: string } | null

type Option = { name?: string; slug?: string; id?: string }

export default function ArticleForm({ categories, regions }: { categories: Option[]; regions: Option[] }) {
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
        {categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
      </select></label>
      <label>Région<select name="region_id" defaultValue="">
        <option value="">Toutes les régions</option>
        {regions.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}
      </select></label>
    </div>
    <label>Image de couverture<input type="file" name="cover_file" accept="image/*" /></label>
    <label>Ou URL de l’image<input name="cover_url" placeholder="https://..." /></label>
    <label>Auteur<input name="author_name" defaultValue="Mohamed Bickri Jr" /></label>
    <label className="check"><input type="checkbox" name="published" /> Publier immédiatement</label>
    {state?.error && <p className="formError">{state.error}</p>}
    {state?.slug && <div className="notice proNotice"><strong>Publication enregistrée.</strong><p>Votre lien : <a href={'/articles/' + state.slug} target="_blank" rel="noreferrer">/articles/{state.slug}</a></p><button type="button" className="btn primary" onClick={copyLink}>Copier le lien</button></div>}
    <SubmitButton />
  </form>
}
