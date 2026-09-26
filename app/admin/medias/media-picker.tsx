'use client'

import { Camera, ImagePlus, Video, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export default function MediaPicker() {
  const galleryInput = useRef<HTMLInputElement>(null)
  const cameraInput = useRef<HTMLInputElement>(null)
  const videoInput = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const choose = (selected: File | null, source: 'gallery' | 'camera' | 'video') => {
    if (!selected) return

    // Keep only the latest selected source in FormData. Otherwise, an older
    // gallery file can win because createMedia checks media_file first.
    if (source !== 'gallery' && galleryInput.current) galleryInput.current.value = ''
    if (source !== 'camera' && cameraInput.current) cameraInput.current.value = ''
    if (source !== 'video' && videoInput.current) videoInput.current.value = ''

    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  const clear = () => {
    setFile(null)
    setPreview('')
    if (galleryInput.current) galleryInput.current.value = ''
    if (cameraInput.current) cameraInput.current.value = ''
    if (videoInput.current) videoInput.current.value = ''
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <input
        ref={galleryInput}
        type="file"
        name="media_file"
        accept="image/*,video/*"
        hidden
        onChange={(e) => choose(e.target.files?.[0] || null, 'gallery')}
      />
      <input
        ref={cameraInput}
        type="file"
        name="camera_file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => choose(e.target.files?.[0] || null, 'camera')}
      />
      <input
        ref={videoInput}
        type="file"
        name="video_camera_file"
        accept="video/*"
        capture="environment"
        hidden
        onChange={(e) => choose(e.target.files?.[0] || null, 'video')}
      />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button type="button" onClick={() => galleryInput.current?.click()} className="mediaPickerButton" aria-label="Choisir une photo ou une vidéo depuis la galerie">
          <ImagePlus size={21} /> Galerie
        </button>
        <button type="button" onClick={() => cameraInput.current?.click()} className="mediaPickerButton mediaPickerCamera" aria-label="Ouvrir la caméra et prendre une photo" title="Prendre une photo avec la caméra">
          <Camera size={21} /> <span>📷 Prendre une photo</span>
        </button>
        <button type="button" onClick={() => videoInput.current?.click()} className="mediaPickerButton" aria-label="Prendre une vidéo avec la caméra">
          <Video size={20} /> Prendre une vidéo
        </button>
      </div>

      {file && (
        <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#10231c', maxWidth: 560 }}>
          <button type="button" onClick={clear} aria-label="Retirer le média" style={{ position: 'absolute', right: 10, top: 10, zIndex: 2, border: 0, borderRadius: '50%', width: 34, height: 34, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,.65)', color: '#fff', cursor: 'pointer' }}>
            <X size={18} />
          </button>
          {file.type.startsWith('video/') ? (
            <video src={preview} controls style={{ width: '100%', maxHeight: 320, display: 'block' }} />
          ) : (
            <img src={preview} alt="Aperçu du média" style={{ width: '100%', maxHeight: 320, objectFit: 'cover', display: 'block' }} />
          )}
          <div style={{ padding: '9px 12px', color: '#fff', fontSize: 12 }}>
            {file.name} · {(file.size / 1024 / 1024).toFixed(1)} Mo
          </div>
        </div>
      )}
    </div>
  )
}
