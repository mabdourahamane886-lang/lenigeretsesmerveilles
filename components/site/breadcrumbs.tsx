import Link from 'next/link'
export default function Breadcrumbs({items}:{items:{label:string;href?:string}[]}) {
  return <nav aria-label="Fil d’Ariane" style={{display:'flex',gap:8,flexWrap:'wrap',fontSize:13,marginBottom:24,color:'#68746d'}}>
    <Link href="/">Accueil</Link>{items.map((item,i)=><span key={item.label}>› {item.href ? <Link href={item.href}>{item.label}</Link> : item.label}</span>)}
  </nav>
}
