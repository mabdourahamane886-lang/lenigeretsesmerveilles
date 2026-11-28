'use client'
import { useEffect, useRef, useState } from 'react'
import { Mic, MicOff, X } from 'lucide-react'
type Props={onClose:()=>void;onTranscript:(role:'user'|'model',text:string)=>void}
function base64(bytes:Uint8Array){let s='';for(let i=0;i<bytes.length;i++)s+=String.fromCharCode(bytes[i]);return btoa(s)}
function pcm16(data:Float32Array,rate:number){const ratio=rate/16000;const out=new Int16Array(Math.floor(data.length/ratio));for(let i=0;i<out.length;i++){const v=Math.max(-1,Math.min(1,data[Math.floor(i*ratio)]));out[i]=v<0?v*32768:v*32767}return base64(new Uint8Array(out.buffer))}
export default function NigerLiveVoice({onClose,onTranscript}:Props){
 const [status,setStatus]=useState('Connexion à Gemini Live…')
 const [muted,setMuted]=useState(false)
 const socket=useRef<WebSocket|null>(null),audio=useRef<AudioContext|null>(null),stream=useRef<MediaStream|null>(null),processor=useRef<ScriptProcessorNode|null>(null),source=useRef<MediaStreamAudioSourceNode|null>(null)
 const playing=useRef<Set<AudioBufferSourceNode>>(new Set()),nextPlay=useRef(0),ready=useRef(false),muteRef=useRef(false),onTranscriptRef=useRef(onTranscript)
 useEffect(()=>{onTranscriptRef.current=onTranscript},[onTranscript])
 useEffect(()=>{
  let disposed=false
  const close=()=>{for(const node of playing.current){try{node.stop()}catch{}}playing.current.clear();ready.current=false;socket.current?.close();processor.current?.disconnect();source.current?.disconnect();stream.current?.getTracks().forEach(t=>t.stop());void audio.current?.close()}
  async function connect(){
   try{
    const res=await fetch('/api/assistant/live-token',{method:'POST'})
    const info=await res.json()
    if(!res.ok)throw new Error(info.error||'Impossible de créer la session')
    if(disposed)return
    const ctx=new AudioContext();audio.current=ctx;await ctx.resume()
    const mic=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false})
    if(disposed){mic.getTracks().forEach(t=>t.stop());return}stream.current=mic
    const ws=new WebSocket('wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained?access_token='+encodeURIComponent(info.token))
    socket.current=ws
    ws.onopen=()=>{ws.send(JSON.stringify({setup:{model:'models/'+info.model,generationConfig:{responseModalities:['AUDIO']},inputAudioTranscription:{},outputAudioTranscription:{},systemInstruction:{parts:[{text:'Tu es Niger IA, un assistant conversationnel généraliste avec une expertise particulière sur le Niger. Réponds librement à toutes les questions, sans ramener systématiquement la discussion aux régions du Niger. Parle naturellement, avec des réponses adaptées à la question, en français ou dans la langue de l’utilisateur. Écoute les interruptions et garde le contexte de la conversation.'}]}}}))}
    ws.onmessage=async ev=>{
     try{
      const raw=typeof ev.data==='string'?ev.data:await (ev.data as Blob).text()
      const msg=JSON.parse(raw)
      if(msg.setupComplete){
       ready.current=true;setStatus('Je vous écoute…')
       const src=ctx.createMediaStreamSource(mic);source.current=src
       const proc=ctx.createScriptProcessor(2048,1,1);processor.current=proc
       proc.onaudioprocess=e=>{if(!ready.current||muteRef.current||ws.readyState!==WebSocket.OPEN)return;ws.send(JSON.stringify({realtimeInput:{audio:{mimeType:'audio/pcm;rate=16000',data:pcm16(e.inputBuffer.getChannelData(0),ctx.sampleRate)}}}))}
       src.connect(proc);proc.connect(ctx.destination)
      }
      const content=msg.serverContent
      if(content){
       if(content.interrupted){for(const node of playing.current){try{node.stop()}catch{}}playing.current.clear();nextPlay.current=ctx.currentTime;setStatus('Je vous écoute…')}
       const userText=content.inputTranscription?.text
       const aiText=content.outputTranscription?.text
       if(userText)onTranscriptRef.current('user',userText)
       if(aiText)onTranscriptRef.current('model',aiText)
       for(const part of content.modelTurn?.parts||[]){
        if(!part.inlineData?.data)continue
        const bin=atob(part.inlineData.data);const pcm=new Int16Array(bin.length/2)
        for(let i=0;i<pcm.length;i++){const lo=bin.charCodeAt(i*2),hi=bin.charCodeAt(i*2+1);pcm[i]=(hi<<8)|lo}
        const buffer=ctx.createBuffer(1,pcm.length,24000);const channel=buffer.getChannelData(0)
        for(let i=0;i<pcm.length;i++)channel[i]=pcm[i]/32768
        const node=ctx.createBufferSource();node.buffer=buffer;node.connect(ctx.destination)
        const start=Math.max(ctx.currentTime,nextPlay.current);node.onended=()=>{playing.current.delete(node);if(!playing.current.size&&ready.current)setStatus('Je vous écoute…')};playing.current.add(node);node.start(start);nextPlay.current=start+buffer.duration;setStatus('Niger IA vous répond…')
       }
       if(content.turnComplete&&!playing.current.size)setStatus('Je vous écoute…')
      }
     }catch(err){console.error('Gemini Live message',err)}
    }
    ws.onerror=()=>setStatus('Connexion Live interrompue')
    ws.onclose=e=>{ready.current=false;if(!disposed)setStatus('Session terminée ('+e.code+'). Fermez puis réessayez.')}
   }catch(e){if(!disposed)setStatus(e instanceof Error?e.message:'Microphone ou Live indisponible')}
  }
  void connect()
  return()=>{disposed=true;close()}
 },[])
 return <div className="nigerAiLiveDock" role="region" aria-label="Conversation Gemini Live">
  <div className={'nigerAiVoiceOrb '+(muted?'voice-idle':status==='Niger IA vous répond…'?'voice-speaking':status==='Je vous écoute…'?'voice-listening':status.startsWith('Connexion à')?'voice-thinking':'voice-idle')} aria-hidden="true"/>
  <p role="status">{status}</p>
  <div className="nigerAiVoiceActions">
   <button type="button" aria-label={muted?'Activer le micro':'Couper le micro'} onClick={()=>{muteRef.current=!muteRef.current;setMuted(muteRef.current)}}>{muted?<MicOff size={22}/>:<Mic size={22}/>}</button>
   <button type="button" aria-label="Fermer le mode Live" onClick={onClose}><X size={22}/></button>
  </div>
 </div>
}
