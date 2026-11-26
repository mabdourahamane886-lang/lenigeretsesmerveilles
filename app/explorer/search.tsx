'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Search } from 'lucide-react'
export default function ExplorerSearch({q,region,type}:{q:string;region:string;type:string}){
 const [value,setValue]=useState(q)
 const [pending,startTransition]=useTransition()
 const router=useRouter()
 return <form action="/explorer" method="get" onSubmit={event=>{event.preventDefault();startTransition(()=>router.push('/explorer?'+new URLSearchParams({q:value.trim().slice(0,80),region,type}).toString()))}} style={{display:'flex',alignItems:'center',gap:10,border:'1px solid #d9ddd8',borderRadius:14,padding:'6px 10px',background:'#f6f8f7'}}>
 <Search size={19}/><input name="q" value={value} onChange={event=>setValue(event.target.value)} maxLength={80} placeholder="Rechercher au Niger…" aria-label="Rechercher" style={{flex:1,minWidth:0,width:0,border:0,background:'transparent',padding:'12px 0',fontSize:16}}/>
 <input type="hidden" name="region" value={region}/><input type="hidden" name="type" value={type}/>
 <button type="submit" disabled={pending} aria-label="Lancer la recherche" style={{display:'grid',placeItems:'center',flexShrink:0,width:44,height:44,border:0,borderRadius:10,background:'#0b4935',color:'#fff'}}><ArrowRight size={20}/></button>
 {pending&&<small role="status">Recherche…</small>}</form>
}
