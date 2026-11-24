import Link from 'next/link'
import { adminDatabase } from '../../../lib/admin/database'
import PublicationActions from '../../publications/publication-actions'
import { getPublicationTitle } from '../../../lib/publications/format'
import SimpleComposer from './simple-composer'
import PublicationComposer from './publication-composer'
import styles from './composer.module.css'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminPublications({searchParams}: {searchParams: Promise<{mode?: string}>}) {
  const advanced = (await searchParams).mode === 'avance'
  const s = await adminDatabase()
  const { data: publications } = await s.from('niger_publications')
    .select('id,content,media_url,media_type,location,mood,activity,published,published_at,visibility,scheduled_at,automation_status,distribution_targets,created_at,pinned_at')
    .order('pinned_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending:false }).throwOnError()

  return (
    <main className="section">
      <div className={`container ${styles.workspace}`}>
        <Link className="textlink" href="/admin">← Administration</Link>
        <div className={styles.heading}>
          <div>
            <h1>Créer une publication</h1>
          </div>
        </div>

        {advanced ? <PublicationComposer /> : <SimpleComposer />}
        {advanced && <Link className="textlink" href="/admin/publications">Revenir à la publication simple</Link>}

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
                    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                      <span className="tag">{p.automation_status === 'scheduled' ? 'Programmé' : p.published ? p.visibility === 'public' ? 'Publié' : 'Privé' : 'Brouillon'} · {p.location || 'Niger'}</span>
                      {p.published && p.visibility === 'public' && (
                        <PublicationActions id={p.id} title={getPublicationTitle(p.content)} canPin pinned={Boolean(p.pinned_at)} />
                      )}
                    </div>
                    <h3>{p.content ? p.content.slice(0,110) : 'Publication média'}</h3>
                    {p.scheduled_at && <p className="muted">Prévu le {new Date(p.scheduled_at).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}</p>}
                    {Array.isArray(p.distribution_targets) && p.distribution_targets.length > 0 && <p className="muted">Réseaux sélectionnés : {p.distribution_targets.join(', ')}</p>}
                    {p.mood && <p>{p.mood}</p>}
                    {p.activity && <p className="muted">{p.activity}</p>}
                    {p.published && p.visibility === 'public' && <Link className="textlink" href={`/publications/${p.id}`}>Ouvrir la publication →</Link>}
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
