'use client'
import Link from 'next/link'
import { FormEvent, useCallback, useEffect, useState } from 'react'

type Memory = { id: string; memory_key: string; content: string; expires_at: string | null }

export default function NigerAIMemoryPage() {
 const [items,setItems]=useState<Memory[]>([])
 const [key,setKey]=useState('')
 const [value,setValue]=useState('')
 const [days,setDays]=useState('90')
 const [consent,setConsent]=useState(false)
 const [loading,setLoading]=useState(true)
 const [busy,setBusy]=useState(false)
 const [error,setError]=useState('')
 const [notice,setNotice]=useState('')
 const load=useCallback(async()=>{setLoading(true);setError('');try{const r=await fetch('/api/assistant/memory',{cache:'no-store'});const d=await r.json();if(!r.ok)throw new Error(d.error||'Chargement impossible');setItems(Array.isArray(d.memories)?d.memories:[])}catch(e){setError(e instanceof Error?e.message:'Erreur de connexion')}finally{setLoading(false)}},[])
 useEffect(()=>{void load()},[load])
 async function save(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError('');setNotice('');try{const r=await fetch('/api/assistant/memory',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({memory_key:key,content:value,expires_in_days:Number(days),consent})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Enregistrement impossible');setKey('');setValue('');setConsent(false);setNotice('Mémoire enregistrée.');await load()}catch(e){setError(e instanceof Error?e.message:'Erreur de connexion')}finally{setBusy(false)}}
 async function remove(memory_key?:string){if(!window.confirm(memory_key?'Supprimer cette mémoire ?':'Supprimer toutes vos mémoires ?'))return;try{const r=await fetch('/api/assistant/memory',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify(memory_key?{memory_key}:{})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Suppression impossible');setNotice('Suppression effectuée.');await load()}catch(e){setError(e instanceof Error?e.message:'Erreur de connexion')}}
 const field={display:'grid',gap:6,marginBottom:14} as const
 const input={width:'100%',boxSizing:'border-box' as const,border:'1px solid #cbd5e1',borderRadius:10,padding:11,font:'inherit',background:'#fff',color:'#152238'}
 const btn={border:0,borderRadius:9,padding:'11px 14px',background:'#174a86',color:'#fff',fontWeight:700,cursor:'pointer'}
 return <main style={{minHeight:'100vh',background:'#f5f7fb',color:'#152238',padding:'24px 16px 50px'}}><div style={{maxWidth:800,margin:'auto'}}>
 <Link href="/assistant" style={{display:'inline-block',marginBottom:20,color:'#174a86'}}>← Retour à Niger IA</Link>
 <header style={{background:'#102b4e',color:'#fff',borderRadius:16,padding:22,marginBottom:18}}><h1 style={{margin:'0 0 8px',fontSize:25}}>Mémoire de Niger IA</h1><p style={{margin:0,lineHeight:1.5}}>Enregistrez uniquement les informations que vous choisissez de conserver. Vous pouvez consulter et supprimer vos mémoires à tout moment.</p></header>
 <section style={{background:'#fff',border:'1px solid #dce3ec',borderRadius:14,padding:20,marginBottom:18}}><h2 style={{margin:'0 0 16px',fontSize:19}}>Ajouter une mémoire</h2>
 <form onSubmit={save}><label style={field}>Titre ou clé<input required maxLength={100} value={key} onChange={e=>setKey(e.target.value)} placeholder="Ex. : langue préférée" style={input}/></label>
 <label style={field}>Information à retenir<textarea required maxLength={2000} rows={4} value={value} onChange={e=>setValue(e.target.value)} placeholder="Information à enregistrer" style={{...input,resize:'vertical'}}/></label>
 <label style={field}>Durée de conservation<select value={days} onChange={e=>setDays(e.target.value)} style={input}><option value="30">30 jours</option><option value="90">90 jours</option><option value="180">180 jours</option><option value="365">365 jours</option></select></label>
 <label style={{display:'flex',gap:10,lineHeight:1.5,marginBottom:14}}><input type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)}/>Je consens explicitement à enregistrer cette information dans la mémoire privée de mon compte.</label>
 <button disabled={busy||!consent} style={btn}>{busy?'Enregistrement…':'Enregistrer la mémoire'}</button></form></section>
 <section style={{background:'#fff',border:'1px solid #dce3ec',borderRadius:14,padding:20}}><div style={{display:'flex',gap:10,alignItems:'center',justifyContent:'space-between',flexWrap:'wrap'}}><h2 style={{margin:0,fontSize:19}}>Mes mémoires</h2><div><button onClick={()=>void load()} style={{...btn,marginRight:8}}>Actualiser</button>{items.length>0&&<button onClick={()=>void remove()} style={{...btn,background:'#991b1b'}}>Tout supprimer</button>}</div></div>
 {loading?<p>Chargement…</p>:items.length===0?<p style={{color:'#5b6778'}}>Aucune mémoire trouvée. Connectez-vous à votre compte pour utiliser cette fonction.</p>:<div style={{display:'grid',gap:12,marginTop:16}}>{items.map(m=><article key={m.id} style={{border:'1px solid #e0e6ef',borderRadius:10,padding:14}}><div style={{display:'flex',justifyContent:'space-between',gap:12}}><div style={{minWidth:0}}><h3 style={{margin:'0 0 8px',overflowWrap:'anywhere'}}>{m.memory_key}</h3><p style={{margin:0,whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{m.content}</p><small style={{display:'block',marginTop:9,color:'#5b6778'}}>Expiration : {m.expires_at?new Date(m.expires_at).toLocaleDateString('fr-FR'):'non définie'}</small></div><button aria-label={'Supprimer '+m.memory_key} onClick={()=>void remove(m.memory_key)} style={{...btn,background:'#991b1b',alignSelf:'start'}}>Supprimer</button></div></article>)}</div>}</section>
 {error&&<p role="alert" style={{background:'#fff0f0',color:'#991b1b',padding:12,borderRadius:9}}>{error}</p>}{notice&&<p role="status" style={{background:'#edf9f0',color:'#176534',padding:12,borderRadius:9}}>{notice}</p>}
 </div></main>
}
