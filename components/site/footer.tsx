import Link from 'next/link'

export default function Footer() {
  return <footer className="footer"><div className="container footergrid">
    <div><div className="brand"><span className="brandmark">🇳🇪</span><span>Le Niger et ses Merveilles<small>Explorer • Comprendre • Préserver</small></span></div><p className="muted">Une plateforme numérique dédiée à la découverte et à la valorisation du Niger.</p></div>
    <div><h4>Explorer</h4><Link href="/regions">Régions</Link><Link href="/merveilles">Merveilles</Link><Link href="/culture">Culture</Link></div>
    <div><h4>Plateforme</h4><Link href="/carte">Carte</Link><Link href="/contribution">Contribuer</Link><Link href="/">Accueil</Link></div>
    <div><h4>Projet</h4><span className="muted">Tourisme responsable</span><span className="muted">Patrimoine numérique</span><span className="muted">© 2026</span></div>
  </div><div className="container copy">© 2026 Le Niger et ses Merveilles — Tous droits réservés.</div></footer>
}
