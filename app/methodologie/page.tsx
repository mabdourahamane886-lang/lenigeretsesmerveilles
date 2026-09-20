import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileSearch, Image, Scale } from 'lucide-react'
import Header from '../../components/site/header'
import Footer from '../../components/site/footer'

export const metadata = {
  title: 'Méthodologie éditoriale',
  description: 'Comment les contenus de Le Niger et ses Merveilles sont proposés, vérifiés, crédités et publiés.',
}

const steps = [
  ['Proposition', 'Une information, une histoire, une image ou un événement peut être proposé par la communauté.'],
  ['Vérification', 'Les informations sont examinées et comparées aux sources disponibles avant publication.'],
  ['Crédits', 'Les médias référencés conservent leurs sources, auteurs et informations de licence lorsqu’elles sont disponibles.'],
  ['Publication', 'Les contenus validés sont organisés par région et par univers pour faciliter leur découverte.'],
]

export default function MethodologiePage() {
  return (
    <>
      <Header />
      <main className="page">
        <div className="container narrowEvent">
          <div className="kicker">Transparence éditoriale</div>
          <h1>Comment nous documentons et vérifions les contenus.</h1>
          <p className="lead">Une plateforme culturelle gagne en valeur lorsqu’elle explique aussi comment ses informations sont sélectionnées et présentées.</p>
          <div className="mt-10 space-y-4">
            {steps.map(([title,text], index) => (
              <article key={title} className="flex gap-5 rounded-2xl border border-[#e2e5e0] bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef6f1] font-semibold text-[#0b6a43]">{index + 1}</div>
                <div><h2 className="text-xl font-serif">{title}</h2><p className="mt-2 text-sm leading-6 text-[#53615a]">{text}</p></div>
              </article>
            ))}
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              [FileSearch,'Sources','Identifier les références disponibles et distinguer les contenus documentés des contributions à vérifier.'],
              [Image,'Images','Conserver les crédits et informations de licence pour les médias référencés.'],
              [Scale,'Corrections','Permettre de signaler une information à corriger ou à compléter.'],
            ].map(([Icon,title,text]) => {
              const I = Icon as typeof FileSearch
              return <div key={title as string} className="rounded-2xl bg-[#f1f4ef] p-6"><I size={21} className="text-[#0b6a43]"/><h3 className="mt-4 font-serif text-xl">{title as string}</h3><p className="mt-2 text-sm leading-6 text-[#53615a]">{text as string}</p></div>
            })}
          </div>
          <div className="mt-10 rounded-2xl border border-[#e2e5e0] bg-white p-6"><div className="flex items-center gap-2 font-semibold"><CheckCircle2 size={18} className="text-[#0b6a43]"/> Une correction ou une source à proposer ?</div><Link href="/contribution" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0b6a43]">Contribuer <ArrowRight size={15}/></Link></div>
        </div>
      </main>
      <Footer />
    </>
  )
}
