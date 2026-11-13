import Header from '../../components/site/header'
import RegionExplorer from '../../components/site/region-explorer'
import { createClient } from '../../lib/supabase/server'
import { regions as fallbackRegions } from '../../data/regions'

export const dynamic = 'force-dynamic'

export default async function RegionsPage() {
  const supabase = await createClient()
  const { data } = supabase
    ? await supabase.from('niger_regions').select('id,name,slug,description,cover_url')
    : { data: null }

  const items = fallbackRegions.map((fallback, index) => {
    const stored = data?.find((region) => region.slug === fallback.slug)
    return {
      id: stored?.id ? String(stored.id) : `static-${index}`,
      name: fallback.name,
      slug: fallback.slug,
      image: stored?.cover_url || fallback.image || null,
      description: stored?.description || fallback.description,
    }
  })

  return (
    <>
      <Header />
      <main className="page regionDirectoryPage">
        <div className="container">
          <section className="regionDirectoryIntro">
            <div className="kicker">Les territoires · Niger 🇳🇪</div>
            <h1>8 régions, 8 portes d’entrée vers la découverte.</h1>
            <p>Des paysages du Sahara aux rives du fleuve Niger, explorez les territoires, les patrimoines et les cultures qui composent le pays.</p>
            <a href="#regions-list" className="regionIntroLink">Explorer les régions <span aria-hidden="true">↘</span></a>
          </section>
          <section id="regions-list" className="regionDirectoryList" aria-label="Les huit régions du Niger">
            <RegionExplorer regions={items} />
          </section>
        </div>
      </main>
    </>
  )
}
