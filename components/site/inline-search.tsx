'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import styles from './inline-search.module.css'
import { Search, X } from 'lucide-react'

type Result = { title: string; href: string; category: string }
export default function InlineSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => { if (open) input.current?.focus() }, [open])
  useEffect(() => {
    if (!open || query.trim().length < 2) { setResults([]); setLoading(false); return }
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/site-search?q=' + encodeURIComponent(query.trim()), { signal: controller.signal })
        if (!response.ok) throw new Error('Recherche indisponible')
        const data: { results?: Result[] } = await response.json()
        setResults(data.results || [])
      } catch (error) { if (!controller.signal.aborted) setResults([]) }
      finally { if (!controller.signal.aborted) setLoading(false) }
    }, 250)
    return () => { clearTimeout(timer); controller.abort() }
  }, [open, query])
  return (
    <div className={styles.root}>
      <div role="search" className={styles.panel}>
        <div className={styles.field}>
          <Search size={18} aria-hidden="true"/>
          <input ref={input} onFocus={()=>setOpen(true)} aria-label="Rechercher dans Le Niger et ses merveilles" placeholder="Rechercher une merveille, un article…" value={query} onChange={event=>setQuery(event.target.value)} className={styles.input}/>
          {open && <button className={styles.close} type="button" aria-label="Fermer" onClick={()=>setOpen(false)}><X size={18}/></button>}
        </div>
        {open && <div aria-live="polite" className={styles.results}>
          {loading ? 'Recherche en cours…' : query.trim().length < 2 ? 'Saisissez au moins deux caractères.' : results.length ? results.map(result => <Link key={result.href} href={result.href} onClick={()=>setOpen(false)} style={{display:'block',padding:'10px 4px',borderBottom:'1px solid #eee'}}><strong>{result.title}</strong><small style={{display:'block'}}>{result.category}</small></Link>) : 'Aucun résultat.'}
        </div>}
      </div>
    </div>
  )
}
