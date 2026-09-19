import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footergrid">
        <div className="footerBrand"><div className="brand"><span className="brandmark" aria-hidden="true">🇳🇪</span><span className="brandText"><strong>Le Niger et ses Merveilles</strong><small>Explorer • Comprendre • Préserver</small></span></div><p>Une plateforme numérique dédiée à la découverte, aux événements, à la documentation et à la valorisation du Niger.</p></div>
        <div><h4>Explorer</h4><Link href="/regions">Régions</Link><Link href="/merveilles">Merveilles</Link><Link href="/evenements">Agenda</Link><Link href="/articles">Articles</Link></div>
        <div><h4>Culture</h4><Link href="/culture">Culture</Link><Link href="/gastronomie">Gastronomie</Link><Link href="/media">Photothèque</Link><Link href="/carte">Carte</Link></div>
        <div><h4>Participer</h4><Link href="/contribution">Contribuer</Link><Link href="/recherche">Rechercher</Link><span className="muted footerMuted">Tourisme responsable</span><span className="muted footerMuted">Édition 2026</span></div>
      </div>
      <div className="container copy"><span>© 2026 Le Niger et ses Merveilles — Tous droits réservés.</span><span>🇳🇪 Fait pour raconter le Niger.</span></div>
    </footer>
  )
}
