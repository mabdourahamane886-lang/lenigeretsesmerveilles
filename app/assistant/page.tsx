'use client'
import './niger-ai.css'
import Link from 'next/link'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { ArrowUp, Plus, Search, Library, FolderKanban, MessageSquare, Trash2, Compass, Landmark, Utensils, Languages, PanelLeftOpen, Copy, Check } from 'lucide-react'
type Message = { role: 'user' | 'model'; content: string }
type Chat = { id: string; title: string; messages: Message[]; updatedAt: number }
const KEY = 'niger-ia-chats-v1'
const suggestions = [
 { icon: Compass, title: 'Explorer les régions', prompt: 'Présente-moi les huit régions du Niger et leurs particularités.' },
 { icon: Landmark, title: 'Histoire et patrimoine', prompt: 'Quelles sont les grandes richesses historiques et patrimoniales du Niger ?' },
 { icon: Utensils, title: 'Gastronomie nigérienne', prompt: 'Présente-moi les plats traditionnels du Niger, notamment ceux à base de moringa.' },
 { icon: Languages, title: 'Langues et cultures', prompt: 'Quelles langues sont parlées au Niger et quelles sont leurs particularités ?' },
]
const fresh = (): Chat => ({ id: String(Date.now()) + Math.random().toString(36).slice(2), title: 'Nouvelle discussion', messages: [], updatedAt: Date.now() })
const titleOf = (s: string) => s.replace(/\s+/g, ' ').slice(0, 45) || 'Nouvelle discussion'
const cleanAnswer = (s: string) => s
 .replace(/^\s{0,3}#{1,6}\s*/gm, '')
 .replace(/\*\*(.*?)\*\*/g, '$1')
 .replace(/__(.*?)__/g, '$1')
 .replace(/^\s*[-*]\s+/gm, '• ')
 .replace(/^\s*---+\s*$/gm, '')
 .replace(/\n{3,}/g, '\n\n')
 .trim()
const thinkingSteps = [
 'Je réfléchis à votre question…',
 'Je rassemble les informations utiles…',
 'J’organise les explications pour qu’elles soient claires…',
 'Je vérifie la cohérence de la réponse…',
 'Je termine la rédaction de la réponse…',
]
const thinkingOf = (s: string) => /histoire|siècle|date|empire/i.test(s) ? 'Je rassemble les repères historiques…' : /langue|tradu|haoussa|zarma/i.test(s) ? 'Je prépare une réponse dans votre langue…' : /plat|cuisine|moringa|gastronomie/i.test(s) ? 'J’explore les traditions culinaires du Niger…' : /région|tourisme|visiter|voyage|patrimoine/i.test(s) ? 'Je parcours les informations sur le Niger…' : /pourquoi|comment|analyse|compare/i.test(s) ? 'J’analyse votre question…' : 'Je réfléchis à votre question…'

export default function AssistantPage() {
 const [chats,setChats] = useState<Chat[]>([])
 const [activeId,setActiveId] = useState('')
 const [input,setInput] = useState('')
 const [loading,setLoading] = useState(false)
 const [thinking,setThinking] = useState('Je réfléchis à votre question…')
 const [error,setError] = useState('')
 const [search,setSearch] = useState('')
 const [sidebar,setSidebar] = useState(true)
 const [panel,setPanel] = useState<'history'|'library'|'projects'>('history')
 const [library,setLibrary] = useState<string[]>([])
 const [copiedId,setCopiedId] = useState('')
 const area = useRef<HTMLTextAreaElement>(null)
 const end = useRef<HTMLDivElement>(null)
 const active = chats.find(c=>c.id===activeId)
 const messages = active?.messages || []
 useEffect(()=>{ try { const saved=JSON.parse(localStorage.getItem(KEY)||'[]') as Chat[]; const list=saved.length?saved:[fresh()]; setChats(list); setActiveId(list[0].id); setLibrary(JSON.parse(localStorage.getItem('niger-ia-library-v1')||'[]')) } catch { const c=fresh(); setChats([c]); setActiveId(c.id) } },[])
 useEffect(()=>{if(chats.length)localStorage.setItem(KEY,JSON.stringify(chats))},[chats])
 useEffect(()=>{localStorage.setItem('niger-ia-library-v1',JSON.stringify(library))},[library])
 useEffect(()=>{if(messages.length)end.current?.scrollIntoView({behavior:'smooth',block:'end'})},[messages.length,loading])
 useEffect(()=>{
  if(!loading)return
  let index=0
  const timer=window.setInterval(()=>{index=(index+1)%thinkingSteps.length;setThinking(thinkingSteps[index])},2200)
  return ()=>window.clearInterval(timer)
 },[loading])
 function newChat(){const c=fresh();setChats(v=>[c,...v]);setActiveId(c.id);setInput('');setError('');setPanel('history');if(innerWidth<760)setSidebar(false);area.current?.focus()}
 async function send(value:string){
  const q=value.trim(); if(!q||loading)return
  const old=active||fresh(); const next=[...old.messages,{role:'user' as const,content:q}]
  const updated={...old,title:old.messages.length?old.title:titleOf(q),messages:next,updatedAt:Date.now()}
  setChats(v=>[updated,...v.filter(c=>c.id!==old.id)]);setActiveId(old.id);setInput('');setError('');setLoading(true);setThinking(thinkingOf(q));if(area.current)area.current.style.height='auto'
  try{const r=await fetch('/api/assistant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:next})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Une erreur est survenue.');const done={...updated,messages:[...next,{role:'model' as const,content:cleanAnswer(d.answer || '')}],updatedAt:Date.now()};setChats(v=>[done,...v.filter(c=>c.id!==old.id)])}
  catch(e){setError(e instanceof Error?e.message:'Impossible de contacter Niger IA.')}finally{setLoading(false);setTimeout(()=>end.current?.scrollIntoView({behavior:'smooth',block:'end'}),80)}
 }
 async function copyText(text:string,id:string){try{await navigator.clipboard.writeText(text);setCopiedId(id);window.setTimeout(()=>setCopiedId(v=>v===id?'':v),1800)}catch{setError('La copie automatique est indisponible sur ce navigateur.')}}
 function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();void send(input)}
 function removeChat(id:string){const rest=chats.filter(c=>c.id!==id);if(rest.length){setChats(rest);if(id===activeId)setActiveId(rest[0].id)}else{const c=fresh();setChats([c]);setActiveId(c.id)}}
 return <main className={'nigerAiShell '+(!sidebar?'nigerAiSidebarClosed':'')}>
  <aside className="nigerAiSidebar">
   <div className="nigerAiSideBrand"><span className="nigerAiMark">N</span><strong>Niger IA</strong><button onClick={()=>setSidebar(false)} aria-label="Réduire le menu">‹</button></div>
   <button className="nigerAiNewChat" onClick={newChat}><Plus size={17}/> Nouveau chat</button>
   <label className="nigerAiSearch"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un chat"/></label>
   <nav className="nigerAiNav"><button className={panel==='history'?'active':''} onClick={()=>setPanel('history')}><MessageSquare size={17}/> Historiques</button><button className={panel==='library'?'active':''} onClick={()=>setPanel('library')}><Library size={17}/> Bibliothèque</button><button className={panel==='projects'?'active':''} onClick={()=>setPanel('projects')}><FolderKanban size={17}/> Projets Niger</button></nav>
   <div className="nigerAiSideDivider"/>
   {panel==='history'?<div className="nigerAiHistory"><small>DISCUSSIONS RÉCENTES</small>{chats.filter(c=>c.title.toLowerCase().includes(search.toLowerCase())).map(c=><div className={'nigerAiHistoryItem '+(c.id===activeId?'selected':'')} key={c.id}><button onClick={()=>{setActiveId(c.id);if(innerWidth<760)setSidebar(false)}}>{c.title}</button><button className="nigerAiDelete" aria-label="Supprimer la discussion" onClick={()=>removeChat(c.id)}><Trash2 size={14}/></button></div>)}</div>:panel==='library'?<div className="nigerAiSidePanel"><small>BIBLIOTHÈQUE</small><p>Réponses enregistrées pour les retrouver plus tard.</p>{library.map((v,i)=><button key={i} onClick={()=>setInput(v)}>{titleOf(v)}</button>)}{!library.length&&<span>Aucune réponse enregistrée.</span>}</div>:<div className="nigerAiSidePanel"><small>PROJETS THÉMATIQUES</small><button onClick={()=>{setInput('Prépare un guide complet sur les huit régions du Niger.');setPanel('history')}}>Guide des 8 régions</button><button onClick={()=>{setInput('Prépare un dossier sur les langues et traditions du Niger.');setPanel('history')}}>Langues et traditions</button><button onClick={()=>{setInput('Prépare un itinéraire touristique responsable au Niger.');setPanel('history')}}>Tourisme et patrimoine</button><p>Des points de départ centrés sur le Niger.</p></div>}
   <div className="nigerAiSideFoot">Connaissances centrées sur le Niger</div>
  </aside>
  <section className="nigerAiWorkspace">
   <header className="nigerAiHeader">{!sidebar&&<button className="nigerAiMenuToggle" onClick={()=>setSidebar(true)} aria-label="Ouvrir le menu"><PanelLeftOpen size={19}/></button>}<div><strong>Niger IA</strong><span>Assistant culturel et touristique du Niger</span></div><Link href="/" className="nigerAiBack">Retour au site</Link></header>
   <div className="nigerAiMessages" key={activeId}>
    {!messages.length?<div className="nigerAiWelcome"><span className="nigerAiWelcomeMark">N</span><p className="nigerAiEyebrow">VOTRE ASSISTANT DU NIGER</p><h1>Bonjour, que souhaitez-vous découvrir ?</h1><p className="nigerAiWelcomeText">Explorez les régions, l’histoire, les langues, les traditions, la gastronomie et le patrimoine du Niger.</p><div className="nigerAiSuggestions">{suggestions.map(({icon:Icon,title,prompt})=><button key={title} onClick={()=>void send(prompt)}><Icon size={18}/><span>{title}</span><ArrowUp size={15}/></button>)}</div></div>:<div className="nigerAiConversation" aria-live="polite">{messages.map((m,i)=><article key={i} className={'nigerAiMessage '+(m.role==='user'?'fromUser':'fromAI')}><div className="nigerAiMessageRole">{m.role==='model'?'Niger IA':''}</div><div className="nigerAiMessageText">{m.content}</div><div className="nigerAiMessageActions"><button className="nigerAiCopy" onClick={()=>void copyText(m.content,`${activeId}-${i}`)}><{copiedId===`${activeId}-${i}`?'Check':'Copy'} size={14}/>{copiedId===`${activeId}-${i}`?'Copié':'Copier'}</button>{m.role==='model'&&<button className="nigerAiSave" onClick={()=>setLibrary(v=>v.includes(m.content)?v:[...v,m.content])}><Library size={14}/> Enregistrer dans la bibliothèque</button>}</article>)}{loading&&<div className="nigerAiThinking"><span className="nigerAiDots"><i/><i/><i/></span><span>{thinking}</span></div>}<div ref={end}/></div>}
    {error&&<div className="nigerAiError" role="alert">{error}</div>}
   </div>
   <form className="nigerAiComposer" onSubmit={submit}><textarea ref={area} value={input} onChange={e=>{setInput(e.target.value);e.currentTarget.style.height='auto';e.currentTarget.style.height=Math.min(e.currentTarget.scrollHeight,220)+'px'}} placeholder="Écrivez votre message à Niger IA…" rows={1} maxLength={12000} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void send(input)}}} aria-label="Message à Niger IA"/><button type="submit" aria-label="Envoyer le message" disabled={!input.trim()||loading}><ArrowUp size={19}/></button><small>Les réponses sont générées par IA. Vérifiez les informations importantes.</small></form>
  </section>
 </main>
}
