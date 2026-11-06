import type {Metadata} from "next";
import Link from "next/link";

export const metadata:Metadata={
 title:"Personvern | Vedoy Deliver",
 description:"Hvordan Vedoy Deliver behandler opplysninger om bud og bedrifter i pilotfasen.",
 robots:{index:true,follow:true}
};
const sectionStyle={marginTop:34,lineHeight:1.8} as const;
export default function PrivacyPage(){
 return <main style={{background:"#f7f8f3",minHeight:"100vh",color:"#16372a"}}>
  <article style={{maxWidth:840,margin:"0 auto",padding:"46px 22px 90px"}}>
   <nav aria-label="Tilbake"><Link href="/" style={{fontWeight:800,color:"#22694c"}}>← Vedoy Deliver</Link></nav>
   <p style={{marginTop:65,fontSize:12,fontWeight:800,letterSpacing:2,color:"#397a56"}}>PERSONVERN · OPPDATERT 5. NOVEMBER 2026</p>
   <h1 style={{fontSize:"clamp(40px,7vw,66px)",lineHeight:1.1,margin:"15px 0 22px"}}>Dine opplysninger. Din trygghet.</h1>
   <p style={{fontSize:19,lineHeight:1.7}}>Vedoy Deliver er foreløpig en pilot. Her forklarer vi hvilke opplysninger vi behandler når du ber om innlogging, søker som bud eller melder interesse fra en bedrift.</p>
   <section style={sectionStyle}><h2>Behandlingsansvarlig og kontakt</h2><p>Vedøy er ansvarlig for personopplysninger som samles inn gjennom Vedoy Deliver. Spørsmål, forespørsler om innsyn eller sletting kan sendes til <a href="mailto:kontakt@vedoy.store">kontakt@vedoy.store</a>.</p></section>
   <section style={sectionStyle}><h2>Hvilke opplysninger bruker vi?</h2><p>Ved innlogging behandles e-postadresse og nødvendige autentiseringsdata. En budsøk­nad kan inneholde navn, aldersgruppe, by, ønsket transportmåte, motivasjon og tilgjengelighet. Bedriftsforespørsler kan inneholde foretaksnavn, organisasjonsnummer, kontaktperson og beskrivelse av leveringsbehov.</p><p>Hvis et ekte oppdrag åpnes senere, kan det bli nødvendig å behandle hente- og leveringsadresse samt mottakerinformasjon. Dette blir først brukt når det finnes en godkjent oppdragsflyt. GPS-kartets demonstrasjon bruker posisjon i nettleseren bare når du gir tillatelse.</p></section>
   <section style={sectionStyle}><h2>Formål og behandlingsgrunnlag</h2><p>Opplysningene brukes til sikker innlogging, behandling av forespørsler, vurdering av søknader og nødvendig oppfølging. Behandlingen bygger på en konkret forespørsel eller tiltak før en eventuell avtale, og der det er aktuelt en berettiget interesse eller lovpålagt plikt. Posisjon krever særskilt tillatelse i enheten din.</p></section>
   <section style={sectionStyle}><h2>Lagring og mottakere</h2><p>Appen benytter Supabase til autentisering og lagring i en EU-region (Stockholm). Opplysninger gjøres bare tilgjengelige for roller som trenger dem. Leveringsadresser skal ikke være synlige for andre bud enn den som er tildelt et oppdrag. Data lagres ikke lenger enn nødvendig for formålet eller lovpålagte krav; konkrete sletterutiner må ferdigstilles før full drift.</p></section>
   <section style={sectionStyle}><h2>Identitetskontroll og betaling</h2><p>BankID/Signicat-verifisering, ekte leveringer og automatiske utbetalinger er ikke aktivert i piloten. Dersom slike funksjoner innføres, vil informasjonen oppdateres før personopplysninger behandles til nye formål.</p></section>
   <section style={sectionStyle}><h2>Dine rettigheter</h2><p>Du kan be om innsyn, korrigering, sletting og begrensning av behandling når vilkårene er oppfylt. Du kan også kontakte Datatilsynet dersom du mener opplysningene dine behandles i strid med reglene. Kontakt oss på <a href="mailto:kontakt@vedoy.store">kontakt@vedoy.store</a>.</p></section>
   <p style={{marginTop:50,borderTop:"1px solid #d3e2d4",paddingTop:22,fontSize:13,color:"#5e7464"}}>Dette er personverninformasjon for pilotversjonen. Operasjonell databehandlerkontroll, sletting og rutiner må verifiseres før full leveringsdrift. <Link href="/vilkar">Les også pilotvilkårene.</Link></p>
  </article>
 </main>;
}