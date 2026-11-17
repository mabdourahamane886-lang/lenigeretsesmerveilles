import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, Camera, Compass, Send, BookOpenText } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="siteFooter">
      <div className="container">
        <div className="siteFooterTop">
          <div className="siteFooterBrand">
            <Link className="siteBrand siteFooterBrandLink" href="/">
              <Image className="siteBrandLogo siteFooterLogo" src="/images/niger-merveilles-mark.svg" alt="" width={58} height={48} />
              <span className="siteBrandCopy">
                <strong>Le Niger et ses Merveilles</strong>
                <small>Explorer · Comprendre · Préserver</small>
              </span>
            </Link>
            <p>Une plateforme de référence pour découvrir les territoires, les patrimoines, les cultures et les histoires du Niger.</p>
            <Link href="/contribution" className="siteFooterContribution"><Send size={15} /> Contribuer à la valorisation du Niger</Link>
          </div>

          <div className="siteFooterColumn">
            <h3>Explorer</h3>
            <Link href="/regions">Les 8 régions</Link>
            <Link href="/merveilles">Sites & merveilles</Link>
            <Link href="/culture">Culture & traditions</Link>
            <Link href="/gastronomie">Gastronomie</Link>
            <Link href="/carte"><Compass size={14} /> Carte du Niger</Link>
          </div>

          <div className="siteFooterColumn">
            <h3>Actualités & médias</h3>
            <Link href="/evenements">Agenda culturel</Link>
            <Link href="/articles"><BookOpenText size={14} /> Articles</Link>
            <Link href="/publications">Publications</Link>
            <Link href="/media"><Camera size={14} /> Photothèque</Link>
            <Link href="/assistant">Merveilles IA</Link>
          </div>

          <div className="siteFooterColumn siteFooterFeatured">
            <span className="siteFooterKicker">Notre engagement</span>
            <h3>Faire connaître le Niger, transmettre ses richesses et préserver sa mémoire.</h3>
            <p>Un espace éditorial consacré à la diversité des régions, aux savoir-faire et aux patrimoines nigériens.</p>
          </div>
        </div>

        <div className="siteFooterBottom">
          <span>© {new Date().getFullYear()} Le Niger et ses Merveilles. Tous droits réservés.</span>
          <span className="footerMade">Une fenêtre ouverte sur le Niger.</span>
          <Link href="/recherche">Recherche <ArrowUpRight size={13} /></Link>
        </div>
      </div>
    </footer>
  )
}
