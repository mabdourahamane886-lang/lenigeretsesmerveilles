'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { RefreshCcw, Home } from 'lucide-react'

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Keep production errors private while still allowing diagnostics through the Next.js runtime.
    console.error('Le Niger et ses Merveilles: unexpected application error')
  }, [])

  return (
    <main className="min-h-screen bg-[#10241d] text-white">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-5 text-5xl">🇳🇪</div>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e37b27]">Incident temporaire</span>
        <h1 className="mt-3 text-4xl font-serif font-semibold md:text-5xl">Une erreur est survenue.</h1>
        <p className="mt-5 max-w-xl leading-7 text-white/70">
          Le contenu n’a pas pu être chargé correctement. Vous pouvez réessayer ou revenir à l’accueil.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={() => reset()} className="inline-flex items-center gap-2 rounded-xl bg-[#e37b27] px-5 py-3 font-semibold text-white">
            <RefreshCcw size={17} /> Réessayer
          </button>
          <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 font-semibold">
            <Home size={17} /> Accueil
          </Link>
        </div>
      </div>
    </main>
  )
}
