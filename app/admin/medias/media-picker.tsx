'use client'

import { Camera, ImagePlus, Video, X } from 'lucide-react'
import { useRef, useState } from 'react'

export default function MediaPicker(){
 const input=useRef<HTMLInputElement>(null),camera=useRef<HTMLInputElement>(null)
 const [file,setFile]=useState<File|null>(null),[preview,setPreview]=useState('')
 const choose=(f:File|null)=>{if(!f)return;setFile(f);setPreview(URL.createObjectURL(f))}
 const clear=()=>{setFile(null);setPreview('');if(input.current)input.current.value='';if(camera.current)camera.current.value=''}
 return <div style={{display:'grid',gap:12}}>
  <input ref={input} type="file" name="media_file" accept="image/*,video/*" hidden onChange={e=>choose(e.target.files?.[0]||null)}/>
  <input ref={camera} type="file" accept="image/*,video/*" capture="environment" hidden onChange={e=>choose(e.target.files?.[0]||null)}/>
  <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
   <button type="button" onClick={()=>input.current?.click()} className="mediaPickerButton"><ImagePlus size={21}/> Galerie</button>
   <button type="button" onClick={()=>input.current?.click()} className="mediaPickerButton mediaPickerCamera"><Camera size={21}/> Caméra</button>
   <button type="button" onClick={()=>camera.current?.click()} className="mediaPickerButton"><Video size={20}/> Prendre une vidéo</button>
  </div>
  {file&&<div style={{position:'relative',borderRadius:16,overflow:'hidden',background:'#10231c',maxWidth:560}}>
   <button type="button" onClick={clear} aria-label="Retirer le média" style={{position:'absolute',right:10,top:10,zIndex:2,border:0,borderRadius:'50%',width:34,height:34,display:'grid',placeItems:'center',background:'rgba(0,0,0,.65)',color:'#fff',cursor:'pointer'}}><X size={18}/></button>
   {file.type.startsWith('video/')?<video src={preview} controls style={{width:'100%',maxHeight:320,display:'block'}}/>:<img src={preview} alt="Aperçu du média" style={{width:'100%',maxHeight:320,objectFit:'cover',display:'block'}}/>}
   <div style={{padding:'9px 12px',color:'#fff',fontSize:12}}>{file.name} · {(file.size/1024/1024).toFixed(1)} Mo</div>
  </div>}
 </div>
}
