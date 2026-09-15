import { DomainEmailOrderForm } from "@/components/domain-email-order-form";
import { MarketingHeader } from "@/components/marketing-header";

export const metadata = { title: "Bestill domene og e-post", description: "Bestill domene og e-post for bedriften via Vedøy Studio." };

export default function DomainAndEmailPage() {
  return <main className="company-start-page"><MarketingHeader variant="public" /><section className="company-start-hero domain-order-hero"><div><p className="editorial-kicker lime">VEDØY INFRA · DOMENE OG E-POST</p><h1>Ryddig e-post.<br /><em>Eget domene.</em></h1><p>Send hva dere trenger, så setter Vedøy opp eller flytter domenet og e-posten etter en tydelig avklaring.</p><div className="company-start-hero__points"><span>✓ Registreres først etter bekreftelse</span><span>✓ Ingen passord i skjemaet</span><span>✓ Leveres via Domeneshop</span></div></div><aside><small>VIKTIG</small><h2>På bestilling.<br />Ikke automatisk.</h2><p>Skjemaet lagres hos Vedøy og varsler administrator. Det kjøper ikke domene, e-post eller abonnement automatisk.</p></aside></section><section className="company-start-form-wrap"><div className="company-start-form-wrap__heading"><p className="editorial-kicker lime">BESTILLING</p><h2>Hva skal<br /><em>settes opp?</em></h2><p>Oppgi ønsket domene og e-postbehov. Pris og tilgjengelighet avklares før Vedøy gjennomfører bestillingen.</p></div><DomainEmailOrderForm /></section></main>;
}
