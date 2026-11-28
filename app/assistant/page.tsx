'use client'
import './niger-ai.css'
import NigerLiveVoice from './niger-live-voice'
import Link from 'next/link'
import { NIGER_DICTIONARY, NIGER_LANGUAGES } from '../../lib/niger-dictionaries'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { ArrowUp, Plus, Search, Library, FolderKanban, MessageSquare, Trash2, Compass, Landmark, Utensils, Languages, PanelLeftOpen, Copy, Check, BookOpen, GraduationCap, MapPinned, CircleHelp, Mic, Square, X, AudioLines } from 'lucide-react'
type Message = { role: 'user' | 'model'; content: string }
type VoiceRecognition = {lang:string;onresult:((e:{results:ArrayLike<ArrayLike<{transcript:string}>>})=>void)|null;onerror:((e:{error:string})=>void)|null;onend:(()=>void)|null;start:()=>void;abort:()=>void}
const isFarewell = (q:string) => /^(?:au revoir|à bientôt|a bientot|bonne nuit|merci(?: beaucoup)?[,]? au revoir|fin de discussion|terminer la conversation)[.!\s]*$/i.test(q.trim())
type Chat = { id: string; title: string; messages: Message[]; updatedAt: number; pinned?: boolean }
const KEY = 'niger-ia-chats-v1'
const suggestions = [
 { icon: Compass, title: 'Explorer les régions', prompt: 'Présente-moi les huit régions du Niger et leurs particularités.' },
 { icon: Landmark, title: 'Histoire et patrimoine', prompt: 'Quelles sont les grandes richesses historiques et patrimoniales du Niger ?' },
 { icon: Utensils, title: 'Gastronomie nigérienne', prompt: 'Présente-moi les plats traditionnels du Niger, notamment ceux à base de moringa.' },
 { icon: Languages, title: 'Langues et cultures', prompt: 'Quelles langues sont parlées au Niger et quelles sont leurs particularités ?' },
 { icon: MapPinned, title: 'Préparer une découverte', prompt: 'Propose-moi un itinéraire culturel pour découvrir le Niger et indique les informations pratiques à vérifier avant de voyager.' },
 { icon: BookOpen, title: 'Cure Salée', prompt: 'Explique l’origine et l’importance culturelle de la Cure Salée au Niger. Distingue les faits établis des informations qui doivent être vérifiées.' },
 { icon: GraduationCap, title: 'Quiz sur le Niger', prompt: 'Prépare un quiz de 10 questions sur l’histoire, la géographie et la culture du Niger. Pose une question à la fois et explique chaque réponse.' },
 { icon: CircleHelp, title: 'Faits et sources', prompt: 'Comment vérifier la fiabilité d’une information sur l’histoire ou le patrimoine du Niger ? Donne-moi des sources fiables.' },
]
const fresh = (): Chat => ({ id: String(Date.now()) + Math.random().toString(36).slice(2), title: 'Nouvelle discussion', messages: [], updatedAt: Date.now() })
const titleOf = (s: string) => s.replace(/\s+/g, ' ').slice(0, 45) || 'Nouvelle discussion'
const chatGroup = (updatedAt: number) => {
 const now = new Date()
 const date = new Date(updatedAt)
 const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
 const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
 const daysAgo = Math.floor((today - day) / 86400000)
 if (daysAgo <= 0) return "Aujourd’hui"
 if (daysAgo === 1) return "Hier"
 if (daysAgo < 7) return "7 derniers jours"
 return "Plus anciens"
}
const cleanAnswer = (s: string) => s
 .replace(/^\s{0,3}#{1,6}\s*/gm, '')
 .replace(/\*\*(.*?)\*\*/g, '$1')
 .replace(/__(.*?)__/g, '$1')
 .replace(/^\s*[-*]\s+/gm, '• ')
 .replace(/^\s*---+\s*$/gm, '')
 .replace(/\n{3,}/g, '\n\n')
 .trim()
function renderMessageContent(text: string) {
 const urlPattern = /https?:\/\/[^\s<>()]+/g
 const parts: Array<string | { url: string; label: string }> = []
 let lastIndex = 0
 for (const match of text.matchAll(urlPattern)) {
  const raw = match[0]
  const start = match.index ?? 0
  const trailing = raw.match(/[.,!?;:，。！？；：]+$/)?.[0] ?? ''
  const candidate = trailing ? raw.slice(0, -trailing.length) : raw
  if (start > lastIndex) parts.push(text.slice(lastIndex, start))
  try {
   const parsed = new URL(candidate)
   if (parsed.protocol === 'https:' || parsed.protocol === 'http:') parts.push({ url: parsed.href, label: candidate })
   else parts.push(candidate)
  } catch { parts.push(candidate) }
  if (trailing) parts.push(trailing)
  lastIndex = start + raw.length
 }
 if (lastIndex < text.length) parts.push(text.slice(lastIndex))
 return parts.map((part, index) => typeof part === 'string'
  ? <span key={index} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>
  : <a key={index} href={part.url} target="_blank" rel="noopener noreferrer" className="nigerAiAnswerLink">{part.label}</a>)
}


export default function AssistantPage() {
 const [chats,setChats] = useState<Chat[]>([])
 const [activeId,setActiveId] = useState('')
 const [input,setInput] = useState('')
 const [greeting,setGreeting] = useState('Bienvenue sur Niger IA !')
 const [closedNotice,setClosedNotice] = useState(false)
 useEffect(()=>{const h=new Date().getHours();setGreeting(h<12?'Bonjour et bienvenue !':h<18?'Bon après-midi !':'Bonsoir et bienvenue !')},[])
 const [loading,setLoading] = useState(false)
 const [error,setError] = useState('')
 const [search,setSearch] = useState('')
 const [sidebar,setSidebar] = useState(false)
 const [panel,setPanel] = useState<'history'|'library'|'projects'|'dictionary'>('history')
 const [library,setLibrary] = useState<string[]>([])
 const [dictionarySearch,setDictionarySearch] = useState('')
 const [dictionaryLanguage,setDictionaryLanguage] = useState('all')
 const [copiedId,setCopiedId] = useState('')
 const [theme,setTheme] = useState<'light'|'dark'|'auto'>('light')
 const [editIndex,setEditIndex] = useState<number|null>(null)
 const controller = useRef<AbortController|null>(null)
 const [voiceMode,setVoiceMode] = useState(false)
 const liveChatId=useRef('')
 useEffect(()=>{if(new URLSearchParams(window.location.search).get('mode')==='voice'){liveChatId.current=fresh().id;setVoiceMode(true);setSidebar(false);setVoiceStatus('idle')}},[])
 const [voiceStatus,setVoiceStatus] = useState<'idle'|'listening'|'thinking'|'speaking'>('idle')
 const voiceEnabled = useRef(false)
 const recognition = useRef<VoiceRecognition|null>(null)
 const voiceTurn = useRef(0)
 const latestSend = useRef<(q:string)=>Promise<void>>(async()=>{})
 useEffect(()=>{return ()=>{voiceEnabled.current=false;voiceTurn.current++;recognition.current?.abort();controller.current?.abort();if('speechSynthesis' in window)window.speechSynthesis.cancel()}},[])
 useEffect(()=>{const saved=localStorage.getItem('niger-ai-theme');if(saved==='dark'||saved==='auto'||saved==='light')setTheme(saved);setSidebar(window.innerWidth>=760)},[])
 function changeTheme(value:'light'|'dark'|'auto'){setTheme(value);localStorage.setItem('niger-ai-theme',value)}
 function stopVoice(){voiceEnabled.current=false;voiceTurn.current++;recognition.current?.abort();recognition.current=null;if('speechSynthesis' in window)window.speechSynthesis.cancel();setVoiceMode(false);setVoiceStatus('idle')}
 function listenVoice(){
  if(!voiceEnabled.current)return
  const w=window as unknown as {SpeechRecognition?:new()=>VoiceRecognition;webkitSpeechRecognition?:new()=>VoiceRecognition}
  const R=w.SpeechRecognition||w.webkitSpeechRecognition
  if(!R){stopVoice();setError('La reconnaissance vocale est indisponible sur ce navigateur.');return}
  const token=++voiceTurn.current
  try{
   const mic=new R();recognition.current=mic;mic.lang='fr-FR';let heard=false
   mic.onresult=e=>{if(token!==voiceTurn.current||!voiceEnabled.current)return;const q=e.results[0][0].transcript.trim();if(!q)return;heard=true;setVoiceStatus('thinking');void latestSend.current(q)}
   mic.onerror=e=>{if(token!==voiceTurn.current)return;recognition.current=null;if(e.error==='no-speech'){setVoiceStatus('idle');return}stopVoice();setError('Microphone indisponible. Vérifiez les autorisations.')}
   mic.onend=()=>{if(token!==voiceTurn.current)return;recognition.current=null;if(!heard)setVoiceStatus('idle')}
   mic.start();setVoiceStatus('listening')
  }catch{stopVoice();setError('Impossible de démarrer le microphone.')}
 }
 function startVoice(){if(loading||voiceMode)return;liveChatId.current=activeId||fresh().id;setClosedNotice(false);setError('');setSidebar(false);setVoiceMode(true)}
 function dictate(){
  type Recognition = {lang:string;onresult:((e:{results:ArrayLike<ArrayLike<{transcript:string}>>})=>void)|null;onerror:(()=>void)|null;start:()=>void}
  const w=window as unknown as {SpeechRecognition?:new()=>Recognition;webkitSpeechRecognition?:new()=>Recognition}
  const R=w.SpeechRecognition||w.webkitSpeechRecognition
  if(!R){setError('La dictée vocale est indisponible sur ce navigateur.');return}
  try{const mic=new R();mic.lang='fr-FR';mic.onresult=e=>setInput(v=>(v+' '+e.results[0][0].transcript).trim());mic.onerror=()=>setError('Microphone indisponible. Vérifiez les autorisations.');mic.start()}catch{setError('Impossible de démarrer le microphone.')}
 }
 function renameChat(id:string,title:string){const name=window.prompt('Nom de la discussion',title)?.trim();if(name)setChats(v=>v.map(c=>c.id===id?{...c,title:name.slice(0,80)}:c))}
 function pinChat(id:string){setChats(v=>v.map(c=>c.id===id?{...c,pinned:!c.pinned}:c))}
 const attachment = useRef<HTMLInputElement>(null)
 async function importText(file: File | undefined) {
  if (!file) return
  if (file.size > 24000) { setError('Document trop volumineux. Limite : 24 Ko.'); return }
  try { const content = await file.text(); setInput(v => (v + '\nDocument : ' + file.name + '\n' + content).slice(0,12000)); area.current?.focus() } catch { setError('Impossible de lire ce document.') }
 }
 function speak(text:string,onDone?:()=>void) {
  if (!('speechSynthesis' in window)) {setError('Lecture audio indisponible.');onDone?.();return}
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text.replace(/https?:\/\/[^\s]+/g,''))
  utterance.lang='fr-FR';utterance.rate=0.98;utterance.pitch=1
  const voices=window.speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith('fr'))
  const preferred=voices.find(v=>/natural|premium|enhanced|neural/i.test(v.name))||voices.find(v=>v.lang==='fr-FR')||voices[0]
  if(preferred)utterance.voice=preferred
  utterance.onend=()=>onDone?.()
  utterance.onerror=()=>{onDone?.()}
  window.speechSynthesis.speak(utterance)
 }
 async function share(text:string) {
  try { if (navigator.share) await navigator.share({text}); else await copyText(text,'share') } catch(e) {if (!(e instanceof DOMException && e.name==='AbortError')) setError('Partage indisponible.')}
 }
 const area = useRef<HTMLTextAreaElement>(null)
 const end = useRef<HTMLDivElement>(null)
 const active = chats.find(c=>c.id===activeId)
 const messages = active?.messages || []
 useEffect(()=>{ try { const saved=JSON.parse(localStorage.getItem(KEY)||'[]') as Chat[]; const list=saved.filter(c=>c.messages.length); setChats(list); setActiveId(''); setLibrary(JSON.parse(localStorage.getItem('niger-ia-library-v1')||'[]')) } catch { setChats([]); setActiveId('') } },[])
 useEffect(()=>{if(chats.length)localStorage.setItem(KEY,JSON.stringify(chats))},[chats])
 useEffect(()=>{localStorage.setItem('niger-ia-library-v1',JSON.stringify(library))},[library])
 useEffect(()=>{if(messages.length)end.current?.scrollIntoView({behavior:'smooth',block:'end'})},[messages.length,messages.at(-1)?.content,loading])

 function newChat(){if(loading)return;stopVoice();setClosedNotice(false);setEditIndex(null);setActiveId('');setInput('');setError('');setPanel('history');if(innerWidth<760)setSidebar(false);area.current?.focus()}
 function closeChat(){if(loading)return;stopVoice();newChat();setClosedNotice(true)}
 async function send(value:string,replaceIndex:number|null=editIndex){
  const q=value.trim(); if(!q||loading||voiceMode||controller.current)return;setClosedNotice(false)
  const old=active||fresh(); const next=[...(replaceIndex===null?old.messages:old.messages.slice(0,replaceIndex)),{role:'user' as const,content:q}];setEditIndex(null)
  const updated={...old,title:old.messages.length?old.title:titleOf(q),messages:next,updatedAt:Date.now()}
  setChats(v=>[updated,...v.filter(c=>c.id!==old.id)]);setActiveId(old.id);setInput('');setError('');setLoading(true);if(area.current)area.current.style.height='auto'
  const abort=new AbortController();controller.current=abort;
  try{const r=await fetch('/api/assistant',{method:'POST',headers:{'Content-Type':'application/json'},signal:abort.signal,body:JSON.stringify({messages:next.slice(-12)})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Une erreur est survenue.');const done={...updated,messages:[...next,{role:'model' as const,content:cleanAnswer(d.answer || '')}],updatedAt:Date.now()};setChats(v=>[done,...v.filter(c=>c.id!==old.id)]);const farewell=isFarewell(q);if(voiceEnabled.current){const token=++voiceTurn.current;recognition.current?.abort();recognition.current=null;setVoiceStatus('speaking');speak(done.messages[done.messages.length-1].content,()=>{if(token!==voiceTurn.current||!voiceEnabled.current)return;if(farewell){stopVoice();setActiveId('');setClosedNotice(true)}else listenVoice()})}else if(farewell){setActiveId('');setClosedNotice(true)}}
  catch(e){if(!abort.signal.aborted)setError(e instanceof Error?e.message:'Impossible de contacter Niger IA.');if(voiceEnabled.current)setVoiceStatus('idle')}finally{controller.current=null;setLoading(false);setTimeout(()=>end.current?.scrollIntoView({behavior:'smooth',block:'end'}),80)}
 }
 useEffect(()=>{latestSend.current=(q:string)=>send(q,null)})
 async function copyText(text:string,id:string){try{await navigator.clipboard.writeText(text);setCopiedId(id);window.setTimeout(()=>setCopiedId(v=>v===id?'':v),1800)}catch{setError('La copie automatique est indisponible sur ce navigateur.')}}
 function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();void send(input)}
 function removeChat(id:string){if(loading)return;const rest=chats.filter(c=>c.id!==id);setChats(rest);localStorage.setItem(KEY,JSON.stringify(rest));if(id===activeId)newChat()}
 return <main className={'nigerAiShell '+(!sidebar?'nigerAiSidebarClosed':'')+' nigerAiTheme-'+theme}>
  <aside className="nigerAiSidebar">
   <div className="nigerAiSideBrand"><span className="nigerAiMark">N</span><strong>Niger IA</strong><button onClick={()=>setSidebar(false)} aria-label="Réduire le menu">‹</button></div>
   <button className="nigerAiNewChat" onClick={newChat}><Plus size={17}/> Nouveau chat</button>
   <label className="nigerAiSearch"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un chat"/></label>
   <nav className="nigerAiNav"><button className={panel==='history'?'active':''} onClick={()=>setPanel('history')}><MessageSquare size={17}/> Historiques</button><button className={panel==='library'?'active':''} onClick={()=>setPanel('library')}><Library size={17}/> Bibliothèque</button><button className={panel==='projects'?'active':''} onClick={()=>setPanel('projects')}><FolderKanban size={17}/> Projets Niger</button><button className={panel==='dictionary'?'active':''} onClick={()=>setPanel('dictionary')}><Languages size={17}/> Dictionnaire</button></nav>
   <div className="nigerAiSideDivider"/>
   {panel==='history'?<div className="nigerAiHistory"><small>DISCUSSIONS RÉCENTES</small>{(["Aujourd’hui","Hier","7 derniers jours","Plus anciens"] as const).map(group=>{const items=chats.filter(c=>c.title.toLowerCase().includes(search.toLowerCase())&&chatGroup(c.updatedAt)===group).sort((a,b)=>Number(Boolean(b.pinned))-Number(Boolean(a.pinned))||b.updatedAt-a.updatedAt);return items.length?<section className="nigerAiHistoryGroup" key={group}><small>{group.toUpperCase()}</small>{items.map(c=><div className={'nigerAiHistoryItem '+(c.id===activeId?'selected':'')} key={c.id}><button title={c.title} onClick={()=>{if(loading)return;stopVoice();setClosedNotice(false);setEditIndex(null);setInput('');setActiveId(c.id);setPanel('history');if(innerWidth<760)setSidebar(false)}}>{c.pinned?'★ ':''}{c.title}</button><button className="nigerAiDelete" onClick={()=>pinChat(c.id)} aria-label="Épingler ou désépingler">★</button><button className="nigerAiDelete" onClick={()=>renameChat(c.id,c.title)} aria-label="Renommer">✎</button><button className="nigerAiDelete" aria-label={'Supprimer la discussion '+c.title} onClick={()=>removeChat(c.id)}><Trash2 size={14}/></button></div>)}</section>:null})}</div>:panel==='library'?<div className="nigerAiSidePanel"><small>BIBLIOTHÈQUE</small><p>Réponses enregistrées pour les retrouver plus tard.</p>{library.map((v,i)=><button key={i} onClick={()=>setInput(v)}>{titleOf(v)}</button>)}{!library.length&&<span>Aucune réponse enregistrée.</span>}</div>:panel==='projects'?<div className="nigerAiSidePanel"><small>PROJETS THÉMATIQUES</small><button onClick={()=>{setInput('Prépare un guide complet sur les huit régions du Niger.');setPanel('history')}}>Guide des 8 régions</button><button onClick={()=>{setInput('Prépare un dossier sur les langues et traditions du Niger.');setPanel('history')}}>Langues et traditions</button><button onClick={()=>{setInput('Prépare un itinéraire touristique responsable au Niger.');setPanel('history')}}>Tourisme et patrimoine</button><p>Des points de départ centrés sur le Niger.</p></div>:<div className="nigerAiSidePanel nigerAiDictionaryPanel"><small>DICTIONNAIRE INTÉGRÉ</small><p>Recherchez un mot, choisissez une langue, puis demandez à Niger IA de l’expliquer dans la conversation.</p><input className="nigerAiDictionarySearch" value={dictionarySearch} onChange={e=>setDictionarySearch(e.target.value)} placeholder="Mot ou traduction…" aria-label="Rechercher dans le dictionnaire"/><select className="nigerAiDictionarySelect" value={dictionaryLanguage} onChange={e=>setDictionaryLanguage(e.target.value)} aria-label="Filtrer par langue"><option value="all">Toutes les langues</option>{NIGER_LANGUAGES.map(lang=><option key={lang.id} value={lang.code}>{lang.name}</option>)}</select><div className="nigerAiDictionaryResults">{NIGER_DICTIONARY.filter(entry=>(dictionaryLanguage==='all'||entry.languageCode===dictionaryLanguage)&&(!dictionarySearch.trim()||[entry.word,entry.french,entry.language,entry.category].join(' ').toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(dictionarySearch.trim().toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'')))).slice(0,30).map(entry=><article key={entry.id}><strong>{entry.word}</strong><span>{entry.french}</span><small>{entry.language}</small><button onClick={()=>{setInput('Explique le mot « '+entry.word+' » en '+entry.language+' : donne sa prononciation si elle est connue, sa traduction française, un exemple simple et les limites de certitude.');setPanel('history');area.current?.focus()}}>Utiliser dans le chat</button></article>)}{!NIGER_DICTIONARY.some(entry=>(dictionaryLanguage==='all'||entry.languageCode===dictionaryLanguage)&&(!dictionarySearch.trim()||[entry.word,entry.french,entry.language,entry.category].join(' ').toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(dictionarySearch.trim().toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,''))))&&<span>Aucun mot trouvé. Essayez une autre recherche.</span>}</div><Link href="/dictionnaire" className="nigerAiDictionaryFull">Ouvrir le dictionnaire complet ↗</Link></div>}
   <div className="nigerAiSideFoot"><label>Apparence <select value={theme} onChange={e=>changeTheme(e.target.value as 'light'|'dark'|'auto')}><option value="light">Clair</option><option value="dark">Sombre</option><option value="auto">Automatique</option></select></label><p>Historique conservé sur cet appareil</p></div>
  </aside>
  <section className="nigerAiWorkspace">
   <header className="nigerAiHeader">{!sidebar&&<button className="nigerAiMenuToggle" onClick={()=>setSidebar(true)} aria-label="Ouvrir le menu"><PanelLeftOpen size={19}/></button>}<div><strong>Niger IA</strong><span>Assistant culturel et touristique du Niger</span></div></header>
   <div className="nigerAiMessages" key={activeId}>
    {!messages.length?<div className="nigerAiWelcome"><p className="nigerAiEyebrow">VOTRE ASSISTANT DU NIGER</p><h1>{greeting}</h1><p className="nigerAiWelcomeText">Ravi de vous accueillir sur Niger IA. Que souhaitez-vous découvrir aujourd’hui ? Explorez les régions, l’histoire, les langues et le patrimoine du Niger.</p>{closedNotice&&<p className="nigerAiWelcomeText" role="status">Merci pour votre visite ! Votre discussion est enregistrée dans l’historique. Au plaisir de vous retrouver.</p>}<div className="nigerAiSuggestions">{suggestions.map(({icon:Icon,title,prompt})=><button key={title} onClick={()=>void send(prompt)}><Icon size={18}/><span>{title}</span><ArrowUp size={15}/></button>)}</div></div>:<div className="nigerAiConversation" aria-live="polite">{messages.map((m,i)=><article key={i} className={'nigerAiMessage '+(m.role==='user'?'fromUser':'fromAI')}><div className="nigerAiMessageRole">{m.role==='model'?'Niger IA':''}</div><div className="nigerAiMessageText">{renderMessageContent(m.content)}</div><div className="nigerAiMessageActions"><button className="nigerAiCopy" onClick={()=>void copyText(m.content,`${activeId}-${i}`)}>{copiedId===`${activeId}-${i}`?<Check size={14}/>:<Copy size={14}/>}{copiedId===`${activeId}-${i}`?'Copié':'Copier'}</button>{m.role==='user'&&<button className="nigerAiCopy" disabled={loading} onClick={()=>{setEditIndex(i);setInput(m.content);area.current?.focus()}}>Modifier</button>}{m.role==='model'&&i===messages.length-1&&messages[i-1]?.role==='user'&&<button className="nigerAiCopy" disabled={loading} onClick={()=>void send(messages[i-1].content,i-1)}>Régénérer</button>}{m.role==='model'&&<><button className="nigerAiCopy" onClick={()=>speak(m.content)}>Écouter</button><button className="nigerAiCopy" onClick={()=>void share(m.content)}>Partager</button></>}{m.role==='model'&&<button className="nigerAiSave" onClick={()=>setLibrary(v=>v.includes(m.content)?v:[...v,m.content])}><Library size={14}/> Enregistrer dans la bibliothèque</button>}</div></article>)}{loading&&<div className="nigerAiThinking" role="status" aria-live="polite"><span className="nigerAiSpinner" aria-hidden="true"/><span className="nigerAiThinkingText"><span className="nigerAiThinkingLabel">Réflexion en cours…</span><span className="nigerAiThinkingDetail">Niger IA prépare votre réponse.</span></span></div>}{!loading&&<button type="button" className="nigerAiCopy nigerAiEndChat" onClick={closeChat}>Terminer la discussion</button>}<div ref={end}/></div>}
    {error&&<div className="nigerAiError" role="alert">{error}</div>}
   </div>
   {voiceMode&&<NigerLiveVoice onClose={()=>{stopVoice();setActiveId('');setClosedNotice(true)}} onTranscript={(role,text)=>{const id=liveChatId.current;if(!id||!text.trim())return;setActiveId(id);setChats(v=>{const current=v.find(c=>c.id===id);const base=current||{...fresh(),id};const last=base.messages.at(-1);const messages:Message[]=last?.role===role?[...base.messages.slice(0,-1),{role,content:(last.content+' '+text).trim()}]:[...base.messages,{role,content:text}];const updated={...base,title:base.messages.length?base.title:titleOf(text),messages,updatedAt:Date.now()};return [updated,...v.filter(c=>c.id!==id)]})}}/>}
   <form className="nigerAiComposer" onSubmit={submit}><input ref={attachment} type="file" accept=".txt,.md,.csv,.json" hidden onChange={e=>{void importText(e.currentTarget.files?.[0]);e.currentTarget.value=''}}/><button className="nigerAiAttach" type="button" aria-label="Importer un document texte" onClick={()=>attachment.current?.click()}><Plus size={19}/></button>{editIndex!==null&&<button type="button" className="nigerAiEditCancel" onClick={()=>{setEditIndex(null);setInput('')}}>Annuler la modification</button>}<textarea ref={area} value={input} onChange={e=>{setInput(e.target.value);e.currentTarget.style.height='auto';e.currentTarget.style.height=Math.min(e.currentTarget.scrollHeight,220)+'px'}} placeholder="Écrivez à Niger IA…" rows={1} maxLength={12000} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void send(input)}}} aria-label="Message à Niger IA"/><button type="button" className="nigerAiAttach" aria-label="Dicter un message" disabled={voiceMode} onClick={dictate}><Mic size={19}/></button><button type="button" className="nigerAiAttach nigerAiVoiceButton" aria-label="Démarrer le mode voix Live" onClick={startVoice} disabled={loading||voiceMode}><AudioLines size={19}/></button>{loading?<button type="button" aria-label="Arrêter la génération" onClick={()=>controller.current?.abort()}><Square size={16}/></button>:<button type="submit" aria-label="Envoyer le message" disabled={!input.trim()||voiceMode}><ArrowUp size={19}/></button>}<small>Les réponses sont générées par IA. Vérifiez les informations importantes.</small></form>
  </section>
 </main>
}
