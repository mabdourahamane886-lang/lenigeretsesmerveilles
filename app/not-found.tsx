import Link from 'next/link'
import { ArrowLeft, Compass, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#fbfaf6] text-[#10241d]">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-6 text-7xl font-serif text-[#0b6a43]">404</div>
        <span className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#e37b27]">Page introuvable</span>
        <h1 className="max-w-2xl text-4xl font-serif font-semibold md:text-6xl">Cette découverte n’existe pas encore.</h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#53615a]">
          La page demandée a peut-être été déplacée. Continuez votre exploration du Niger depuis les régions ou la recherche.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-[#e37b27] px-5 py-3 font-semibold text-white shadow-lg shadow-orange-900/10">
            <ArrowLeft size={17} /> Accueil
          </Link>
          <Link href="/regions" className="inline-flex items-center gap-2 rounded-xl bg-[#0b6a43] px-5 py-3 font-semibold text-white">
            <Compass size={17} /> Explorer les régions
          </Link>
          <Link href="/recherche" className="inline-flex items-center gap-2 rounded-xl border border-[#d9ddd8] bg-white px-5 py-3 font-semibold">
            <Search size={17} /> Recherche
          </Link>
        </div>
      </div>
    </main>
  )
}
