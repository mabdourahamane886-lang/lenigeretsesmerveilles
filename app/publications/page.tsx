import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpenText, CalendarDays, Camera, ChefHat, Clock3, Compass, Newspaper, Sparkles } from 'lucide-react'
import { isAdminAuthenticated } from '../../lib/admin-auth'
import { groupPublications, publicationTime } from '../../lib/publications/dates'
import PublicationActions from './publication-actions'
import MediaProfileEditor from './media-profile-editor'
import styles from './feed.module.css'
import { getPublicationTitle, normalizePublicationContent } from '../../lib/publications/format'
import { createAdminClient } from '../../lib/supabase/admin'
import { createClient as createServerClient } from '../../lib/supabase/server'

const baseUrl = 'https://lenigeretsesmerveilles-ngr.vercel.app'

export const metadata: Metadata = {
  title: 'Publications',
  description: 'Découvrez les publications, photos et récits de Le Niger et ses Merveilles : paysages, culture et patrimoine du Niger.',
  alternates: { canonical: `${baseUrl}/publications` },
  openGraph: {
    type: 'website',
    url: `${baseUrl}/publications`,
    siteName: 'Le Niger et ses Merveilles',
    locale: 'fr_FR',
    title: 'Publications | Le Niger et ses Merveilles',
    description: 'Photos, récits et découvertes pour explorer les paysages, les cultures et le patrimoine du Niger.',
    images: [{ url: `${baseUrl}/opengraph-image`, width: 1200, height: 630, alt: 'Le Niger et ses Merveilles' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Publications | Le Niger et ses Merveilles',
    description: 'Photos, récits et découvertes pour explorer le Niger.',
    images: [`${baseUrl}/opengraph-image`],
  },
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Publication = {
  pinned_at: string | null
  id: string
  author_name: string | null
  content: string | null
  media_url: string | null
  media_type: string | null
  music_url: string | null
  tagged_people: string[] | null
  location: string | null
  mood: string | null
  activity: string | null
  published_at: string | null
  created_at: string | null
}

const categories = [
  { title: 'Actualités', href: '/articles', icon: Newspaper },
  { title: 'Événements à venir', href: '/evenements', icon: CalendarDays },
  { title: 'Gastronomie', href: '/gastronomie', icon: ChefHat },
  { title: 'Merveilles du Niger', href: '/merveilles', icon: Compass },
  { title: 'Culture & traditions', href: '/culture', icon: BookOpenText },
  { title: 'Les régions', href: '/regions', icon: Sparkles },
]

export default async function PublicationsPage() {
  const supabase = createAdminClient() ?? await createServerClient()
  let publications: Publication[] = []
  let loadError = false

  if (supabase) {
    const { data, error } = await supabase
      .from('niger_publications')
      .select('id,author_name,content,media_url,media_type,music_url,tagged_people,location,mood,activity,published_at,created_at,pinned_at')
      .eq('published', true)
      .eq('visibility', 'public')
      .order('pinned_at', { ascending: false, nullsFirst: false })
      .order('published_at', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false }).order('id')
    if (error) {
      console.error('[publications] Impossible de charger les publications:', error.message)
      loadError = true
    } else {
      publications = (data ?? []) as Publication[]
    }
  } else {
    loadError = true
  }

  const canPin = await isAdminAuthenticated()
  const { data: mediaProfile } = supabase ? await supabase.from('niger_media_profile').select('avatar_path,cover_path,description').eq('id', 1).maybeSingle() : { data: null }
  const mediaUrl = (path: string | null | undefined) => path && supabase ? supabase.storage.from('niger-media').getPublicUrl(path).data.publicUrl : null
  const avatarUrl = mediaUrl(mediaProfile?.avatar_path)
  const coverUrl = mediaUrl(mediaProfile?.cover_path)
  const groups = groupPublications(publications)

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section aria-label="Profil du média" style={{background:'#fff',borderRadius:18,overflow:'hidden',marginBottom:24,border:'1px solid #e5e7eb'}}>
          <div style={{height:210,background:'#e8edf2',position:'relative'}}>
            {coverUrl && <img src={coverUrl} alt="Couverture du média" style={{width:'100%',height:'100%',objectFit:'cover'}} />}
          </div>
          <div style={{padding:'12px 22px 22px'}}>
            <div style={{display:'flex',alignItems:'end',gap:18,marginTop:-40,position:'relative'}}>
              <div style={{width:90,height:90,borderRadius:'50%',border:'4px solid white',background:'#e8edf2',overflow:'hidden',display:'grid',placeItems:'center',flexShrink:0}}>
                {avatarUrl ? <img src={avatarUrl} alt="Logo Le Niger et ses Merveilles" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <span aria-hidden="true" style={{fontWeight:700,color:'#1d4d3a'}}>NM</span>}
              </div>
              <h2 style={{marginBottom:8}}>Le Niger et ses Merveilles</h2>
            </div>
            <p style={{marginTop:10,whiteSpace:'pre-wrap'}}>{mediaProfile?.description ?? 'Média culturel et touristique du Niger'}</p>
            {canPin && <MediaProfileEditor initialDescription={mediaProfile?.description ?? 'Média culturel et touristique du Niger'} />}
            {canPin && <p style={{marginTop:12}}><Link href="/admin/publications">Créer une publication</Link></p>}
          </div>
        </section>
        <header className={styles.hero}>
          <p>Le Niger et ses Merveilles</p>
          <h1>Publications</h1>
          <div>Photos, vidéos et récits du Niger.</div>
        </header>

        <div className={styles.layout}>
          <section id="publications-recentes" aria-label="Fil de publication" className={styles.feed}>
            <p className={styles.clock}><Clock3 size={16} aria-hidden="true" /> Heure du Niger · UTC+1</p>
            {loadError || !groups.length ? (
              <div className={styles.empty} role="status">
                <Camera size={24} aria-hidden="true" />
                {loadError ? 'Le fil est temporairement indisponible.' : 'Aucune publication publique pour le moment.'}
              </div>
            ) : groups.map(group => (
              <section key={group.key} aria-labelledby={`publications-day-${group.key}`} className={styles.group}>
                <h2 id={`publications-day-${group.key}`}><CalendarDays size={18} aria-hidden="true" /> {group.label}</h2>
                {group.entries.map(({ publication, date }) => {
                  const content = normalizePublicationContent(publication.content)
                  return (
                    <article className="card publicationFeedCard" key={publication.id}>
                      <div className="cardbody">
                        <div style={{display:'flex',alignItems:'center',gap:12}}>
                          <div><strong>{publication.author_name || 'Le Niger et ses Merveilles'}</strong><div className="muted">{date && <time dateTime={date.toISOString()}>{publicationTime(date, Boolean(publication.pinned_at))}</time>}</div></div>
                          <PublicationActions id={publication.id} title={getPublicationTitle(content)} pinned={Boolean(publication.pinned_at)} canPin={canPin} />
                        </div>
                        {content && <p className="publicationFeedText" style={{marginTop:8}}>{content}</p>}
                        {publication.media_url && publication.media_type === 'photo' && <img src={publication.media_url} alt="Illustration de la publication" loading="lazy" style={{width:'100%',borderRadius:14,marginTop:12,objectFit:'cover'}}/>}
                        {publication.media_url && publication.media_type === 'video' && <video src={publication.media_url} controls preload="metadata" style={{width:'100%',borderRadius:14,marginTop:12}}/>}
                        {publication.music_url && <audio src={publication.music_url} controls preload="metadata" style={{width:'100%',marginTop:12}}/>}
                        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:14}}>
                          {publication.location && <span className="tag">{publication.location}</span>}
                          {publication.mood && <span className="tag">{publication.mood}</span>}
                          {publication.activity && <span className="tag">{publication.activity}</span>}
                          {publication.tagged_people?.length ? <span className="tag">{publication.tagged_people.join(', ')}</span> : null}
                        </div>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap',marginTop:20}}>
                          <Link className="proButton proButtonDark" href={`/publications/${publication.id}`}>Ouvrir la publication <ArrowRight size={15}/></Link>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </section>
            ))}
          </section>

          <aside className={styles.sidebar}>
            <nav aria-labelledby="publication-categories">
              <h2 id="publication-categories">Explorer le Niger</h2>
              {categories.map(({title, href, icon: Icon}) => (
                <Link key={href} href={href}>
                  <Icon size={18} aria-hidden="true" />
                  <span>{title}</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      </div>
    </main>
  )
}
