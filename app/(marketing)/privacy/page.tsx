import Link from "next/link";

export const metadata = { title: "Personvern", description: "Slik Vedøy behandler personopplysninger i Vedøy Studio." };

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <div className="container">
        <p className="eyebrow">PERSONVERN · GJELDENDE FRA 18. AUGUST 2026</p>
        <h1>Personvern i Vedøy Studio.</h1>
        <p className="legal-lead">Her forklarer vi hvilke opplysninger Vedøy mottar, hvorfor de brukes og hvilke valg du har.</p>

        <h2>1. Hvem er ansvarlig?</h2>
        <p>VEDØY, org.nr. 937 024 622, er behandlingsansvarlig for nettstedet og bestillingsflyten. Forretningsadresse: Austrheimvegen 94B, 5517 Haugesund. Du kan kontakte oss på <a href="mailto:leander@vedoystudio.no">leander@vedoystudio.no</a> eller <a href="tel:+4745917041">459 17 041</a>.</p>

        <h2>2. Opplysninger vi behandler</h2>
        <ul>
          <li>Kontaktopplysninger du sender inn, som navn, e-post, telefon og bedriftsnavn.</li>
          <li>Bestillingsopplysninger, virksomhetsinformasjon og valgene du gjør for hosting og domene.</li>
          <li>Betalingsstatus, faktura- og transaksjonsreferanser fra Stripe. Vedøy mottar ikke kortnummer eller sikkerhetskode.</li>
          <li>Tekniske logger som IP-adresse, tidspunkt, nettleser og feilmeldinger når dette er nødvendig for sikkerhet og drift.</li>
        </ul>
        <p>Logoen som brukes i den lokale klesforhåndsvisningen behandles i nettleseren din og sendes ikke til Vedøy før du eventuelt velger å kontakte oss eller bestille produksjon.</p>

        <h2>3. Hvorfor opplysningene brukes</h2>
        <ul>
          <li>For å svare på henvendelser og forberede eller oppfylle en avtale.</li>
          <li>For å gjennomføre betaling, fakturering, domeneregistrering og klargjøring av hosting.</li>
          <li>For å sikre, feilsøke og forbedre tjenesten basert på vår berettigede interesse i stabil og sikker drift.</li>
          <li>For å oppfylle lovpålagte krav til regnskap, dokumentasjon og myndighetsrapportering.</li>
        </ul>

        <h2>4. Leverandører</h2>
        <p>Vedøy bruker Vercel til nettside og eventuell domeneregistrering, Stripe til betaling og abonnement, og Hetzner Cloud når kunden velger serverdrift som klargjøres der. Leverandørene mottar bare opplysninger de trenger for sin del av tjenesten. Egne vilkår og databehandleravtaler gjelder der leverandøren opptrer som databehandler.</p>

        <h2>5. Lagring og overføringer</h2>
        <p>Henvendelser slettes eller anonymiseres når de ikke lenger er nødvendige. Ordre-, avtale- og regnskapsopplysninger beholdes så lenge avtalen eller lovpålagte dokumentasjonskrav gjør det nødvendig. Enkelte leverandører kan behandle opplysninger utenfor EØS; i slike tilfeller skal overføringen være dekket av et gyldig overføringsgrunnlag.</p>

        <h2>6. Dine rettigheter</h2>
        <p>Du kan be om innsyn, retting, sletting, begrensning eller dataportabilitet, og protestere mot behandling som bygger på berettiget interesse. Rettighetene kan være begrenset av andre lovkrav. Kontakt oss på e-postadressen over. Du kan også klage til Datatilsynet.</p>

        <h2>7. Endringer</h2>
        <p>Erklæringen oppdateres når tjenesten eller leverandørbruken endres. Datoen øverst viser siste vesentlige oppdatering.</p>

        <div className="legal-actions"><Link className="button button--dark" href="/terms">Les bestillingsvilkårene</Link><Link className="text-link" href="/">Til forsiden</Link></div>
      </div>
    </main>
  );
}
