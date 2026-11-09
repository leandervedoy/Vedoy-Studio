import type {Metadata} from "next";
import Link from "next/link";

export const metadata:Metadata={title:"Pilotvilkår | Vedoy Deliver",description:"Vilkår og avgrensninger for Vedoy Deliver som pilotprosjekt."};
const sec={marginTop:32,lineHeight:1.8} as const;
export default function TermsPage(){return <main style={{background:"#f7f8f3",minHeight:"100vh",color:"#16372a"}}><article style={{maxWidth:840,margin:"0 auto",padding:"46px 22px 90px"}}>
 <Link href="/" style={{color:"#22694c",fontWeight:800}}>← Vedoy Deliver</Link>
 <p style={{marginTop:65,fontSize:12,fontWeight:800,letterSpacing:2,color:"#397a56"}}>PILOTVILKÅR · 5. NOVEMBER 2026</p>
 <h1 style={{fontSize:"clamp(40px,7vw,66px)",lineHeight:1.1,margin:"15px 0 20px"}}>Hva som er tilgjengelig – og hva som ikke er det.</h1>
 <p style={{fontSize:19,lineHeight:1.7}}>Vedoy Deliver er en offentlig demonstrasjons- og søknadsportal under utvikling, ikke en aktiv formidlingstjeneste for betalte leveranser.</p>
 <section style={sec}><h2>1. Om piloten</h2><p>Du kan utforske konseptet, lønnseksempler, GPS-demonstrasjon og planlagte bedriftsløsninger. Demooppdrag er oppdiktede eksempler og kan ikke bestilles, tildeles eller gi opptjening.</p></section>
 <section style={sec}><h2>2. Søknader og forespørsler</h2><p>En søknad om å bli bud gir ikke jobb, arbeidsavtale, medlemskap med rett til oppdrag eller lønn. Bedriftsforespørsler er uforpliktende og innebærer ikke en leveringsavtale. Vedøy må godkjenne brukere og avtaler gjennom egne prosesser.</p></section>
 <section style={sec}><h2>3. Mindreårige og sikkerhet</h2><p>Ingen mindreårige får tilgang til ekte oppdrag uten særskilt vurdering av alder, arbeidstidsregler, HMS, transportmåte, rutesikkerhet og nødvendig samtykke eller avtale. Selvrapportert alder gir ikke godkjenning.</p></section>
 <section style={sec}><h2>4. Tredjepartstjenester</h2><p>Wolt Drive, Signicat BankID, automatisk betaling og utbetaling er planlagte eller delvis utviklede integrasjoner og er ikke operative som del av denne piloten. Ingen eksterne leveringstjenester bestilles fra nettsiden per i dag.</p></section>
 <section style={sec}><h2>5. Priser og godtgjørelse</h2><p>Illustrerte priser, tidsestimater og beregnet godtgjørelse er ikke bindende tilbud. Faktiske leveringspriser, lønn, arbeidsgiveransvar, forsikring og vilkår må avtales og kontrolleres før tjenesten åpner.</p></section>
 <section style={sec}><h2>6. Kontakt</h2><p>Ved spørsmål om piloten, søknader eller fremtidige bedriftsavtaler, skriv til <a href="mailto:kontakt@vedoy.store">kontakt@vedoy.store</a>. Les også <Link href="/personvern">personvernerklæringen</Link>.</p></section>
 </article></main>;}
