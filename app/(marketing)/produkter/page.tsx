import Link from "next/link";
import type { Metadata } from "next";
import { vedoyClearCssProduct as product } from "@/lib/digital-products/vedoy-clear-css";
export const metadata: Metadata = { title: "Digitale produkter | Vedøy Studio", alternates: { canonical: "/produkter" } };
export default function DigitalProductsPage(){
 return <main style={{minHeight:"100vh",background:"#080b12",color:"#f6f8fb",padding:"clamp(35px,6vw,80px) 24px"}}>
  <div style={{maxWidth:1000,margin:"auto"}}>
   <Link href="/" style={{color:"#6dff9c"}}>Vedøy Studio ↗</Link>
   <p style={{color:"#6dff9c",fontSize:12,fontWeight:800,letterSpacing:".15em",marginTop:60}}>DIGITALE PRODUKTER</p>
   <h1 style={{fontSize:"clamp(2.5rem,6vw,5rem)",lineHeight:1.1,letterSpacing:"-.06em",margin:"16px 0 34px"}}>Små verktøy. Store muligheter.</h1>
   <article style={{background:"#0f1420",border:"1px solid #35463b",borderRadius:20,padding:"clamp(22px,4vw,36px)"}}>
    <small style={{color:"#6dff9c",letterSpacing:".12em"}}>CSS · DIGITALT PRODUKT · KOMMER SNART</small>
    <h2 style={{fontSize:30,margin:"17px 0 10px"}}>{product.title}</h2>
    <p style={{color:"#b6c3cc",maxWidth:700}}>Responsivt rammeverk med komponenter, lys/mørk modus og valgfri animasjon. Basert på css.vedoystudio.no.</p>
    <p style={{fontSize:22,fontWeight:750}}>29 kr <span style={{color:"#aebcc6",fontWeight:400,fontSize:15}}>/ $4 / €3 / £3</span></p>
    <Link href="/produkter/vedoy-css-digital-simplicity" style={{display:"inline-block",background:"#6dff9c",color:"#06130b",padding:"13px 19px",borderRadius:11,fontWeight:800}}>Se produktet ↗</Link>
   </article>
  </div>
 </main>;
}
