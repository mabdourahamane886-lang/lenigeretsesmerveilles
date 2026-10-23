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
        return { id: String(region.id), name: region.name, slug: region.slug, image: region.cover_url || fallback?.image }
      })
    : fallbackRegions.map((region, index) => ({ id: `static-${index}`, ...region }))

  return (
    <>
      <Header />
      <main className="page">
        <div className="container">
          <div className="kicker">Explorer le Niger · 8 régions</div>
          <h1>Bienvenue au cœur du Niger 🇳🇪</h1>
          <p className="lead">Découvrez les huit régions du Niger à travers leurs photos.</p>
          <div className="regionGrid">
            {items.map((region) => (
              <Link
                className="region regionLight"
                key={region.id}
                href={`/regions/${region.slug}`}
                aria-label={`Bienvenue à ${region.name} — découvrir la région`}
                style={{display:'block',overflow:'hidden',padding:0,borderRadius:22,textDecoration:'none',background:'#fff',border:'1px solid rgba(18,48,42,.1)',boxShadow:'0 12px 32px rgba(17,45,38,.08)'}}
              >
                <div style={{position:'relative',width:'100%',height:260,backgroundColor:'#e7e8df',backgroundImage:region.image ? `linear-gradient(180deg,rgba(8,24,20,.02) 15%,rgba(8,24,20,.68) 100%),url("${region.image}")` : 'linear-gradient(135deg,#e9efe5,#d6e0d2)',backgroundSize:'cover',backgroundPosition:'center'}}>
                  <div style={{position:'absolute',left:20,right:20,bottom:20,color:'#fff',textShadow:'0 2px 12px rgba(0,0,0,.35)'}}>
                    <span style={{display:'block',fontSize:13,fontWeight:800,textTransform:'uppercase',letterSpacing:'.12em',marginBottom:6}}>Bienvenue à</span>
                    <span style={{display:'block',fontSize:30,lineHeight:1.1,fontWeight:850}}>{region.name}</span>
                  </div>
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
