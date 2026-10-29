import Link from 'next/link'
import { ArrowRight, BookOpen, Brain, Languages, Library, ShieldCheck, Sparkles } from 'lucide-react'

const modules = [
  {
    title: 'Conversation avec Niger IA',
    description: 'Pose tes questions sur le Niger, son histoire, ses régions, ses traditions et son patrimoine.',
    icon: Brain,
    href: '/assistant',
    status: 'Disponible',
  },
  {
    title: 'Langues et dictionnaires',
    description: 'Explore les langues nationales et les traductions présentes dans la base actuelle. Les entrées doivent être vérifiées selon leur statut.',
    icon: Languages,
    href: '/assistant',
    status: 'Base existante',
  },
  {
    title: 'Connaissances et sources',
    description: 'Prochaine étape : améliorer les références, les liens vérifiables et la traçabilité des réponses.',
    icon: BookOpen,
    href: '/assistant',
    status: 'À renforcer',
  },
  {
    title: 'Historique et bibliothèque',
    description: 'Retrouve les discussions et outils déjà disponibles dans l’interface principale de Niger IA.',
    icon: Library,
    href: '/assistant',
    status: 'Interface existante',
  },
  {
    title: 'Mémoire durable facultative',
    description: 'Gère séparément les informations que tu choisis explicitement d’enregistrer dans ton compte.',
    icon: ShieldCheck,
    href: '/assistant/memory',
    status: 'Connexion requise',
  },
]

export default function NigerIAFeaturesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="mb-8 rounded-3xl bg-slate-950 px-6 py-8 text-white sm:px-10 sm:py-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-sm text-slate-200">
          <Sparkles size={16} aria-hidden="true" /> Le Niger et ses Merveilles
        </div>
        <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">Niger IA — centre des fonctionnalités</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">
          Un espace organisé pour explorer le patrimoine du Niger, les langues, les connaissances documentées et les outils de l’assistant.
        </p>
        <Link href="/assistant" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
          Ouvrir la conversation <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>

      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">Modules de Niger IA</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">Les états affichés distinguent les éléments déjà présents des améliorations prévues.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon
          return (
            <article key={module.title} className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
                <Icon size={22} aria-hidden="true" />
              </div>
              <div className="mb-2">
                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{module.status}</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{module.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{module.description}</p>
              <Link href={module.href} className="mt-5 inline-flex min-h-10 items-center gap-2 font-semibold text-slate-900 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">
                Accéder au module <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </article>
          )
        })}
      </div>

      <p className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        La mémoire durable nécessite une session connectée et la migration Supabase correspondante. Les modules indiqués « à renforcer » ne sont pas présentés comme achevés.
      </p>
    </main>
  )
}
