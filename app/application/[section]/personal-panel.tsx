'use client'
import { useEffect,useState } from 'react'
import type { FormEvent } from 'react'

const key='niger-app-personal-v1'
export default function PersonalPanel({mode}:{mode:'profil'|'parametres'}){
  const [name,setName]=useState('')
  const [bio,setBio]=useState('')
  const [large,setLarge]=useState(false)
  const [status,setStatus]=useState('')
  const [ready,setReady]=useState(false)
  useEffect(()=>{try{const value=JSON.parse(localStorage.getItem(key)||'{}');setName(typeof value.name==='string'?value.name:'');setBio(typeof value.bio==='string'?value.bio:'');setLarge(value.large===true)}catch{setStatus('Stockage local indisponible.')}finally{setReady(true)}},[])
  function save(e:FormEvent){e.preventDefault();try{localStorage.setItem(key,JSON.stringify({name:name.trim(),bio:bio.trim(),large}));setStatus('Enregistré sur cet appareil.')}catch{setStatus('Impossible d’enregistrer sur cet appareil.')}}
  return <form onSubmit={save} style={{display:'grid',gap:12,maxWidth:560,marginBlock:24,fontSize:large?'1.2rem':undefined}}>
    {mode==='profil'?<><label>Nom affiché<input value={name} onChange={e=>setName(e.target.value)} maxLength={80} style={{display:'block',width:'100%',padding:12,border:'1px solid #aabbb0',borderRadius:10}}/></label><label>Biographie<textarea value={bio} onChange={e=>setBio(e.target.value)} maxLength={500} rows={4} style={{display:'block',width:'100%',padding:12,border:'1px solid #aabbb0',borderRadius:10}}/></label></>:<label><input type="checkbox" checked={large} onChange={e=>setLarge(e.target.checked)}/> Agrandir le texte de ce panneau</label>}
    <p>Ces informations ne sont pas synchronisées et ne constituent pas un compte en ligne.</p>
    <button disabled={!ready} type="submit" style={{padding:12,background:'#154e38',color:'white',borderRadius:10}}>Enregistrer</button><p role="status">{status}</p>
  </form>
}
