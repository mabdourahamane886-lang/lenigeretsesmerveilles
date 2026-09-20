'use client'
import {useEffect,useState} from 'react'
import Link from 'next/link'
import Header from '../../components/site/header'
import Footer from '../../components/site/footer'
type Fav={title:string;url:string}
export default function FavoritesPage(){const [items,setItems]=useState<Fav[]>([]);useEffect(()=>{try{setItems(JSON.parse(localStorage.getItem('niger-favoris')||'[]'))}catch{}},[]);return <><Header/><main className="page"><div className="container"><span className="kicker">Ma sélection</span><h1>Favoris</h1><p className="lead">Vos liens enregistrés sont conservés localement dans ce navigateur.</p>{!items.length?<div className="catalogEmpty large"><div><strong>Aucun favori pour le moment.</strong><span>Ajoutez des contenus depuis les pages que vous souhaitez retrouver rapidement.</span></div><Link className="proButton proButtonDark" href="/explorer">Explorer</Link></div>:<div className="catalogGrid">{items.map(x=><Link className="catalogCard" href={x.url} key={x.url}><div className="catalogBody"><h3>{x.title}</h3><span className="cardLink">Ouvrir <span>→</span></span></div></Link>)}</div>}</div></main><Footer/></>}
