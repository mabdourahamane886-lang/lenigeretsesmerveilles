import Header from '../../components/site/header'
import Footer from '../../components/site/footer'
import { createClient } from '../../lib/supabase/server'
import wonders from '../../data/wonders'

export const dynamic = 'force-dynamic'

export default async function MerveillesPage() {
  const supabase = await createClient()
  const { data } = supabase
    ? await supabase.from('niger_wonders').select('id,name,short_description,description,cover_url,published').eq('published', true).order('name')
    : { data: null }

  const items = data?.length
    ? data.map((wonder) => ({
        id: String(wonder.id),
        name: wonder.name,
        text: wonder.short_description || wonder.description || 'Découvrez ce patrimoine du Niger.',
        image: wonder.cover_url,
      }))
    : wonders.map((wonder, index) => ({
        id: `static-${index}`,
        name: wonder.name,
        text: wonder.text,
        image: wonder.image,
      }))

  return (
    <>
      <Header />
      <main className="page">
        <div className="container">
          <div className="kicker">Patrimoine & découverte</div>
          <h1>Les merveilles du Niger</h1>
          <p className="lead">Explorez les lieux, paysages et patrimoines publiés sur la plateforme.</p>
          <div className="grid">
            {items.map((wonder) => (
              <article className="card" key={wonder.id}>
                <div className="cardimg" style={wonder.image ? { backgroundImage: `url(${wonder.image})` } : undefined} />
                <div className="cardbody">
                  <span className="tag">Merveille du Niger</span>
                  <h3>{wonder.name}</h3>
                  <p>{wonder.text}</p>
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
