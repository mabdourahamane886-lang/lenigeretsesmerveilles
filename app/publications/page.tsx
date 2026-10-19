import Link from 'next/link'
import { createAdminClient } from '../../lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PublicationsPage() {
  // Public reads must exclude private and draft content.
  const supabase = createAdminClient()
  const { data: publications, error } = supabase
    ? await supabase
        .from('niger_publications')
        .select('id,author_name,content,media_url,media_type,music_url,tagged_people,location,mood,activity,allow_messages,published_at')
        .eq('published', true)
        .eq('visibility', 'public')
        .order('published_at', { ascending: false })
    : { data: [], error: new Error('Supabase non configuré') }

  if (error) console.error('[publications] Impossible de charger les publications:', error.message)

  return (
    <main className="section">
      <div className="container" style={{ maxWidth: 900 }}>
        <div className="adminHero">
          <div>
            <span className="kicker">Actualités</span>
            <h1>Publications</h1>
            <p className="muted">Les dernières publications de Le Niger et ses Merveilles.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 24 }}>
          {!publications?.length ? (
            <p className="muted">Aucune publication publiée pour le moment.</p>
          ) : (
            publications.map((publication) => {
              const title = (publication.content || 'Publication').replace(/\s+/g, ' ').trim().slice(0, 90)
              return (
                <article className="card" key={publication.id}>
                  <div className="cardbody">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="publicationAvatar">🇳🇪</div>
                      <div>
                        <strong>{publication.author_name || 'Le Niger et ses Merveilles'}</strong>
                        <div className="muted">
                          {publication.published_at
                            ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(publication.published_at))
                            : ''}
                        </div>
                      </div>
                    </div>
                    {publication.content && (
                      <p style={{ whiteSpace: 'pre-wrap', fontSize: 17, lineHeight: 1.65, marginTop: 16 }}>
                        {publication.content}
                      </p>
                    )}
                    {publication.media_url && publication.media_type === 'photo' && (
                      <img src={publication.media_url} alt={title} style={{ width: '100%', borderRadius: 14, marginTop: 12 }} />
                    )}
                    {publication.media_url && publication.media_type === 'video' && (
                      <video src={publication.media_url} controls preload="metadata" style={{ width: '100%', borderRadius: 14, marginTop: 12 }} />
                    )}
                    {publication.music_url && <audio src={publication.music_url} controls style={{ width: '100%', marginTop: 12 }} />}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                      {publication.location && <span className="tag">📍 {publication.location}</span>}
                      {publication.mood && <span className="tag">{publication.mood}</span>}
                      {publication.activity && <span className="tag">• {publication.activity}</span>}
                      {publication.tagged_people?.length ? <span className="tag">👤 {publication.tagged_people.join(', ')}</span> : null}
                    </div>
                    {publication.allow_messages && <p className="muted" style={{ marginTop: 14 }}>💬 Cette publication accepte les messages.</p>}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18 }}>
                      <Link className="textlink" href={`/publications/${publication.id}`}>Ouvrir la publication →</Link>
                      <Link className="textlink" href={`/publications/${publication.id}`}>Lien direct à partager</Link>
                    </div>
                  </div>
                </article>
              )
            })
          )}
        </div>
      </div>
    </main>
  )
}
