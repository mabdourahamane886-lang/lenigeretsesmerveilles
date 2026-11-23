'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { Download, X } from 'lucide-react'
import { useAppEnvironment } from '../../components/site/app-environment'
import styles from './application.module.css'

function installHelp() {
  const agent = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(agent) || (/Macintosh/.test(agent) && navigator.maxTouchPoints > 1)) {
    return 'Dans Safari, ouvrez le menu Partager, puis choisissez « Sur l’écran d’accueil ». Activez « Ouvrir comme app web » si cette option apparaît, puis touchez Ajouter.'
  }
  if (/Android/.test(agent)) {
    return 'Dans Chrome, ouvrez le menu ⋮ et choisissez « Ajouter à l’écran d’accueil », puis « Installer » si cette option apparaît.'
  }
  return 'Sur ordinateur, ouvrez cette page dans Chrome ou Microsoft Edge. Cliquez sur l’icône d’installation dans la barre d’adresse, ou recherchez l’option d’installation dans le menu du navigateur.'
}

export default function InstallButton() {
  const { installed, requestInstall } = useAppEnvironment()
  const dialog = useRef<HTMLDialogElement>(null)
  const [instructions, setInstructions] = useState('')

  async function install() {
    if (await requestInstall()) return
    setInstructions(installHelp())
    dialog.current?.showModal()
  }

  if (installed) return null
  return (
    <>
      <button type="button" className={styles.install} onClick={install}><Download size={17} /> Installer</button>
      <dialog ref={dialog} className={styles.dialog} aria-labelledby="install-title">
        <button type="button" className={styles.close} onClick={() => dialog.current?.close()} aria-label="Fermer"><X size={19} /></button>
        <Image src="/images/niger-merveilles-mark.svg" alt="" width={66} height={42} />
        <h2 id="install-title">Installer l’application</h2>
        <p>{instructions}</p>
      </dialog>
    </>
  )
}
