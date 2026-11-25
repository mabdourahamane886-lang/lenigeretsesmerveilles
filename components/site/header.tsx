import Link from 'next/link'
import Image from 'next/image'
import {
  BookOpenText,
  Languages,
  Camera,
  CalendarDays,
  Compass,
  Menu,
  Search,
  Send,
  Sparkles,
  Utensils,
  Smartphone,
  ShieldCheck,
  PlusCircle,
  Map,
} from 'lucide-react'
import { isAdminAuthenticated } from '../../lib/admin-auth'
import InlineSearch from './inline-search'

const primaryItems = [
  { label: 'Régions', href: '/regions', icon: Compass },
  { label: 'Merveilles', href: '/merveilles', icon: Sparkles },
  { label: 'Culture', href: '/culture', icon: BookOpenText },
  { label: 'Agenda', href: '/evenements', icon: CalendarDays },
  { label: 'Articles', href: '/articles', icon: BookOpenText },
]

const secondaryItems = [
  { label: 'L’application', href: '/application', icon: Smartphone },
  { label: 'Accueil', href: '/', icon: Compass },
  { label: 'Régions', href: '/regions', icon: Compass },
  { label: 'Merveilles', href: '/merveilles', icon: Sparkles },
  { label: 'Articles', href: '/articles', icon: BookOpenText },
  { label: 'Agenda', href: '/evenements', icon: CalendarDays },
  { label: 'Culture', href: '/culture', icon: BookOpenText },
  { label: 'Gastronomie', href: '/gastronomie', icon: Utensils },
  { label: 'Photothèque', href: '/media', icon: Camera },
  { label: 'Publications', href: '/publications', icon: BookOpenText },
  { label: 'Carte du Niger', href: '/carte', icon: Map },
  { label: 'Merveilles IA', href: '/assistant', icon: Sparkles },
  { label: 'Dictionnaire des langues', href: '/dictionnaire', icon: Languages },
]

export default async function Header() {
  const isAdmin = await isAdminAuthenticated()

  return (
    <header className="siteHeader">
      <div className="container siteHeaderInner">
        <Link className="siteBrand" href="/" aria-label="Le Niger et ses Merveilles — Accueil">
          <Image className="siteBrandLogo" src="/images/niger-merveilles-mark.svg" alt="" width={58} height={48} priority />
          <span className="siteBrandCopy" style={{justifyContent:"center",alignSelf:"center"}}>
            <strong>Le Niger et ses Merveilles</strong>
          </span>
        </Link>

        <Link href="/a-propos" aria-label="À propos du projet Le Niger et ses Merveilles" title="Découvrir le projet" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:25,height:25,borderRadius:'50%',background:'#16834a',color:'#fff',flexShrink:0}}><ShieldCheck size={16} aria-hidden="true" /></Link>

        <nav className="siteNav" aria-label="Navigation principale">
          {primaryItems.map(({ label, href }) => <Link href={href} key={href}>{label}</Link>)}
        </nav>

        <div className="siteHeaderActions">
          <InlineSearch />
          <Link className="siteContributeButton" href="/contribution">
            <Send size={14} />
            Contribuer
          </Link>
          <details className="siteMobileMenu">
            <summary aria-label="Ouvrir le menu principal"><Menu size={20} /></summary>
            <div className="siteMobilePanel">
              <div className="siteMobileHead">Explorer le site</div>
              <nav aria-label="Navigation complémentaire">
                {secondaryItems.map(({ label, href, icon: Icon }) => (
                  <Link href={href} key={href}><Icon size={17} /><span>{label}</span></Link>
                ))}
                <Link href="/recherche"><Search size={17} /><span>Recherche</span></Link>
                <Link className="siteMobileCta" href="/contribution"><Send size={17} /><span>Contribuer au projet</span></Link>
                {isAdmin && (
                  <>
                    <div className="siteMobileAdminDivider" aria-hidden="true" />
                    <Link className="siteMobileAdminLink" href="/admin"><ShieldCheck size={17} /><span>Administration</span></Link>
                    <Link className="siteMobileAdminPublish" href="/admin/publications"><PlusCircle size={17} /><span>Gérer les publications</span></Link>
                    <Link className="siteMobileAdminPublish" href="/admin/articles"><PlusCircle size={17} /><span>Publier un article</span></Link>
                  </>
                )}
              </nav>
            </div>
          </details>
        </div>
      </div>
    </header>
  )
}
