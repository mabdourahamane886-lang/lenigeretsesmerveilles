import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight, BookOpenText, CalendarDays, Camera, ChevronRight, Compass, Globe2,
  Home, Languages, Landmark, Map, Menu, Newspaper, Search, Sparkles, Flag, Pin, Settings2,
  Utensils, UserRound, type LucideIcon,
} from 'lucide-react'
import AppLaunch from './app-launch'
import InlineSearch from '../../components/site/inline-search'
import { createAdminClient } from '../../lib/supabase/admin'
import { getPublicationTitle, getPublicationExcerpt } from '../../lib/publications/format'
import styles from './application.module.css'
import { nigerMedia } from '../../data/media'

export const metadata: Metadata = {
  title: 'Application | Le Niger et ses Merveilles',
  description: 'Découvrez les huit régions du Niger, les cultures, les traditions, les publications et Niger IA.',
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Réutiliser les mêmes visuels documentaires que la section « Les univers du Niger » du site.
// Cette source partagée évite les photographies de régions utilisées pour des rubriques sans rapport.
type Universe = { href: string; title: string; subtitle: string; image?: string; collage?: string[]; alt: string; icon: LucideIcon }
const universes: Universe[] = [
  { href: '/regions', title: 'Les 8 régions', subtitle: 'Territoires et paysages', image: nigerMedia.agadez.image, alt: nigerMedia.agadez.alt, icon: Compass },
  { href: '/merveilles', title: 'Les merveilles', subtitle: 'Patrimoine du Niger', image: nigerMedia.tenere.image, alt: nigerMedia.tenere.alt, icon: Sparkles },
  { href: '/culture', title: 'Culture & traditions', subtitle: 'Peuples et savoir-faire', image: nigerMedia.touareg.image, alt: nigerMedia.touareg.alt, icon: BookOpenText },
  { href: '/gastronomie', title: 'Gastronomie', subtitle: 'Saveurs du Niger', image: nigerMedia.gastronomie.image, alt: nigerMedia.gastronomie.alt, icon: Utensils },
  { href: '/evenements', title: 'Les rendez-vous', subtitle: 'Agenda culturel', image: nigerMedia.parcW.image, alt: nigerMedia.parcW.alt, icon: CalendarDays },
  { href: '/media', title: 'Photothèque', subtitle: 'Images du Niger', collage: [nigerMedia.agadez.image, nigerMedia.zinder.image, nigerMedia.tenere.image, nigerMedia.parcW.image], alt: 'Photographies du patrimoine et des paysages du Niger', icon: Camera },
]
const regions = ['Niamey', 'Agadez', 'Zinder', 'Maradi', 'Tahoua', 'Tillabéri', 'Dosso', 'Diffa']
const tools = [
  { href: '/carte', label: 'Carte interactive', icon: Map },
  { href: '/media', label: 'Photothèque', icon: Camera },
  { href: '/articles', label: 'Articles', icon: Newspaper },
  { href: '/evenements', label: 'Agenda', icon: Globe2 },
  { href: '/application/histoire', label: 'Histoire et archives', icon: Landmark },
  { href: '/application/tourisme', label: 'Tourisme', icon: Compass },
  { href: '/dictionnaire', label: 'Dictionnaire des langues', icon: Languages },
  { href: '/application/fossiles', label: 'Fossiles du Niger', icon: Landmark },
  { href: '/application/parametres', label: 'Paramètres', icon: Settings2 },
]
type Publication = {
  id: string
  content: string | null
  media_url: string | null
  media_type: string | null
  published_at: string | null
  pinned_at: string | null
}
async function recentPublications(): Promise<Publication[]> {
  try {
    const client = createAdminClient()
    if (!client) return []
    const { data, error } = await client.from('niger_publications')
      .select('id,content,media_url,media_type,published_at,pinned_at')
      .eq('published', true).eq('visibility', 'public')
      .order('pinned_at', { ascending: false, nullsFirst: false })
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(3)
    if (error) return []
    return data || []
  } catch {
    return []
  }
}

export default async function ApplicationPage() {
  const publications = await recentPublications()
  return (
    <AppLaunch>
    <main className={styles.app}>
      <header className={styles.bar}>
        <div className={styles.barInner}>
          <Link className={styles.brand} href="/application" aria-label="Accueil de l'application">
            <Image src="/images/niger-merveilles-mark.svg" alt="" width={54} height={48} priority />
            <span>Le Niger <small>et ses Merveilles</small></span>
          </Link>
          <div className={styles.headerActions}>
            <details className={styles.appMenu}>
              <summary className={styles.roundAction} aria-label="Ouvrir le menu de l'application" title="Menu de l'application">
                <Menu size={21} aria-hidden="true" />
              </summary>
              <nav className={styles.menuPanel} aria-label="Outils et services de l'application">
                <div className={styles.menuTitle}>Outils et services</div>
                {tools.map(({ href, label, icon: Icon }) => (
                  <Link href={href} key={href} className={styles.menuItem}>
                    <Icon size={19} aria-hidden="true" />
                    <span>{label}</span>
                    <ChevronRight size={16} aria-hidden="true" />
                  </Link>
                ))}
              </nav>
            </details>
          </div>
        </div>
      </header>

      <div className={styles.canvas}>
        <InlineSearch home />

        <section className={styles.hero} aria-labelledby="app-hero-title">
          <Image className={styles.heroImage} src="/images/accueil/fleuve-niger-niamey.webp" alt="Le fleuve Niger à Niamey" fill priority sizes="(max-width: 700px) 100vw, 1152px" />
          <div className={styles.heroContent}>
            <span className={styles.heroEyebrow} style={{display:'inline-flex',alignItems:'center',gap:8}}><Flag size={17} aria-hidden="true"/> Patrimoine · Culture · Découvertes</span>
            <h1 id="app-hero-title">Découvrez le Niger</h1>
            <p>Une terre d’histoire, de culture et de merveilles uniques, des portes du Sahara aux rives du fleuve.</p>
            <span className={styles.heroDots} aria-hidden="true"><i /><i /><i /></span>
          </div>
        </section>

        <section className={styles.welcome}>
          <span className={styles.eyebrow}>Bienvenue dans notre univers</span>
          <h2>Un pays, mille histoires à partager.</h2>
          <p>Explorez les richesses du Niger, ses peuples, ses traditions et son patrimoine exceptionnel à travers une expérience immersive.</p>
        </section>

        <section className={styles.section} aria-labelledby="univers-title">
          <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>À découvrir</span><h2 id="univers-title">Explorer par univers</h2></div><Link href="/explorer" aria-label="Tout explorer"><ChevronRight /></Link></div>
          <div className={styles.universeGrid}>
            {universes.map(({ href, title, subtitle, image, collage, alt, icon: Icon }) => (
              <Link className={styles.universeCard} href={href} key={href}>
                {collage ? (
                  <span className={styles.universeCollage} role="img" aria-label={alt}>
                    {collage.map((src, index) => (
                      <span key={src + index} className={styles.universeCollageTile} style={{ backgroundImage: `url("${src}")` }} />
                    ))}
                  </span>
                ) : (
                  <span className={styles.universeImage} role="img" aria-label={alt} style={{ backgroundImage: `url("${image}")` }} />
                )}
                <span className={styles.universeContent}><Icon size={22} aria-hidden="true" /><strong>{title}</strong><small>{subtitle}</small></span>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="regions-title">
          <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>Les territoires</span><h2 id="regions-title">Les 8 régions du Niger</h2></div><Link href="/regions" className={styles.seeAll}>Tout voir <ArrowRight size={16} /></Link></div>
          <div className={styles.regionRail}>
            {regions.map((region) => <Link key={region} href={`/regions/${region.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`} className={styles.regionPill}>{region}<ChevronRight size={15} /></Link>)}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="editorial-title">
          <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>Notre sélection</span><h2 id="editorial-title">Sélection éditoriale</h2></div><Link href="/merveilles" className={styles.seeAll}>Découvrir <ArrowRight size={16} /></Link></div>
          <Link href="/merveilles" className={styles.editorialCard}>
            <Image src="/images/regions/agadez.webp" alt="Architecture et patrimoine d’Agadez" fill sizes="(max-width: 700px) 100vw, 1152px" />
            <span className={styles.editorialCopy}><small>Patrimoine du Niger</small><strong>Agadez, aux portes du Sahara</strong><span>Explorez les lieux emblématiques et les histoires qui façonnent notre patrimoine. <ArrowRight size={16}/></span></span>
          </Link>
        </section>

        <section className={styles.section} aria-labelledby="publications-title">
          <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>À la une</span><h2 id="publications-title">Publications récentes</h2></div><Link href="/publications" className={styles.seeAll}>Tout voir <ArrowRight size={16} /></Link></div>
          {publications.length ? <div className={styles.publicationGrid}>
            {publications.map((publication) => <Link key={publication.id} className={styles.publicationCard} href={`/publications/${encodeURIComponent(publication.id)}`}>
              {publication.media_url && publication.media_type === 'photo' ? <span className={styles.publicationMedia} style={{backgroundImage: `url("${publication.media_url.replace(/"/g, '%22')}")`}} /> : <span className={styles.publicationMediaFallback}><Newspaper size={36} /></span>}
              <div className={styles.publicationText}>{publication.pinned_at && <small style={{display:'flex',alignItems:'center',gap:5}}><Pin size={13} aria-hidden="true"/> Épinglée</small>}<strong>{getPublicationTitle(publication.content)}</strong><p>{getPublicationExcerpt(publication.content, 100)}</p><span>Lire la publication <ArrowRight size={15}/></span></div>
            </Link>)}
          </div> : <div className={styles.emptyPublications}><Newspaper size={24}/><p>Les prochaines publications seront disponibles ici.</p><Link href="/publications">Voir les publications <ArrowRight size={16}/></Link></div>}
        </section>

        <section className={styles.aiSection} aria-labelledby="ai-title">
          <span className={styles.aiIcon}><Sparkles size={25}/></span>
          <div><span className={styles.aiEyebrow}>Votre guide intelligent</span><h2 id="ai-title">Découvrez Niger IA</h2><p>Posez vos questions sur l’histoire, les langues, les traditions et les merveilles du Niger.</p><Link href="/assistant">Discuter avec Niger IA <ArrowRight size={17}/></Link></div>
        </section>

      </div>
      <nav className={styles.appNav} aria-label="Navigation de l'application">
        {([
          ['/application','Accueil',Home],['/explorer','Explorer',Compass],['/publications','Publications',Newspaper],
          ['/assistant','Niger IA',Sparkles],['/application/profil','Profil',UserRound],
        ] as [string,string,LucideIcon][]).map(([href,label,Icon])=><Link key={href} href={href} aria-current={href === '/application' ? 'page' : undefined}><Icon size={21} aria-hidden="true"/><span>{label}</span></Link>)}
      </nav>
    </main>
    </AppLaunch>
  )
}
