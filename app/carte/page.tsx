import Header from '../../components/site/header'
import Footer from '../../components/site/footer'
import Link from 'next/link'
import { regions } from '../../data/regions'

export default function CartePage() {
  return (
    <>
      <Header />
      <main className="page">
        <div className="container">
          <div className="kicker">Orientation</div>
          <h1>Carte du Niger</h1>
          <p className="lead">Explorez le territoire national et utilisez les fiches régionales pour préparer votre découverte.</p>

          <div className="mapPlaceholder">
            <iframe
              title="Carte interactive du Niger"
              loading="lazy"
              src="https://www.openstreetmap.org/export/embed.html?bbox=0.2%2C11.5%2C15.9%2C23.7&layer=mapnik&marker=17.1%2C13.5"
            />
            <div className="mapOverlay">Carte OpenStreetMap · données cartographiques externes</div>
          </div>

          <div className="sectionHead">
            <div><div className="kicker">Explorer ensuite</div><h2>Choisir une région</h2></div>
          </div>
          <div className="regionGrid">
            {regions.map((region) => (
              <Link className="region regionLight" href={`/regions/${region.slug}`} key={region.slug}>
                <b>{region.name}</b>
                <span>{region.description}</span>
                <strong>Voir la fiche <span>→</span></strong>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
