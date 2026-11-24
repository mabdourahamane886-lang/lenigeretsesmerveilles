import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight, ArrowUpRight, BookOpen, Bookmark, CalendarDays, Camera, ChevronRight,
  Compass, Feather, Languages, Landmark, Map, MapPin, Navigation, Newspaper,
  Search, Send, Sparkles, Utensils, Users, Home, User, Settings, Bell, type LucideIcon,
} from 'lucide-react'
import InstallButton from './install-button'
import styles from './application.module.css'

export const metadata: Metadata = {
  title: 'L’application',
  description: 'Retrouvez les régions, les publications, les langues et la carte du Niger dans une application à installer sur téléphone ou ordinateur.',
}

type Entry = [href: string, title: string, icon: LucideIcon]
const explore: Entry[] = [
  ['/regions', 'Les 8 régions', Compass], ['/merveilles', 'Sites et merveilles', Landmark],
  ['/culture', 'Culture et traditions', Users], ['/gastronomie', 'Gastronomie', Utensils],
  ['/publications', 'Publications', Newspaper], ['/articles', 'Articles', BookOpen],
  ['/evenements', 'Agenda culturel', CalendarDays], ['/media', 'Photothèque', Camera],
  ['/application/histoire', 'Histoire et archives', Landmark], ['/application/fossiles', 'Fossiles', Compass],
  ['/application/bibliotheque', 'Bibliothèque', BookOpen], ['/application/tourisme', 'Tourisme', Navigation],
]
const tools: Entry[] = [
  ['/carte', 'Carte du Niger', Map], ['/assistant', 'Niger IA', Sparkles],
  ['/dictionnaire', 'Dictionnaire des langues', Languages], ['/autour-de-moi', 'Autour de moi', Navigation],
  ['/favoris', 'Mes favoris', Bookmark], ['/contribution', 'Contribuer', Send],
]

const personal: Entry[] = [
  ['/application/profil', 'Mon profil local', User], ['/favoris', 'Mes favoris', Bookmark],
  ['/application/notifications', 'Actualités et alertes', Bell], ['/application/parametres', 'Paramètres', Settings],
]

function Directory({ title, entries }: { title: string; entries: Entry[] }) {
  return (
    <section className={styles.directory} aria-label={title}>
      <h2>{title}</h2>
      <div className={styles.entries}>
        {entries.map(([href, label, Icon]) => (
          <Link key={href} href={href} className={styles.entry}>
            <span className={styles.glyph}><Icon size={19} aria-hidden="true" /></span>
            <span>{label}</span><ChevronRight size={14} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  )
}

export default function ApplicationPage() {
  return (
    <main className={styles.app}>
      <header className={styles.bar}>
        <div className={styles.barInner}>
          <Link className={styles.brand} href="/application" aria-label="Accueil de l’application">
            <Image src="/images/niger-merveilles-mark.svg" alt="" width={68} height={44} priority />
            <span>Le Niger et ses Merveilles</span>
          </Link>
          <InstallButton />
        </div>
      </header>
      <div className={styles.canvas}>
        <div className={styles.titleRow}>
          <h1>Découvrir le Niger</h1>
          <form role="search" action="/recherche" className={styles.search}>
            <input name="q" type="search" maxLength={80} aria-label="Rechercher sur le site" placeholder="Rechercher au Niger…" />
            <button type="submit" aria-label="Lancer la recherche"><Search size={19} /></button>
          </form>
        </div>
        <Link className={styles.feature} href="/regions/agadez">
          <div className={styles.photo}>
            <Image src="/images/regions/agadez.webp" alt="Arche rouge et ocre à l’entrée d’Agadez" fill priority sizes="(min-width: 800px) 58vw, 100vw" />
          </div>
          <div className={styles.featureCopy}>
            <span className={styles.location}><MapPin size={15} /> Région d’Agadez</span>
            <h2>Aux portes d’Agadez</h2>
            <p>Partez à la découverte de l’Aïr, de ses paysages et de ses traditions.</p>
            <span className={styles.featureAction}>Explorer la région <ArrowRight size={16} /></span>
          </div>
        </Link>
        <div className={styles.columns}>
          <Directory title="Explorer" entries={explore} />
          <Directory title="Outils et services" entries={tools.filter(([href]) => href !== '/favoris')} />
          <Directory title="Espace personnel" entries={personal} />
        </div>
        <nav className={styles.foot} aria-label="À propos de l’application">
          <Link href="/a-propos"><Feather size={16} /> Le projet</Link>
          <Link href="/plan-du-site">Toutes les rubriques <ChevronRight size={14} /></Link>
          <Link href="/">Accueil du site <ArrowUpRight size={15} /></Link>
        </nav>
      </div>
      <nav className={styles.appNav} aria-label="Navigation de l’application">
        {([['/application','Accueil',Home],['/publications','Publications',Newspaper],['/assistant','Niger IA',Sparkles],['/carte','Carte',Map],['/application/profil','Profil',User]] as Entry[]).map(([href,label,Icon]) => <Link key={href} href={href}><Icon size={21} aria-hidden="true"/><span>{label}</span></Link>)}
      </nav>
    </main>
  )
}
