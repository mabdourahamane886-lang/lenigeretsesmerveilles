import {ImageResponse} from 'next/og'
export const runtime='edge'
export const alt='Le Niger et ses Merveilles'
export const size={width:1200,height:630}
export const contentType='image/png'
export default function Image(){return new ImageResponse(<div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',justifyContent:'center',padding:'70px',background:'#FBFAF6',color:'#0B6A43',fontFamily:'Arial'}}><div style={{fontSize:28,letterSpacing:4,textTransform:'uppercase'}}>Patrimoine · Culture · Territoires</div><div style={{fontSize:72,fontWeight:800,marginTop:22}}>Le Niger et ses Merveilles 🇳🇪</div><div style={{fontSize:32,marginTop:30,color:'#E37B27'}}>Explorer • Comprendre • Transmettre</div></div>,size)}
