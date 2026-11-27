'use client'
import { useEffect, useId, useState } from 'react'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import styles from './inline-search.module.css'

type Result = {title:string;href:string;category:string}
export default function InlineSearch({home = false}:{home?:boolean}) {
 const id=useId()
 const [query,setQuery]=useState('')
 const [results,setResults]=useState<Result[]>([])
 const [status,setStatus]=useState<'idle'|'loading'|'ready'|'error'>('idle')
 const [retry,setRetry]=useState(0)
 useEffect(()=>{
  const q=query.trim()
  if(q.length<2){setResults([]);setStatus('idle');return}
  const controller=new AbortController()
  const timer=setTimeout(async()=>{
   try{
    const response=await fetch('/api/site-search?q='+encodeURIComponent(q),{signal:controller.signal,cache:'no-store'})
    if(!response.ok)throw new Error('Search failed')
    const data=await response.json() as {results?:Result[]}
    if(!controller.signal.aborted){setResults(data.results||[]);setStatus('ready')}
   }catch{if(!controller.signal.aborted){setResults([]);setStatus('error')}}
  },250)
  return()=>{clearTimeout(timer);controller.abort()}
 },[query,retry])
 function change(value:string){setQuery(value);setResults([]);setStatus(value.trim().length>=2?'loading':'idle')}
 return <div className={styles.root} data-home={home}>
  <div role="search" className={styles.panel}>
   <form className={styles.field} onSubmit={e=>{e.preventDefault();if(query.trim().length>=2){setStatus('loading');setRetry(n=>n+1)}}}>
    <Search size={19} aria-hidden="true"/>
    <input type="search" maxLength={80} aria-label="Rechercher dans Le Niger et ses Merveilles" aria-controls={id} placeholder="Rechercher au Niger…" value={query} onChange={e=>change(e.target.value)} onKeyDown={e=>{if(e.key==='Escape')change('')}} className={styles.input}/>
    {query&&<button className={styles.close} type="button" aria-label="Effacer la recherche" onClick={()=>change('')}><X size={18}/></button>}
   </form>
   <div id={id} aria-live="polite" aria-busy={status==='loading'} className={styles.results} hidden={!query.trim()}>
    {status==='idle'?<p>Saisissez au moins deux caractères.</p>:status==='loading'?<p>Recherche en cours…</p>:status==='error'?<p>Recherche indisponible. <button type="button" onClick={()=>{setStatus('loading');setRetry(n=>n+1)}}>Réessayer</button></p>:results.length?<><p>{results.length} résultat(s)</p>{results.map((result,index)=><Link key={result.href+index} href={result.href} onClick={()=>change('')} className={styles.result}><strong>{result.title}</strong><small>{result.category}</small></Link>)}</>:<p>Aucun résultat. Essayez un autre mot.</p>}
   </div>
  </div>
 </div>
}
