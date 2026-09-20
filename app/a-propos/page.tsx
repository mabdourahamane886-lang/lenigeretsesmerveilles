import Link from 'next/link'
import { ArrowRight, BookOpenText, Heart, ShieldCheck } from 'lucide-react'
import Header from '../../components/site/header'
import Footer from '../../components/site/footer'

export const metadata = {
  title: 'À propos',
  description: 'Découvrez la mission, la vision et la démarche éditoriale de Le Niger et ses Merveilles.',
}

export default function AProposPage() {
  return (
    <>
      <Header />
      <main className="page">
        <div className="container narrowEvent">
          <div className="kicker">Le projet</div>
          <h1>Faire connaître le Niger, transmettre sa mémoire.</h1>
          <p className="lead">Le Niger et ses Merveilles est une plateforme culturelle et touristique consacrée aux territoires, patrimoines, cultures, savoir-faire, saveurs et récits du Niger.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              [BookOpenText,'Documenter','Rassembler des informations structurées et des récits consacrés aux territoires nigériens.'],
              [ShieldCheck,'Vérifier','Privilégier les contenus documentés, les sources identifiables et les crédits médias.'],
              [Heart,'Transmettre','Créer un espace vivant où les histoires locales peuvent être proposées et préservées.'],
            ].map(([Icon,title,text]) => {
              const I = Icon as typeof BookOpenText
              return <article key={title as string} className="rounded-2xl border border-[#e2e5e0] bg-white p-6 shadow-sm"><I size={22} className="text-[#0b6a43]"/><h2 className="mt-4 text-xl font-serif">{title as string}</h2><p className="mt-2 text-sm leading-6 text-[#53615a]">{text as string}</p></article>
            })}
          </div>
          <section className="mt-10 rounded-3xl bg-[#10241d] p-7 text-white md:p-10">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e37b27]">Participer</span>
            <h2 className="mt-3 text-3xl font-serif">Une histoire, une recette, une photo ou un événement peut enrichir la mémoire collective.</h2>
            <p className="mt-4 max-w-2xl leading-7 text-white/70">Les propositions sont destinées à être vérifiées avant publication.</p>
            <Link href="/contribution" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#e37b27] px-5 py-3 font-semibold">Contribuer <ArrowRight size={16}/></Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
