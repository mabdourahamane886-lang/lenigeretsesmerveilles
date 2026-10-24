import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type ChatMessage = { role: 'user' | 'model'; content: string }

const SYSTEM_INSTRUCTION = `Tu es Merveilles IA, l'assistant officiel du site « Le Niger et ses Merveilles ».
Tu aides les visiteurs à découvrir les huit régions du Niger, son histoire, ses patrimoines, ses langues, ses cultures, sa gastronomie et ses destinations touristiques.
Réponds en français par défaut, avec un ton chaleureux, clair et précis. Réponds dans la langue de l'utilisateur si tu la reconnais.
Ne présente jamais une information incertaine comme un fait établi. Si tu ne sais pas, dis-le clairement et recommande de vérifier auprès d'une source fiable. Ne fabrique ni horaires, ni prix, ni liens, ni événements.
Reste respectueux de toutes les communautés et traditions du Niger. `

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'L’assistant IA n’est pas encore configuré. Ajoutez GEMINI_API_KEY dans les variables d’environnement du projet.' },
        { status: 503 },
      )
    }

    const body = await request.json().catch(() => null)
    const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : []
    const validMessages = messages
      .filter((item): item is ChatMessage => item && (item.role === 'user' || item.role === 'model') && typeof item.content === 'string')
      .slice(-12)
      .map((item) => ({ role: item.role, parts: [{ text: item.content.slice(0, 6000) }] }))

    if (!validMessages.length || validMessages[validMessages.length - 1].role !== 'user') {
      return NextResponse.json({ error: 'Envoyez une question pour commencer.' }, { status: 400 })
    }

    const model = (process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim()
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: validMessages,
        generationConfig: { temperature: 0.65, maxOutputTokens: 1200 },
      }),
      signal: AbortSignal.timeout(25000),
      cache: 'no-store',
    })

    const data = await upstream.json().catch(() => ({}))
    if (!upstream.ok) {
      console.error('Gemini API error:', upstream.status, data?.error?.message || 'Unknown error')
      if (upstream.status === 400 || upstream.status === 404) {
        return NextResponse.json({ error: 'Le modèle Gemini configuré est indisponible ou la requête est invalide. Vérifiez GEMINI_MODEL et la configuration de Gemini API.' }, { status: 502 })
      }
      if (upstream.status === 401 || upstream.status === 403) {
        return NextResponse.json({ error: 'La clé Gemini est refusée. Vérifiez GEMINI_API_KEY et les autorisations de l’API.' }, { status: 502 })
      }
      if (upstream.status === 429) {
        return NextResponse.json({ error: 'La limite de requêtes Gemini est atteinte. Réessayez dans un instant.' }, { status: 429 })
      }
      return NextResponse.json({ error: 'Gemini ne peut pas répondre pour le moment. Réessayez plus tard.' }, { status: 502 })
    }

    const answer = data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || '')
      .join('')
      .trim()

    if (!answer) {
      return NextResponse.json({ error: 'Aucune réponse n’a été générée. Reformulez votre question.' }, { status: 502 })
    }

    return NextResponse.json({ answer, model }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Assistant route error:', error)
    return NextResponse.json({ error: 'Impossible de joindre l’assistant. Vérifiez votre connexion et réessayez.' }, { status: 500 })
  }
}
