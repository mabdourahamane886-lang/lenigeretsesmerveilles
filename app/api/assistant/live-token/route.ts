import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  if (origin && new URL(origin).host !== request.headers.get('host')) return NextResponse.json({error:'Origine refusée'}, {status:403})
  const key = process.env.GEMINI_LIVE_API_KEY
  if (!key) return NextResponse.json({error:'GEMINI_LIVE_API_KEY absente de cet environnement de déploiement'}, {status:503})
  const configured = (process.env.GEMINI_LIVE_MODEL || '').trim().replace(/^models\//, '')
  const model = !configured || configured === 'gemini-live-2.5-flash-native-audio' ? 'gemini-2.5-flash-native-audio-preview-12-2025' : configured
  const result = await fetch('https://generativelanguage.googleapis.com/v1beta/auth_tokens', {
    method:'POST', headers:{'Content-Type':'application/json','x-goog-api-key':key},
    body:JSON.stringify({uses:1,expireTime:new Date(Date.now()+15*60_000).toISOString(),
      newSessionExpireTime:new Date(Date.now()+60_000).toISOString(),
      bidiGenerateContentSetup:{model:'models/'+model,generationConfig:{responseModalities:['AUDIO']},inputAudioTranscription:{},outputAudioTranscription:{},systemInstruction:{parts:[{text:'Tu es Niger IA. Réponds naturellement en français ou dans la langue de l’utilisateur, avec une expertise sur le Niger. Ne donne aucun lien sauf demande explicite. Ne fabrique pas de sources.'}]}}}),
    cache:'no-store',signal:AbortSignal.timeout(12000)
  }).catch(()=>null)
  if (!result) return NextResponse.json({error:'Service Gemini Live inaccessible'}, {status:502})
  if (!result.ok) {
    console.error('Gemini Live token:',result.status,(await result.text()).slice(0,500))
    return NextResponse.json({error:'Gemini Live a refusé la session (HTTP '+result.status+'). Vérifiez le modèle et la clé.'},{status:502})
  }
  const data = await result.json() as {name?:string}
  if (!data.name) return NextResponse.json({error:'Jeton de session non reçu'},{status:502})
  return NextResponse.json({token:data.name,model},{headers:{'Cache-Control':'no-store'}})
}
