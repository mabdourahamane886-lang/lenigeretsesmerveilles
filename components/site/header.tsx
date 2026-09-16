import Link from 'next/link'

export default function Header() {
  return (
    <>
      <div className="topbar"><div className="container">🇳🇪 Le patrimoine, les cultures et les paysages du Niger réunis dans une seule plateforme.</div></div>
      <header className="nav">
        <div className="container navin">
          <Link className="brand" href="/">
            <span className="brandmark">🇳🇪</span>
            <span>Le Niger et ses Merveilles<small>Explorer • Comprendre • Préserver</small></span>
          </Link>
          <nav className="links" aria-label="Navigation principale">
            <Link href="/regions">Régions</Link><Link href="/merveilles">Merveilles</Link><Link href="/culture">Culture</Link><Link href="/carte">Carte</Link>
          </nav>
          <Link className="navbtn" href="/contribution">Contribuer</Link>
        </div>
      </header>
    </>
  )
}
