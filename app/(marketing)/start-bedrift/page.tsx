import Link from "next/link";
import { CompanyRegistrationForm } from "@/components/company-registration-form";
import { MarketingHeader } from "@/components/marketing-header";

export const metadata = { title: "Start bedrift i Vedøy Growth", description: "Registrer virksomheten og planlegg teamet ditt i Vedøy Growth." };

const planIds = new Set(["trial", "start", "team", "plus"]);

export default async function StartBedriftPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan } = await searchParams;
  const initialPlan = plan && planIds.has(plan) ? plan as "trial" | "start" | "team" | "plus" : "team";
  return <main className="company-start-page"><MarketingHeader variant="public" /><section className="company-start-hero"><div><p className="editorial-kicker lime">VEDØY GROWTH · BEDRIFTSOPPSETT</p><h1>Et eget sted<br />for <em>teamet ditt.</em></h1><p>Registrer virksomheten som eier eller daglig leder. Velg abonnement, se antall plasser og planlegg hvem som skal få tilgang.</p><div className="company-start-hero__points"><span>✓ Eier teller som én bruker</span><span>✓ Roller velges før oppstart</span><span>✓ Ingen automatisk betaling</span></div></div><aside><small>TRYGG OPPSTART</small><h2>Én bedrift.<br />Én tydelig plan.</h2><p>Hver nye bedrift gjennomgås før aktivering. Det beskytter kundedata og gjør at dere får et arbeidsområde som ikke blandes med andre.</p><Link href="/bestill-domene-og-epost">Trenger dere domene eller e-post? <span>↗</span></Link></aside></section><section className="company-start-form-wrap"><div className="company-start-form-wrap__heading"><p className="editorial-kicker lime">REGISTRER VIRKSOMHET</p><h2>Velg nivå og<br /><em>bygg teamet.</em></h2></div><CompanyRegistrationForm initialPlan={initialPlan} /></section><section className="company-start-notice"><div><small>HVA SKJER ETTERPÅ?</small><h2>Forespørsel først.<br /><em>Arbeidsområde etterpå.</em></h2></div><ol><li><b>01</b><span><strong>Vi sjekker opplysningene</strong><small>Virksomhet, kontaktperson, abonnementsnivå og teamplan gjennomgås.</small></span></li><li><b>02</b><span><strong>Vedøy klargjør oppsettet</strong><small>Dere får eget arbeidsområde før personer kan inviteres inn.</small></span></li><li><b>03</b><span><strong>Invitasjoner og roller aktiveres</strong><small>Administrator kan justere roller og invitere innenfor valgt setetak.</small></span></li></ol></section></main>;
}
