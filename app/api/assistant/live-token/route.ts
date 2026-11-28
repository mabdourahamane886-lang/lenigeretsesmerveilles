import { NextResponse } from 'next/server'
import { NIGER_KNOWLEDGE } from '../../../../lib/niger-knowledge'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  if (origin && new URL(origin).host !== request.headers.get('host')) return NextResponse.json({error:'Origine refusée'}, {status:403})
  const key = process.env.GEMINI_LIVE_API_KEY
  if (!key) return NextResponse.json({error:'GEMINI_LIVE_API_KEY absente de cet environnement de déploiement'}, {status:503})
  const configured = (process.env.GEMINI_LIVE_MODEL || '').trim().replace(/^models\//, '')
  const model = !configured || configured === 'gemini-live-2.5-flash-native-audio' ? 'gemini-2.5-flash-native-audio-preview-12-2025' : configured
  const knowledge = NIGER_KNOWLEDGE.map(e=>e.title+' : '+e.content+' (Source : '+e.sourceLabel+')').join('\n').slice(0,16000)
  const searchEnabled = process.env.GEMINI_LIVE_ENABLE_SEARCH === 'true'
  const setup = {...(searchEnabled ? {tools:[{googleSearch:{}}]} : {}),model:'models/'+model,generationConfig:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:'Charon'}}}},inputAudioTranscription:{},outputAudioTranscription:{},systemInstruction:{parts:[{text:'Tu es Niger IA, assistant généraliste spécialisé dans tout le Niger : huit régions, histoire, géographie, peuples, langues, économie, culture et patrimoine. Réponds aussi aux questions générales. Vérifie les faits avec le contexte ci-dessous, distingue traditions et faits établis, ne devine pas les chiffres ou les traductions, demande une précision en cas de transcription ambiguë. Ne donne de liens que sur demande explicite. Comprends les accents, hésitations, répétitions et noms propres nigériens. Reformule mentalement la question sans modifier son sens, ne répète pas systématiquement la question et ne corrige pas arbitrairement les noms ou les langues. En cas de doute, demande une confirmation courte avant de répondre. Si la recherche Google est disponible, consulte-la pour vérifier les informations récentes ou incertaines sur le Niger, en privilégiant les sites institutionnels nigériens (gouv.ne, stat-niger.org), les médias nigériens reconnus, les universités, l’UNESCO et les publications scientifiques. Compare les sources, distingue Niger et Nigeria, indique les dates des chiffres, ne prétends pas avoir consulté un site sans recherche effective. Si la recherche est indisponible, utilise les documents locaux et signale les limites. Réponds naturellement, dans la langue de la personne. Contexte documentaire local (non exhaustif) :\n'+knowledge}]}}
  const result = await fetch('https://generativelanguage.googleapis.com/v1beta/auth_tokens', {
    method:'POST', headers:{'Content-Type':'application/json','x-goog-api-key':key},
    body:JSON.stringify({uses:1,expireTime:new Date(Date.now()+15*60_000).toISOString(),
      newSessionExpireTime:new Date(Date.now()+60_000).toISOString(),
      bidiGenerateContentSetup:setup}),
    cache:'no-store',signal:AbortSignal.timeout(12000)
  }).catch(()=>null)
  if (!result) return NextResponse.json({error:'Service Gemini Live inaccessible'}, {status:502})
  if (!result.ok) {
    console.error('Gemini Live token:',result.status,(await result.text()).slice(0,500))
    return NextResponse.json({error:'Gemini Live a refusé la session (HTTP '+result.status+'). Vérifiez le modèle et la clé.'},{status:502})
  }
  const data = await result.json() as {name?:string}
  if (!data.name) return NextResponse.json({error:'Jeton de session non reçu'},{status:502})
  return NextResponse.json({token:data.name,model,setup},{headers:{'Cache-Control':'no-store'}})
}
