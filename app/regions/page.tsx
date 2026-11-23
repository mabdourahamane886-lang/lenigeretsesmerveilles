import Header from '../../components/site/header'
import RegionCards from '../../components/regions/region-cards'

export const metadata = {
  title: 'Les huit régions du Niger',
  description: 'Découvrez les paysages, le patrimoine et les cultures des huit régions du Niger.',
}

export default function RegionsPage() {
  return (
    <>
      <Header />
      <main className="page">
        <div className="container">
          <section style={{ padding: '32px 0 24px' }}>
            <h1>Les huit régions du Niger</h1>
            <p className="lead">Découvrez les paysages, le patrimoine et les cultures de chaque région.</p>
          </section>
          <RegionCards />
        </div>
      </main>
    </>
  )
}
