import Link from 'next/link'
import { ArrowUpRight, Camera, Compass, Send } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="siteFooter">
      <div className="container">
        <div className="siteFooterTop">
          <div className="siteFooterBrand">
            <Link className="siteBrand siteFooterBrandLink" href="/">
              <span className="siteBrandMark" aria-hidden="true"><span /><span /><span /></span>
              <span className="siteBrandCopy">
                <span className="footerBrandFlag proNigerFlag" aria-label="Niger" role="img"><i /><i /><i /></span><strong>Le Niger et ses Merveilles</strong>
                <small>Explorer · Comprendre · Préserver</small>
              </span>
            </Link>
            <p>
              Une plateforme numérique consacrée aux territoires, aux patrimoines,
              aux cultures et aux histoires qui composent le Niger.
            </p>
            <Link href="/contribution" className="siteFooterContribution"><Send size={15} /> Participer au projet</Link>
          </div>

          <div className="siteFooterColumn">
            <h3>Explorer</h3>
            <Link href="/regions">Les 8 régions</Link>
            <Link href="/merveilles">Merveilles</Link>
            <Link href="/culture">Culture</Link>
            <Link href="/gastronomie">Gastronomie</Link>
          </div>

          <div className="siteFooterColumn">
            <h3>Découvrir</h3>
            <Link href="/evenements">Agenda</Link>
            <Link href="/articles">Articles</Link>
            <Link href="/media"><Camera size={14} />Photothèque</Link>
            <Link href="/carte"><Compass size={14} />Carte du Niger</Link>
          </div>

          <div className="siteFooterColumn siteFooterFeatured">
            <span className="siteFooterKicker">Notre mission</span>
            <h3>Rendre le patrimoine du Niger plus visible, plus accessible et mieux documenté.</h3>
            <p>Les contenus proposés par la communauté sont vérifiés avant leur publication.</p>
          </div>
        </div>

        <div className="siteFooterBottom">
          <span>© 2026 Le Niger et ses Merveilles</span>
          <span className="footerMade"><span className="proNigerFlag" aria-label="Niger" role="img"><i /><i /><i /></span> Fait pour raconter le Niger.</span>
          <Link href="/recherche">Rechercher <ArrowUpRight size={13} /></Link>
        </div>
      </div>
    </footer>
  )
}
