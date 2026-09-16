import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '../../../components/site/header'
import Footer from '../../../components/site/footer'
import { regions } from '../../../data/regions'

export function generateStaticParams() { return regions.map(r => ({ slug: r.slug })) }

export default async function RegionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const region = regions.find(r => r.slug === slug)
  if (!region) notFound()
  return <><Header/><main className="page"><div className="container"><Link className="back" href="/regions">← Toutes les régions</Link><div className="kicker">Région du Niger</div><h1>{region.name}</h1><p className="lead">{region.description}</p><div className="detailGrid"><section className="detailCard"><span>🏛️</span><h2>Patrimoine</h2><p>Monuments, sites historiques et savoir-faire à documenter et préserver.</p></section><section className="detailCard"><span>🌍</span><h2>Paysages</h2><p>Des espaces naturels et des itinéraires à découvrir de manière responsable.</p></section><section className="detailCard"><span>👥</span><h2>Culture</h2><p>Traditions, langues, artisanat, gastronomie et récits des communautés.</p></section></div><div className="notice"><strong>Contenu participatif</strong><p>Cette fiche pourra être enrichie avec des photos, lieux, événements et témoignages validés.</p><Link className="btn primary" href="/contribution">Proposer une découverte</Link></div></div></main><Footer/></>
}
