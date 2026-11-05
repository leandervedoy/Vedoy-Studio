"use client";
import Link from "next/link";
import {DeliveryGpsMap} from "@/components/delivery-gps-map";
export default function DeliveryMapPreview(){
 return <main style={{maxWidth:960,margin:"auto",padding:"32px clamp(16px,4vw,45px) 80px"}}>
 <nav style={{display:"flex",gap:24,justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",marginBottom:55}}>
 <Link href="/" style={{fontWeight:800,fontSize:23}}>vedoy<span style={{color:"#278252"}}>deliver</span></Link>
 <Link href="/bedrift">For bedrifter ↗</Link></nav>
 <p className="eyebrow">LEVERINGSKART – DEMO</p>
 <h1 style={{fontSize:"clamp(35px,6vw,60px)",margin:"12px 0 16px"}}>Følg din posisjon.</h1>
 <p style={{maxWidth:730,fontSize:18,marginBottom:30}}>Test GPS i nettleseren på mobil eller PC. Dette er en demonstrasjon av budets eget kart, uten kundeadresser eller pågående leveringsoppdrag.</p>
 <DeliveryGpsMap preview/>
 <section style={{marginTop:38}}>
  <h2>Planlagt for ekte leveringer</h2>
  <p>Når et godkjent bud har tatt et oppdrag, vises hente- eller leveringsadresse og en navigasjonsknapp. GPS aktiveres frivillig og vises kun lokalt på budets enhet. Delt sanntidssporing med kunder krever et separat sikkert backend-oppsett og er ikke aktivert.</p>
  <p style={{marginTop:16}}><Link href="/bedrift">Se planlagt Wolt Drive-reserveløsning for bedrifter →</Link></p>
 </section></main>;
}
