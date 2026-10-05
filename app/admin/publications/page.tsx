import Link from 'next/link'
import { createAdminClient } from '../../../lib/supabase/admin'
import PublicationComposer from './publication-composer'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminPublications() {
  // The admin page must use the server-side service client: the public RLS
  // policy intentionally hides drafts and private publications from anon users.
  const s = createAdminClient()
  const { data: publications } = s
    ? await s.from('niger_publications')
        .select('id,content,media_url,media_type,location,mood,activity,published,published_at,created_at')
        .order('created_at', { ascending: false })
    : { data: [] }

  return (
    <main className="section">
      <div className="container" style={{paddingBottom:100}}>
        <Link className="textlink" href="/admin">← Administration</Link>
        <div className="adminHero">
          <div>
            <span className="kicker">Publications</span>
            <h1>Créer une publication</h1>
            <p className="muted">Une interface inspirée du modèle mobile fourni : texte, photos/vidéos, musique, personnes, lieu, humeur, activité et messages.</p>
          </div>
        </div>

        <PublicationComposer />

        <section className="adminList" style={{marginTop:24}}>
          <div className="sectionHead">
            <div><div className="kicker">Historique</div><h2>Publications enregistrées</h2></div>
          </div>
          {!publications?.length ? (
            <p className="muted">Aucune publication pour le moment.</p>
          ) : (
            <div className="grid">
              {publications.map((p) => (
                <article className="card" key={p.id}>
                  {p.media_url && p.media_type === 'photo' && <img src={p.media_url} alt="" style={{width:'100%',aspectRatio:'16/9',objectFit:'cover'}} />}
                  {p.media_url && p.media_type === 'video' && <video src={p.media_url} controls preload="metadata" style={{width:'100%',aspectRatio:'16/9',objectFit:'cover'}} />}
                  <div className="cardbody">
                    <span className="tag">{p.published ? 'Publié' : 'Brouillon'} · {p.location || 'Niger'}</span>
                    <h3>{p.content ? p.content.slice(0,110) : 'Publication média'}</h3>
                    {p.mood && <p>{p.mood}</p>}
                    {p.activity && <p className="muted">{p.activity}</p>}
                    {p.published && <Link className="textlink" href="/publications">Voir sur le site →</Link>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
