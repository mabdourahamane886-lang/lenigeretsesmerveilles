'use client'

import Link from 'next/link'
import { FormEvent, useRef, useState } from 'react'
import { ArrowLeft, ArrowUp, Compass, Landmark, Languages, Sparkles, Utensils, LoaderCircle, Bot, UserRound } from 'lucide-react'

type Message = { role: 'user' | 'model'; content: string }

const suggestions = [
  { icon: Compass, title: 'Explorer les régions', prompt: 'Présente-moi les huit régions du Niger et leurs particularités.' },
  { icon: Landmark, title: 'Histoire et patrimoine', prompt: 'Quelles sont les grandes richesses historiques et patrimoniales du Niger ?' },
  { icon: Utensils, title: 'Gastronomie nigérienne', prompt: 'Présente-moi quelques plats traditionnels du Niger, notamment les plats à base de feuilles de moringa.' },
  { icon: Languages, title: 'Langues et cultures', prompt: 'Quelles langues sont parlées au Niger et quelles sont quelques particularités culturelles ?' },
]

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  async function sendMessage(value: string) {
    const question = value.trim()
    if (!question || loading) return
    const next: Message[] = [...messages, { role: 'user', content: question }]
    setMessages(next)
    setInput('')
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Une erreur est survenue.')
      setMessages([...next, { role: 'model', content: data.answer }])
      window.setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 50)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de contacter l’assistant.')
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void sendMessage(input)
  }

  return (
    <main className="assistantPage">
      <header className="assistantTopbar">
        <Link href="/" className="assistantBack"><ArrowLeft size={18} /> <span>Retour au site</span></Link>
        <div className="assistantBrand">
          <span className="assistantBrandIcon"><Sparkles size={22} /></span>
          <span><strong>Merveilles IA</strong><small>Le Niger et ses Merveilles</small></span>
        </div>
        <span className="assistantStatus"><i /> Assistant culturel</span>
      </header>

      <section className="assistantMain">
        {messages.length === 0 ? (
          <div className="assistantWelcome">
            <div className="assistantHeroIcon"><Sparkles size={30} /></div>
            <span className="assistantEyebrow">VOTRE GUIDE INTELLIGENT DU NIGER</span>
            <h1>Le Niger, <em>raconté</em><br />autrement.</h1>
            <p>Posez vos questions sur les régions, les cultures, l’histoire, les merveilles et la gastronomie du Niger. Je suis là pour vous guider.</p>
            <div className="assistantSuggestions">
              {suggestions.map(({ icon: Icon, title, prompt }) => (
                <button type="button" className="assistantSuggestion" key={title} onClick={() => void sendMessage(prompt)}>
                  <Icon size={20} />
                  <span>{title}</span>
                  <ArrowUp size={15} className="assistantSuggestionArrow" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="assistantConversation" aria-live="polite">
            {messages.map((message, index) => (
              <article className={`assistantMessage ${message.role === 'user' ? 'assistantMessageUser' : 'assistantMessageModel'}`} key={index}>
                <span className="assistantMessageAvatar">{message.role === 'user' ? <UserRound size={17} /> : <Sparkles size={17} />}</span>
                <div className="assistantMessageContent">
                  <strong>{message.role === 'user' ? 'Vous' : 'Merveilles IA'}</strong>
                  <p>{message.content}</p>
                </div>
              </article>
            ))}
            {loading && <div className="assistantLoading"><LoaderCircle size={18} className="assistantSpinner" /> Merveilles IA prépare une réponse…</div>}
            <div ref={endRef} />
          </div>
        )}
        {error && <div className="assistantError" role="alert">{error}</div>}
        <form className="assistantComposer" onSubmit={handleSubmit}>
          <textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Posez une question sur le Niger…" rows={1} maxLength={3000} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void sendMessage(input) } }} aria-label="Votre question" />
          <button type="submit" aria-label="Envoyer la question" disabled={!input.trim() || loading}><ArrowUp size={20} /></button>
          <small>Les réponses peuvent contenir des erreurs. Vérifiez les informations importantes.</small>
        </form>
      </section>
      <footer className="assistantFooter"><Bot size={15} /> Merveilles IA · Au service de la mémoire et de la découverte du Niger</footer>
    </main>
  )
}
