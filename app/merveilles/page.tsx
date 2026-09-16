import Header from '../../components/site/header'
import Footer from '../../components/site/footer'
import wonders from '../../data/wonders'

export default function MerveillesPage(){return <><Header/><main className="page"><div className="container"><div className="kicker">Patrimoine & découverte</div><h1>Les merveilles du Niger</h1><p className="lead">Une sélection de lieux et paysages pour commencer votre exploration.</p><div className="grid">{wonders.map(w=><article className="card" key={w.name}><div className="cardimg" style={{backgroundImage:`url(${w.image})`}}/><div className="cardbody"><span className="tag">{w.type}</span><h3>{w.name}</h3><p>{w.text}</p></div></article>)}</div></div></main><Footer/></>}
