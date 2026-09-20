import Header from '../../components/site/header'
import Footer from '../../components/site/footer'
import Link from 'next/link'
import { ArrowRight, Compass, MapPinned } from 'lucide-react'
import { regions } from '../../data/regions'

export const metadata = {
  title: 'Carte du Niger',
  description: 'Explorez les huit régions du Niger. Localisation de référence : Niamey.',
}

export default function CartePage(){
  return (
    <>
      <Header />
      <main className="page">
        <div className="container">
          <div className="contentHeader contentHeaderLarge"><div><span className="kicker">Orientation</span><h1>Le Niger, sur la carte.</h1><p>Repérez les territoires et utilisez les fiches régionales pour poursuivre votre exploration. <strong>Localisation de référence : Niamey.</strong></p></div><div className="contentHeaderMark"><MapPinned size={24}/><span>Niamey · Niger</span></div></div>
          <div className="mapShell">
            <iframe title="Carte interactive du Niger avec repère à Niamey" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=0.2%2C11.5%2C15.9%2C23.7&layer=mapnik&marker=13.5127%2C2.1128" />
            <div className="mapShellTop"><span>OpenStreetMap</span><span>📍 Niamey · 13.5127, 2.1128</span></div>
            <div className="mapShellBottom"><Compass size={16}/><span>Point de référence : Niamey. Utilisez la carte pour vous orienter, puis ouvrez une fiche régionale.</span></div>
          </div>
          <section className="catalogSection"><div className="contentHeader"><div><span className="kicker">8 territoires</span><h2>Choisir une région.</h2></div></div><div className="proRegionGrid">{regions.map((region,index)=><Link className="proRegionCard" href={'/regions/' + region.slug} key={region.slug}><span className="proRegionNumber">{String(index+1).padStart(2,'0')}</span><div className="proRegionName">{region.name}</div><p>{region.description}</p><span className="proRegionArrow"><ArrowRight size={16}/></span></Link>)}</div></section>
        </div>
      </main>
      <Footer />
    </>
  )
}
