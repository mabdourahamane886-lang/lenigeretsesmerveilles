'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import styles from './inline-search.module.css'
import { Search, X } from 'lucide-react'

type Result = { title: string; href: string; category: string }
export default function InlineSearch({ home = false }: { home?: boolean }) {
  const [open, setOpen] = useState(home)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => { if (open && !home) input.current?.focus() }, [open])
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
    <div className={styles.root} style={home ? {width:'100%',maxWidth:720,flex:'1 1 auto',display:'block'} : {flex:'0 0 auto',minWidth:0,width:44}}>
      {!home && <button type="button" className="siteSearchButton" style={{display:'grid',placeItems:'center',width:44,height:44,borderRadius:'50%',background:'#fff',color:'#124c39',border:'1px solid #dce6df',flexShrink:0}} aria-label="Rechercher" aria-expanded={open} onClick={()=>setOpen(value=>!value)}><Search size={20}/></button>}
      {open && <div role="search" className={styles.panel} style={home ? {position:'relative',width:'100%',maxWidth:'none',padding:8,borderRadius:999,boxShadow:'0 8px 28px #0002'} : {position:'fixed',top:'max(76px, env(safe-area-inset-top))',left:'12px',right:'12px',width:'auto',maxWidth:560,margin:'0 auto',zIndex:1001,borderRadius:12,padding:8,boxShadow:'0 8px 30px #0003'}}>
        <div className={styles.field}>
          <Search size={18} aria-hidden="true"/>
          <input ref={input} onFocus={()=>setOpen(true)} aria-label="Rechercher dans Le Niger et ses merveilles" placeholder="Rechercher une merveille, un article…" value={query} onChange={event=>setQuery(event.target.value)} className={styles.input}/>
          {!home && open && <button className={styles.close} type="button" aria-label="Fermer" onClick={()=>setOpen(false)}><X size={18}/></button>}
        </div>
        {open && <div aria-live="polite" className={styles.results}>
          {loading ? 'Recherche en cours…' : query.trim().length < 2 ? 'Saisissez au moins deux caractères.' : results.length ? results.map(result => <Link key={result.href} href={result.href} onClick={()=>setOpen(false)} style={{display:'block',padding:'10px 4px',borderBottom:'1px solid #eee'}}><strong>{result.title}</strong><small style={{display:'block'}}>{result.category}</small></Link>) : 'Aucun résultat.'}
        </div>}
      </div>}
    </div>
  )
}
