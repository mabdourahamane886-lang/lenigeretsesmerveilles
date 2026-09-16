import Link from 'next/link'
import Header from '../../components/site/header'
import Footer from '../../components/site/footer'
import { regions } from '../../data/regions'

export default function RegionsPage() {
  return <><Header/><main className="page"><div className="container"><div className="kicker">Explorer le Niger</div><h1>Les 8 régions du Niger</h1><p className="lead">Découvrez les territoires, patrimoines, paysages, cultures et expériences de chaque région.</p><div className="regionGrid large">{regions.map((region, i)=><Link className="region" key={region.slug} href={`/regions/${region.slug}`}><span className="regionNumber">0{i+1}</span><b>{region.name}</b><span>{region.description}</span><strong>Explorer →</strong></Link>)}</div></div></main><Footer/></>
}
