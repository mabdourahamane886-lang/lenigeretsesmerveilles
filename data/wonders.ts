import { nigerMedia } from './media'

const wonders = [
  {
    name: 'Agadez',
    type: 'Patrimoine',
    text: 'Une ville historique au cœur de l’Aïr, avec une architecture et des savoir-faire emblématiques.',
    image: nigerMedia.agadez.image,
    credit: nigerMedia.agadez,
  },
  {
    name: 'Désert du Ténéré',
    type: 'Paysages',
    text: 'Les paysages de dunes du Ténéré, au nord du Niger, au cœur du Sahara.',
    image: nigerMedia.tenere.image,
    credit: nigerMedia.tenere,
  },
  {
    name: 'Fleuve Niger',
    type: 'Nature',
    text: 'Le fleuve Niger et ses paysages autour de Niamey, au cœur de la vie et des activités du pays.',
    image: nigerMedia.niamey.image,
    credit: nigerMedia.niamey,
  },
]

export default wonders
