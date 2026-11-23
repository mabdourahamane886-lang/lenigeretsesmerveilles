import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpenText, CalendarDays, Camera, ChefHat, Clock3, Compass, Newspaper, Sparkles } from 'lucide-react'
import { groupPublications, publicationTime } from '../../lib/publications/dates'
import ShareButton from '../../components/site/share-button'
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
      .select('id,author_name,content,media_url,media_type,music_url,tagged_people,location,mood,activity,published_at,created_at')
      .eq('published', true)
      .eq('visibility', 'public')
      .order('published_at', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false })
    if (error) {
      console.error('[publications] Impossible de charger les publications:', error.message)
      loadError = true
    } else {
      publications = (data ?? []) as Publication[]
    }
  } else {
    loadError = true
  }

  const groups = groupPublications(publications)

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
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
                  const href = `/publications/${publication.id}`
                  const title = getPublicationTitle(publication.content)
                  const content = normalizePublicationContent(publication.content)
                  const tags = [publication.location, publication.mood, publication.activity, ...(publication.tagged_people ?? [])]
                    .filter((tag): tag is string => Boolean(tag))
                  return (
                    <article className={styles.card} key={publication.id}>
                      <header className={styles.byline}>
                        <span className={styles.avatar} aria-hidden="true">NM</span>
                        <div>
                          <strong>{publication.author_name || 'Le Niger et ses Merveilles'}</strong>
                          {date && <time dateTime={date.toISOString()}>{publicationTime(date)}</time>}
                        </div>
                      </header>
                      {content && <p className={styles.text}>{content}</p>}
                      {publication.media_url && publication.media_type === 'photo' && (
                        <img className={styles.media} src={publication.media_url} alt={title} loading="lazy" decoding="async" />
                      )}
                      {publication.media_url && publication.media_type === 'video' && (
                        <video className={styles.media} src={publication.media_url} controls preload="metadata" playsInline />
                      )}
                      {publication.music_url && <audio className={styles.audio} src={publication.music_url} controls preload="none" />}
                      {tags.length > 0 && <ul className={styles.tags} aria-label="Repères de la publication">
                        {[...new Set(tags)].map(tag => <li key={tag}>{tag}</li>)}
                      </ul>}
                      <footer className={styles.actions}>
                        <Link className={styles.read} href={href}>Ouvrir la publication <ArrowRight size={16} aria-hidden="true" /></Link>
                        <ShareButton title={title} href={href} />
                      </footer>
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
