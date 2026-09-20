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
    ? data.map((region) => {
        const fallback = fallbackRegions.find((item) => item.slug === region.slug)
        return { id: String(region.id), name: region.name, slug: region.slug, description: region.description, image: region.cover_url || fallback?.image, imageCredit: fallback?.imageCredit }
      })
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
              <Link className="region regionLight" key={region.id} href={`/regions/${region.slug}`} style={{overflow:'hidden',padding:0}}>
                {region.image && <div style={{height:190,backgroundImage:`linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.42)),url(${region.image})`,backgroundSize:'cover',backgroundPosition:'center'}} aria-label={`Paysage de la région ${region.name}`} />}
                <div style={{padding:'18px 20px 20px'}}>
                  <span className="regionNumber">{String(index + 1).padStart(2, '0')}</span>
                  <b>{region.name}</b>
                  <span>{region.description || 'Découvrez le patrimoine et les merveilles de cette région.'}</span>
                  {region.imageCredit && <small style={{display:'block',marginTop:10,opacity:.65}}>Photo : {region.imageCredit}</small>}
                  <strong>Explorer <span>→</span></strong>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
