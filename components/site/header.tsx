import Link from 'next/link'
import {
  BookOpenText,
  Camera,
  CalendarDays,
  Compass,
  Menu,
  Search,
  Send,
  Sparkles,
  Utensils,
  ShieldCheck,
  PlusCircle,
} from 'lucide-react'
import { isAdminAuthenticated } from '../../lib/admin-auth'

const navItems = [
  { label: 'Régions', href: '/regions', icon: Compass },
  { label: 'Merveilles', href: '/merveilles', icon: Sparkles },
  { label: 'Agenda', href: '/evenements', icon: CalendarDays },
  { label: 'Culture', href: '/culture', icon: BookOpenText },
]

const mobileItems = [
  ...navItems,
  { label: 'Gastronomie', href: '/gastronomie', icon: Utensils },
  { label: 'Photothèque', href: '/media', icon: Camera },
]

export default async function Header() {
  const isAdmin = await isAdminAuthenticated()

  return (
    <>
      <header className="siteHeader">
        <div className="container siteHeaderInner">
          <div className="siteHeaderMobileLeft">
            <Link className="siteSearchButton" href="/recherche" aria-label="Rechercher sur le site">
              <Search size={18} />
            </Link>
          </div>

          <Link className="siteBrand" href="/" aria-label="Le Niger et ses Merveilles, accueil">
            <span className="siteBrandMark" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="siteBrandCopy">
              <span className="siteBrandFlag" aria-label="Niger">🇳🇪</span>
              <strong>Le Niger et ses Merveilles</strong>
              <small>Explorer · Comprendre · Préserver</small>
            </span>
          </Link>

          <nav className="siteNav" aria-label="Navigation principale">
            {navItems.map(({ label, href, icon: Icon }) => (
              <Link href={href} key={href}>
                <Icon size={15} />
                {label}
              </Link>
            ))}
            <Link href="/articles"><BookOpenText size={15} />Articles</Link>
            <Link href="/carte"><Compass size={15} />Carte</Link>
          </nav>

          <div className="siteHeaderActions">
            <Link className="siteSearchButton siteDesktopSearch" href="/recherche" aria-label="Rechercher sur le site">
              <Search size={18} />
            </Link>
            <Link className="siteContributeButton" href="/contribution">
              <Send size={14} />
              Contribuer
            </Link>

            <details className="siteMobileMenu">
              <summary aria-label="Ouvrir le menu principal"><Menu size={20} /></summary>
              <div className="siteMobilePanel">
                <div className="siteMobileHead">
                  <span>Navigation</span>
                  <span className="siteMiniFlag">🇳🇪</span>
                </div>
                <nav aria-label="Navigation mobile">
                  {mobileItems.map(({ label, href, icon: Icon }) => (
                    <Link href={href} key={href}><Icon size={17} /><span>{label}</span></Link>
                  ))}
                  <Link href="/articles"><BookOpenText size={17} /><span>Articles</span></Link>
                  <Link href="/carte"><Compass size={17} /><span>Carte</span></Link>
                  <Link href="/recherche"><Search size={17} /><span>Recherche</span></Link>
                  <Link className="siteMobileCta" href="/contribution"><Send size={17} /><span>Contribuer au projet</span></Link>
                  {isAdmin && (
                    <>
                      <div className="siteMobileAdminDivider" aria-hidden="true" />
                      <Link className="siteMobileAdminLink" href="/admin">
                        <ShieldCheck size={17} /><span>Administration</span>
                      </Link>
                      <Link className="siteMobileAdminPublish" href="/admin/evenements">
                        <PlusCircle size={17} /><span>Publier un événement</span>
                      </Link>
                      <Link className="siteMobileAdminPublish" href="/admin/articles">
                        <PlusCircle size={17} /><span>Publier un article</span>
                      </Link>
                    </>
                  )}
                </nav>
              </div>
            </details>
          </div>
        </div>
      </header>
    </>
  )
}
