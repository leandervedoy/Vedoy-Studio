import Link from "next/link";

export const metadata = { title: "Bestillingsvilkår", description: "Vilkår for bedriftskjøp av hosting, domene og digitale tjenester fra Vedøy." };

export default function TermsPage() {
  return (
    <main className="legal-page">
      <div className="container">
        <p className="eyebrow">BESTILLINGSVILKÅR · GJELDENDE FRA 18. AUGUST 2026</p>
        <h1>Vilkår for bedriftskunder.</h1>
        <p className="legal-lead">Vilkårene gjelder kjøp fra VEDØY, org.nr. 937 024 622. Nettbestillingen er laget for næringsdrivende. Den som bestiller bekrefter at vedkommende kan binde virksomheten.</p>

        <h2>1. Leverandør og kontakt</h2>
        <p>VEDØY, Austrheimvegen 94B, 5517 Haugesund. E-post: <a href="mailto:leander@vedoystudio.no">leander@vedoystudio.no</a>. Telefon: <a href="tel:+4745917041">459 17 041</a>.</p>

        <h2>2. Avtalen</h2>
        <p>Hosting- og domenekonfiguratoren sender en uforpliktende forespørsel. Avtalen inngås ikke gjennom skjemaet. Vedøy kontakter kunden for å avklare behov, pris og levering før eventuell separat avtale, betaling eller registrering.</p>

        <h2>3. Pris og betaling</h2>
        <p>Prisene i konfiguratoren er oppgitt i norske kroner eks. merverdiavgift og er kun prisanslag. Ingen betaling trekkes fra forespørselsskjemaet. Eventuell månedlig hosting, etablering og domeneregistrering avtales og faktureres separat etter avklaring.</p>

        <h2>4. Domener</h2>
        <ul>
          <li>Tilgjengelighet og leverandørpris kontrolleres på nytt før en eventuell registrering.</li>
          <li>Et domene er først sikret når registraren har bekreftet kjøpet.</li>
          <li>Kunden må oppgi korrekte registrantopplysninger og følge eventuell e-post for identitetsbekreftelse.</li>
          <li>Første registreringsår inngår i engangsbeløpet. Videre fornyelse og pris fremgår av senere varsel eller egen avtale.</li>
        </ul>

        <h2>5. Hosting og levering</h2>
        <p>Servervalg, RAM, lagring, region og backup brukes som grunnlag for tilbudet. Levering starter først etter separat avtale og nødvendige avklaringer. Vedøy kan bruke underleverandører, blant annet Hetzner Cloud og Vercel. Oppgitt lagring er kapasitet per forespurte server. Backup er et gjenopprettingstiltak og erstatter ikke kundens eget arkiv.</p>

        <h2>6. Kundens ansvar</h2>
        <p>Kunden er ansvarlig for lovlig innhold, sikre passord, nødvendige lisenser og at tjenesten ikke brukes til skadevare, uønsket masseutsendelse, angrep eller andre ulovlige formål. Vedøy kan stanse en tjeneste som utgjør en sikkerhetsrisiko eller vesentlig mislighold, og varsler når situasjonen tillater det.</p>

        <h2>7. Drift og vedlikehold</h2>
        <p>Vedøy arbeider for stabil drift og varsler planlagt vedlikehold når det er praktisk mulig. Kortvarige avbrudd kan forekomme ved oppdateringer, leverandørfeil eller nødvendige sikkerhetstiltak. Eventuelle særskilte krav til oppetid, responstid eller beredskap må avtales skriftlig.</p>

        <h2>8. Oppsigelse</h2>
        <p>Hosting kan sies opp skriftlig med virkning fra slutten av inneværende betalte periode. Betalt etablering, påløpte perioder og gjennomført domeneregistrering refunderes normalt ikke. Kunden må sikre eksport av egne data før tjenesten avsluttes.</p>

        <h2>9. Ansvar</h2>
        <p>Partene skal begrense tap når en feil oppstår. Vedøy er ikke ansvarlig for indirekte tap eller forhold utenfor rimelig kontroll, med mindre ufravikelig lov sier noe annet. For særskilt kritiske løsninger avtales ansvar, redundans og beredskap separat.</p>

        <h2>10. Personvern og data</h2>
        <p>Se <Link href="/privacy">personvernerklæringen</Link>. Når Vedøy behandler personopplysninger på kundens vegne i en driftet løsning, inngås databehandleravtale ved behov.</p>

        <h2>11. Lovvalg og tvister</h2>
        <p>Avtalen følger norsk rett. Partene skal først forsøke å løse uenighet gjennom dialog. Hvis det ikke lykkes, kan saken bringes inn for ordinære norske domstoler.</p>

        <div className="legal-actions"><Link className="button button--dark" href="/tjenester/hosting-og-domene#konfigurer-hosting">Konfigurer hosting</Link><Link className="text-link" href="/">Til forsiden</Link></div>
      </div>
    </main>
  );
}
