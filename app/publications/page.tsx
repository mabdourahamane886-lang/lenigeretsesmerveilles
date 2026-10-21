import Link from 'next/link'
import { ArrowRight, CalendarDays, MapPin } from 'lucide-react'
import { createAdminClient } from '../../lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function formatDate(value?: string | null) {
  if (!value) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default async function PublicationsPage() {
  const supabase = createAdminClient()
  const { data: publications, error } = supabase
    ? await supabase
        .from('niger_publications')
        .select('id,author_name,content,media_url,media_type,music_url,tagged_people,location,mood,activity,allow_messages,published_at')
        .eq('published', true)
        .eq('visibility', 'public')
        .order('published_at', { ascending: false })
    : { data: [], error: new Error('Supabase non configuré') }

  if (error) {
    console.error('[publications] Impossible de charger les publications:', error.message)
  }

  return (
    <main className="section">
      <div className="container" style={{ maxWidth: 900 }}>
        <div className="adminHero">
          <div>
            <span className="kicker">Actualités du Niger</span>
            <h1>Publications</h1>
            <p className="muted">
              Retrouvez les nouvelles, les récits et les moments partagés par
              Le Niger et ses Merveilles. Chaque publication dispose de son
              propre lien pour être consultée et partagée.
            </p>
          </div>
        </div>

        {error ? (
          <div className="card cardbody" role="status">
            <strong>Les publications sont temporairement indisponibles.</strong>
            <p className="muted">Veuillez réessayer dans quelques instants.</p>
          </div>
        ) : !publications?.length ? (
          <div className="card cardbody">
            <strong>Aucune publication publique pour le moment.</strong>
            <p className="muted">Les nouvelles publications apparaîtront ici après leur mise en ligne.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 24 }}>
            {publications.map((publication) => (
              <article className="card" key={publication.id}>
                <div className="cardbody">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="publicationAvatar" aria-hidden="true">🇳🇪</div>
                    <div>
                      <strong>{publication.author_name || 'Le Niger et ses Merveilles'}</strong>
                      <div className="muted">{formatDate(publication.published_at)}</div>
                    </div>
                  </div>

                  {publication.content && (
                    <p style={{ whiteSpace: 'pre-wrap', fontSize: 17, lineHeight: 1.65, marginTop: 16 }}>
                      {publication.content}
                    </p>
                  )}

                  {publication.media_url && publication.media_type === 'photo' && (
                    <img
                      src={publication.media_url}
                      alt="Illustration de la publication"
                      loading="lazy"
                      style={{ width: '100%', borderRadius: 14, marginTop: 12, objectFit: 'cover' }}
                    />
                  )}
                  {publication.media_url && publication.media_type === 'video' && (
                    <video
                      src={publication.media_url}
                      controls
                      preload="metadata"
                      style={{ width: '100%', borderRadius: 14, marginTop: 12 }}
                    />
                  )}
                  {publication.music_url && (
                    <audio src={publication.music_url} controls preload="metadata" style={{ width: '100%', marginTop: 12 }} />
                  )}

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                    {publication.location && <span className="tag"><MapPin size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> {publication.location}</span>}
                    {publication.mood && <span className="tag">{publication.mood}</span>}
                    {publication.activity && <span className="tag">{publication.activity}</span>}
                    {publication.tagged_people?.length ? (
                      <span className="tag">👤 {publication.tagged_people.join(', ')}</span>
                    ) : null}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
                    <Link className="proButton proButtonDark" href={`/publications/${publication.id}`}>
                      Ouvrir la publication <ArrowRight size={15} />
                    </Link>
                    <Link className="textlink" href={`/publications/${publication.id}`}>
                      Obtenir le lien direct
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
