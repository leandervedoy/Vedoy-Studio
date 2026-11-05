export type InsightArticle = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readingMinutes: number;
  author: string;
  sections: ReadonlyArray<{ heading: string; paragraphs: ReadonlyArray<string> }>;
};

export const INSIGHT_ARTICLES: readonly InsightArticle[] = [
  {
    slug: "lokal-levering-uten-eget-budteam",
    title: "Lokal levering uten eget budteam: hva bør små bedrifter vurdere?",
    excerpt: "Rask levering er mer enn transport. Se hva lokale butikker og serveringssteder bør avklare om pris, kapasitet, personvern og kundens forventninger.",
    category: "Logistikk og digitalisering",
    publishedAt: "2026-11-05T17:00:00+01:00",
    readingMinutes: 5,
    author: "Vedoy Insights · KI-assistert",
    sections: [
      {
        heading: "Fra bestilling til dør – hvem har ansvaret?",
        paragraphs: [
          "For en liten butikk kan lokal levering være en praktisk tilleggstjeneste. Men før den første pakken kjøres ut, må virksomheten vite hvem som tar imot bestillingen, hvem som beregner frakten, og hvem som svarer kunden dersom varen blir forsinket. Disse spørsmålene er ofte viktigere enn selve leveringsknappen.",
          "En god løsning viser kunden en tydelig totalpris og et realistisk leveringsvindu før kjøpet fullføres. Den bør også definere hvem som håndterer avbestillinger, skader og mislykkede leveringer. Kundens forventninger må bygge på faktisk kapasitet, ikke på løfter om levering på noen minutter."
        ]
      },
      {
        heading: "Tre måter å organisere lokal levering på",
        paragraphs: [
          "Bedriften kan bruke egne ansatte, avtale kjøring med en lokal leveringspartner eller integrere en ekstern tjeneste via API der geografisk dekning og kommersielle vilkår tillater det. Egen bemanning kan gi tett kontroll, men krever opplæring, arbeidsplaner og riktig forsikring. Eksterne partnere kan gi mer fleksibilitet, men innebærer kostnader, avhengigheter og behov for tydelige avtaler.",
          "Det er sjelden nødvendig å bygge et komplisert logistikksystem fra dag én. Start heller med et begrenset leveringsområde, faste leveringsvinduer og en enkel manuell rutine. Mål faktisk tidsbruk, kostnad og kundetilfredshet før ordningen utvides."
        ]
      },
      {
        heading: "Regn på den reelle kostnaden",
        paragraphs: [
          "Transportprisen alene forteller ikke om leveringen er lønnsom. Ta med plukking og pakking, kundeservice, bomturer, eventuelle returer, gebyrer og administrasjon. Et leveringsgebyr som virker attraktivt for kunden, kan bli dyrt dersom en ansatt må kjøre langt for én liten ordre.",
          "For mange virksomheter er det klokere å starte med et tydelig fraktgebyr betalt av kunden, kombinert med en realistisk minimumsordrestørrelse eller avgrensede leveringsvinduer. Pris og vilkår må vises før kunden bekrefter kjøpet."
        ]
      },
      {
        heading: "Personvern og trygghet følger med pakken",
        paragraphs: [
          "En leveringsplattform behandler ofte navn, telefonnummer og adresser. Tilgangen bør begrenses til de personene som faktisk trenger opplysningene for å gjennomføre oppdraget. Adresseinformasjon bør ikke være synlig i åpne oppdragslister, og det må finnes rutiner for sikker lagring, sletting og avvik.",
          "Dersom virksomheten benytter bud, må også trafikksikkerhet, arbeidsavtaler, arbeidstid, forsikring og eventuelle særregler for mindreårige avklares. En teknisk løsning kan ikke erstatte arbeidsgiveransvar eller en forsvarlig operasjonell prosess."
        ]
      },
      {
        heading: "Vedoy Deliver: en pilot for Haugalandet",
        paragraphs: [
          "Vedøy utvikler Vedoy Deliver som en nettbasert pilot for lokale leveringsoppdrag, budsøknader og forespørsler fra bedrifter. Nettsiden er publisert med mobiltilpasset grensesnitt, en demonstrasjon av GPS-kart, informasjon om planlagte leveringsformer og tydelige pilotsider for personvern og vilkår.",
          "Dette er foreløpig ikke en operativ transporttjeneste. Oppdragene som vises i demonstrasjonen, er ikke ekte. Automatisk bestilling, Wolt Drive, BankID-verifisering og utbetalinger er ikke åpnet. Godkjenning av bud, arbeidsvilkår og ende-til-ende-testing må være på plass før reelle leveranser kan gjennomføres."
        ]
      },
      {
        heading: "En fornuftig start for lokale bedrifter",
        paragraphs: [
          "Definer først hvilke varer du vil levere, hvor langt du kan kjøre, og hva kunden faktisk er villig til å betale. Test deretter en enkel prosess med få bestillinger og tydelig kommunikasjon. Dokumenter hva som går bra, og hva som skaper ekstra arbeid. Først da kan en automatisert integrasjon gi forutsigbar verdi.",
          "Bedrifter som vil diskutere en framtidig leveringsløsning kan se Vedoy Deliver-piloten og sende en uforpliktende forespørsel. Målet er å gjøre lokal handel enklere – med åpenhet om hva som fungerer i dag, og hva som fortsatt er under utvikling."
        ]
      }
    ]
  }
];

export function getInsightArticle(slug: string): InsightArticle | undefined {
  return INSIGHT_ARTICLES.find((article) => article.slug === slug);
}
