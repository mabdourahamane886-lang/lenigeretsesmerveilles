import Header from '../../components/site/header'
import Footer from '../../components/site/footer'
import Link from 'next/link'
import { regions } from '../../data/regions'

export default function CartePage(){return <><Header/><main className="page"><div className="container"><div className="kicker">Orientation</div><h1>Carte du Niger</h1><p className="lead">Explorez les huit régions depuis une interface simple. La carte géographique interactive pourra ensuite être connectée à des coordonnées et points d’intérêt.</p><div className="mapPlaceholder"><div className="mapPin">🇳🇪</div><h2>Carte interactive en préparation</h2><p className="muted">La structure est prête pour intégrer une carte OpenStreetMap/MapLibre sans exposer de clé secrète.</p></div><div className="regionGrid large">{regions.map(r=><Link className="region" href={`/regions/${r.slug}`} key={r.slug}><b>{r.name}</b><span>Voir la région →</span></Link>)}</div></div></main><Footer/></>}
