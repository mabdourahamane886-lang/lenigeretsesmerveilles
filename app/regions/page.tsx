import Link from 'next/link'
import Header from '../../components/site/header'
import Footer from '../../components/site/footer'
import { createClient } from '../../lib/supabase/server'
import { regions as fallbackRegions } from '../../data/regions'

export const dynamic = 'force-dynamic'

export default async function RegionsPage() {
  const supabase = await createClient()
  const { data } = supabase
    ? await supabase.from('niger_regions').select('id,name,slug,description,cover_url').order('name')
    : { data: null }

  const items = data?.length
    ? data.map((region) => ({ id: String(region.id), name: region.name, slug: region.slug, description: region.description }))
    : fallbackRegions.map((region, index) => ({ id: `static-${index}`, ...region }))

  return (
    <>
      <Header />
      <main className="page">
        <div className="container">
          <div className="kicker">Explorer le Niger</div>
          <h1>Les 8 régions du Niger</h1>
          <p className="lead">Découvrez les territoires, patrimoines, paysages, cultures et expériences de chaque région.</p>
          <div className="regionGrid">
            {items.map((region, index) => (
              <Link className="region regionLight" key={region.id} href={`/regions/${region.slug}`}>
                <span className="regionNumber">{String(index + 1).padStart(2, '0')}</span>
                <b>{region.name}</b>
                <span>{region.description || 'Découvrez le patrimoine et les merveilles de cette région.'}</span>
                <strong>Explorer <span>→</span></strong>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
