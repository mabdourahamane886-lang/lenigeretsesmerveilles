import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
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
        return {
          id: String(region.id),
          name: fallback?.name || region.name || '',
          slug: fallback?.slug || region.slug,
          description: fallback?.description || region.description || 'Découvrez le patrimoine et les activités de cette région du Niger.',
          image: region.cover_url || fallback?.image,
        }
      })
    : fallbackRegions.map((region, index) => ({ id: `static-${index}`, ...region }))

  return (
    <>
      <Header />
      <main className="page">
        <div className="container">
          <div className="kicker">Explorer le Niger · 8 régions</div>
          <h1>Bienvenue au cœur du Niger 🇳🇪</h1>
          <p className="lead">Découvrez les paysages, les cultures, les activités et le rôle de chaque région dans la vie du pays.</p>
          <div className="regionGrid" style={{alignItems:'stretch',gap:24}}>
            {items.map((region) => (
              <article
                className="region regionLight"
                key={region.id}
                style={{display:'flex',flexDirection:'column',overflow:'hidden',padding:0,borderRadius:22,background:'#fff',border:'1px solid rgba(18,48,42,.1)',boxShadow:'0 12px 32px rgba(17,45,38,.08)',height:'100%'}}
              >
                <Link href={`/regions/${region.slug}`} aria-label={`Bienvenue à ${region.name}`} style={{display:'block',textDecoration:'none'}}>
                  <div style={{position:'relative',width:'100%',height:250,backgroundColor:'#e7e8df',backgroundImage:region.image ? `linear-gradient(180deg,rgba(8,24,20,.02) 15%,rgba(8,24,20,.72) 100%),url("${region.image}")` : 'linear-gradient(135deg,#e9efe5,#d6e0d2)',backgroundSize:'cover',backgroundPosition:'center'}}>
                    <div style={{position:'absolute',left:20,right:20,bottom:20,color:'#fff',textShadow:'0 2px 12px rgba(0,0,0,.4)'}}>
                      <span style={{display:'block',fontSize:12,fontWeight:800,textTransform:'uppercase',letterSpacing:'.13em',marginBottom:7}}>Bienvenue à</span>
                      <span style={{display:'block',fontSize:30,lineHeight:1.1,fontWeight:850}}>{region.name}</span>
                    </div>
                  </div>
                </Link>
                <div style={{display:'flex',flexDirection:'column',alignItems:'stretch',gap:18,padding:'22px 22px 24px',flex:1}}>
                  <p style={{margin:0,color:'#4e6159',fontSize:14,lineHeight:1.85,whiteSpace:'pre-line'}}>{region.description}</p>
                  <Link
                    href={`/regions/${region.slug}`}
                    className="proInlineLink"
                    style={{marginTop:'auto',alignSelf:'stretch',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:9,padding:'12px 17px',borderRadius:999,background:'#145c43',color:'#fff',fontWeight:800,textDecoration:'none',boxShadow:'0 6px 16px rgba(20,92,67,.18)',width:'100%',minHeight:48}}
                  >
                    Explorer la région <ArrowUpRight size={17}/>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
