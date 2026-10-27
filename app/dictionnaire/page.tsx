'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowLeft, BookOpen, ExternalLink, Search, Languages, Copy, Check } from 'lucide-react'
import { NIGER_DICTIONARY, NIGER_LANGUAGES } from '../../lib/niger-dictionaries'
import './dictionnaire.css'

export default function DictionnairePage() {
  const [query, setQuery] = useState('')
  const [language, setLanguage] = useState('all')
  const [copied, setCopied] = useState('')

  const entries = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return NIGER_DICTIONARY.filter((entry) => {
      const languageMatch = language === 'all' || entry.languageCode === language
      const text = [entry.word, entry.french, entry.language, entry.category, entry.community].join(' ').toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      return languageMatch && (!q || text.includes(q))
    })
  }, [query, language])

  async function copyWord(word: string) {
    try {
      await navigator.clipboard.writeText(word)
      setCopied(word)
      window.setTimeout(() => setCopied((current) => current === word ? '' : current), 1500)
    } catch {
      setCopied('')
    }
  }

  return (
    <main className="dictionaryPage">
      <header className="dictionaryHeader">
        <Link href="/assistant" className="dictionaryBack"><ArrowLeft size={17}/> Retour à Niger IA</Link>
        <span className="dictionaryBrand"><span className="dictionaryMark">N</span> Le Niger et ses Merveilles</span>
      </header>
      <section className="dictionaryContent">
        <div className="dictionaryControls">
          <label className="dictionarySearch"><Search size={18}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Chercher un mot, une traduction ou une langue…" /></label>
          <label className="dictionarySelectLabel"><span>Langue</span><select value={language} onChange={(event) => setLanguage(event.target.value)}><option value="all">Toutes les langues</option>{NIGER_LANGUAGES.map((item) => <option key={item.id} value={item.code}>{item.name}</option>)}</select></label>
        </div>

        <div className="dictionaryResultsHead"><div><span className="dictionaryEyebrow">LEXIQUE</span><h2>{entries.length} résultat{entries.length > 1 ? 's' : ''}</h2></div><span>Langue → Français</span></div>
        {entries.length ? <div className="dictionaryGrid">{entries.map((entry) => <article className="dictionaryCard" key={entry.id}>
          <div className="dictionaryCardTop"><span>{entry.language}</span><span>{entry.category}</span></div>
          <div className="dictionaryWordRow"><h3>{entry.word}</h3><button onClick={() => void copyWord(entry.word)} aria-label={'Copier ' + entry.word}>{copied === entry.word ? <Check size={16}/> : <Copy size={16}/>}</button></div>
          <p className="dictionaryMeaning">{entry.french}</p>
          {entry.note && <p className="dictionaryNote">{entry.note}</p>}
          <a href={entry.sourceUrl} target="_blank" rel="noreferrer" className="dictionarySource">{entry.sourceLabel}<ExternalLink size={13}/></a>
        </article>)}</div> : <div className="dictionaryEmpty"><BookOpen size={24}/><strong>Aucun mot trouvé</strong><span>Essayez une autre orthographe ou choisissez « Toutes les langues ».</span></div>}

        <section className="dictionaryLanguages"><div className="dictionaryResultsHead"><div><span className="dictionaryEyebrow">LANGUES & COMMUNAUTÉS</span><h2>Un lexique vivant, à enrichir avec les locuteurs.</h2></div></div>
          <div className="dictionaryLanguageGrid">{NIGER_LANGUAGES.map((item) => <article className="dictionaryLanguageCard" key={item.id}><span>{item.community}</span><h3>{item.name}</h3><p>{item.description}</p><small>{item.status}</small><a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.sourceLabel} <ExternalLink size={13}/></a></article>)}</div>
        </section>

        <aside className="dictionaryDisclaimer"><strong>Précision et respect des langues.</strong><p>Ce premier lexique n’est pas exhaustif. Le Niger compte plusieurs langues et des variantes locales ; une communauté ne correspond pas toujours à une seule langue. Pour éviter de diffuser de faux mots, certaines rubriques sont indiquées comme étant à compléter avec des locuteurs et des spécialistes. Les traductions de départ sont accompagnées de leurs références.</p><Link href="/assistant">Poser une question à Niger IA <ArrowLeft size={15}/></Link></aside>
      </section>
    </main>
  )
}
