import { createAdminClient } from '../../lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PublicationsPage() {
  // This is a server-only, public read. The explicit filters keep private and
  // draft publications out while the admin client avoids an anonymous-session
  // cookie/RLS mismatch on the public route.
  const s = createAdminClient()
  const { data: publications, error } = s
    ? await s.from('niger_publications')
        .select('id,author_name,content,media_url,media_type,music_url,tagged_people,location,mood,activity,allow_messages,published_at')
        .eq('published', true)
        .eq('visibility', 'public')
        .order('published_at', { ascending: false })
    : { data: [], error: new Error('Supabase non configuré') }

  if (error) console.error('[v0] Impossible de charger les publications:', error.message)

  return (
    <main className="section">
      <div className="container" style={{maxWidth:900}}>
        <div className="adminHero">
          <div>
            <span className="kicker">Actualités</span>
            <h1>Publications</h1>
            <p className="muted">Les dernières publications de Le Niger et ses Merveilles.</p>
          </div>
        </div>

        <div style={{display:'grid',gap:24}}>
          {!publications?.length ? <p className="muted">Aucune publication publiée pour le moment.</p> : publications.map((p) => (
            <article className="card" key={p.id}>
              <div className="cardbody">
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div className="publicationAvatar">🇳🇪</div>
                  <div><strong>{p.author_name}</strong><div className="muted">{p.published_at ? new Intl.DateTimeFormat('fr-FR',{dateStyle:'medium',timeStyle:'short'}).format(new Date(p.published_at)) : ''}</div></div>
                </div>
                {p.content && <p style={{whiteSpace:'pre-wrap',fontSize:17,lineHeight:1.65,marginTop:16}}>{p.content}</p>}
                {p.media_url && p.media_type === 'photo' && <img src={p.media_url} alt="" style={{width:'100%',borderRadius:14,marginTop:12}} />}
                {p.media_url && p.media_type === 'video' && <video src={p.media_url} controls style={{width:'100%',borderRadius:14,marginTop:12}} />}
                {p.music_url && <audio src={p.music_url} controls style={{width:'100%',marginTop:12}} />}
                <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:14}}>
                  {p.location && <span className="tag">📍 {p.location}</span>}
                  {p.mood && <span className="tag">{p.mood}</span>}
                  {p.activity && <span className="tag">• {p.activity}</span>}
                  {p.tagged_people?.length ? <span className="tag">👤 {p.tagged_people.join(', ')}</span> : null}
                </div>
                {p.allow_messages && <p className="muted" style={{marginTop:14}}>💬 Cette publication accepte les messages.</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
