import Header from '../../components/site/header'
import Footer from '../../components/site/footer'
import FavoritesList from './favorites-list'

export default function FavoritesPage() {
  return (
    <>
      <Header />
      <main className="page">
        <div className="container">
          <span className="kicker">Ma sélection</span>
          <h1>Favoris</h1>
          <p className="lead">Vos liens enregistrés sont conservés localement dans ce navigateur.</p>
          <FavoritesList />
        </div>
      </main>
      <Footer />
    </>
  )
}
