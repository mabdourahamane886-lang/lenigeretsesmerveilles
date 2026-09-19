import Header from '../../components/site/header'
import Footer from '../../components/site/footer'
import { submitContribution } from './actions'

type SearchParams = Promise<{ sent?: string; error?: string }>

export default async function ContributionPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  return (
    <>
      <Header />
      <main className="page contributionPage">
        <div className="container narrow">
          <div className="kicker">Participation</div>
          <h1>Partager une découverte</h1>
          <p className="lead">Un lieu, une tradition, une histoire, un événement ou une information culturelle : proposez-la à notre équipe. Chaque proposition est vérifiée avant publication.</p>
          {params.sent && <div className="successBanner" role="status"><strong>Merci pour votre contribution.</strong><span>Votre proposition a été enregistrée et sera examinée par l’équipe.</span></div>}
          {params.error && <div className="formError" role="alert">{params.error === 'config' ? 'Le service de données est momentanément indisponible.' : params.error === 'missing' ? 'Veuillez compléter votre nom, le titre et la description.' : 'Impossible d’enregistrer la proposition. Réessayez.'}</div>}
          <form className="contributionForm" action={submitContribution}>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="honeypot" aria-hidden="true" />
            <label>Nom ou organisation<input required name="name" placeholder="Votre nom" maxLength={120} /></label>
            <label>Email <span className="optional">(facultatif)</span><input type="email" name="email" placeholder="votre@email.com" maxLength={180} /></label>
            <label>Type<select name="type" defaultValue="découverte"><option value="découverte">Découverte / patrimoine</option><option value="culture">Culture / tradition</option><option value="evenement">Événement</option><option value="histoire">Histoire / témoignage</option></select></label>
            <label>Titre<input required name="title" placeholder="Ex. Festival culturel à Zinder" maxLength={180} /></label>
            <label>Lieu ou ville <span className="optional">(facultatif)</span><input name="location" placeholder="Ex. Niamey" maxLength={250} /></label>
            <label>Description<textarea required name="description" rows={7} placeholder="Décrivez précisément l’information à partager…" maxLength={5000} /></label>
            <label>Contexte / histoire <span className="optional">(facultatif)</span><textarea name="history" rows={5} placeholder="Ajoutez les éléments historiques ou culturels utiles…" maxLength={5000} /></label>
            <button className="btn primary" type="submit">Envoyer la proposition <span>→</span></button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}
