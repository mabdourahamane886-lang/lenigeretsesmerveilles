import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Ethnies du Niger — Culture',
  description: 'La galerie des communautés du Niger est désormais intégrée à la page Culture.',
}

export default function EthniesRedirectPage() {
  redirect('/culture#ethnies')
}
