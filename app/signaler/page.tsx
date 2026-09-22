import Header from '../../components/site/header'
import Footer from '../../components/site/footer'
import SignalForm from './signal-form'

export default function SignalerPage() {
  return (
    <>
      <Header />
      <main className="page">
        <div className="container narrow">
          <span className="kicker">Qualité documentaire</span>
          <h1>Signaler une erreur</h1>
          <p className="lead">Aidez-nous à maintenir des informations précises. Indiquez la page concernée, le problème observé et, si possible, une source permettant de vérifier la correction.</p>
          <SignalForm />
        </div>
      </main>
      <Footer />
    </>
  )
}
