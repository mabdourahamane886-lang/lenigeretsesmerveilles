import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CalendarDays, MapPin, UserRound } from 'lucide-react'
import { createAdminClient } from '../../../lib/supabase/admin'
import ShareButton from '../../../components/site/share-button'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PublicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()
  if (!supabase) notFound()

  const { data: publication, error } = await supabase
    .from('niger_publications')
    .select('id,author_name,content,media_url,media_type,music_url,tagged_people,location,mood,activity,published_at')
    .eq('id', id)
    .eq('published', true)
    .eq('visibility', 'public')
    .maybeSingle()

  if (error || !publication) notFound()

  const title = (publication.content || 'Publication').replace(/\s+/g, ' ').trim().slice(0, 90)

  return (
    <main className="section">
      <div className="container" style={{ maxWidth: 900 }}>
        <Link className="textlink" href="/publications" style={{ display: 'inline-flex', marginBottom: 20 }}>
          <ArrowLeft size={16} style={{ marginRight: 6 }} /> Toutes les publications
        </Link>
        <article className="card">
          <div className="cardbody">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="publicationAvatar">🇳🇪</div>
              <div>
                <strong>{publication.author_name || 'Le Niger et ses Merveilles'}</strong>
                <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                  <CalendarDays size={14} />
                  {publication.published_at
                    ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(publication.published_at))
                    : 'Publication récente'}
                </div>
              </div>
            </div>
            {publication.content && (
              <p style={{ whiteSpace: 'pre-wrap', fontSize: 18, lineHeight: 1.75, marginTop: 20 }}>
                {publication.content}
              </p>
            )}
            {publication.media_url && publication.media_type === 'photo' && (
              <img src={publication.media_url} alt={title} style={{ width: '100%', borderRadius: 14, marginTop: 12 }} />
            )}
            {publication.media_url && publication.media_type === 'video' && (
              <video src={publication.media_url} controls preload="metadata" style={{ width: '100%', borderRadius: 14, marginTop: 12 }} />
            )}
            {publication.music_url && <audio src={publication.music_url} controls style={{ width: '100%', marginTop: 14 }} />}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
              {publication.location && <span className="tag"><MapPin size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> {publication.location}</span>}
              {publication.mood && <span className="tag">{publication.mood}</span>}
              {publication.activity && <span className="tag">{publication.activity}</span>}
              {publication.tagged_people?.length ? <span className="tag">👤 {publication.tagged_people.join(', ')}</span> : null}
            </div>
            <div style={{ marginTop: 20 }}>
              <ShareButton title={title} />
            </div>
          </div>
        </article>
      </div>
    </main>
  )
}
