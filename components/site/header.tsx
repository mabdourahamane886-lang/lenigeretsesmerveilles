import Link from 'next/link'

const navItems = [
  ['Régions', '/regions'],
  ['Merveilles', '/merveilles'],
  ['Culture', '/culture'],
  ['Carte', '/carte'],
]

export default function Header() {
  return (
    <>
      <div className="topbar">
        <div className="container topbarInner">
          <span>🇳🇪 Le patrimoine, les cultures et les paysages du Niger.</span>
          <span className="topbarAccent">Explorer · Comprendre · Préserver</span>
        </div>
      </div>

      <header className="nav">
        <div className="container navin">
          <Link className="brand" href="/" aria-label="Le Niger et ses Merveilles — Accueil">
            <span className="brandmark" aria-hidden="true">🇳🇪</span>
            <span className="brandText"><strong>Le Niger et ses Merveilles</strong><small>Explorer • Comprendre • Préserver</small></span>
          </Link>

          <nav className="links" aria-label="Navigation principale">
            {navItems.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
          </nav>

          <div className="navActions">
            <Link className="navMap" href="/carte">Carte</Link>
            <Link className="navbtn" href="/contribution">Contribuer</Link>
            <details className="mobileMenu">
              <summary aria-label="Ouvrir le menu">☰</summary>
              <nav aria-label="Navigation mobile">
                {navItems.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
                <Link href="/contribution">Contribuer au projet</Link>
              </nav>
            </details>
          </div>
        </div>
      </header>
    </>
  )
}
