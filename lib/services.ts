export type StudioService = {
  number: string;
  slug: string;
  title: string;
  cardText: string;
  eyebrow: string;
  lead: string;
  introduction: string;
  deliverables: string[];
  focus: string[];
  process: string[];
  nextStep: string;
};

export const studioServices: StudioService[] = [
  {
    number: "01",
    slug: "nettsider",
    title: "Nettsider",
    cardText: "Raske, responsive nettsider med tydelig design, SEO og en struktur som gjør det lett å ta kontakt.",
    eyebrow: "DESIGN · UTVIKLING · LANSERING",
    lead: "En nettside som forklarer verdien din raskt — og gjør neste steg enkelt.",
    introduction: "Vedøy Studio bygger nettsider fra første struktur til ferdig publisering. Innhold, design, kode, analyse og teknisk drift blir utviklet som én helhet, slik at siden både ser riktig ut og fungerer i praksis.",
    deliverables: ["Informasjonsarkitektur og innholdsretning", "Responsivt design for mobil, nettbrett og desktop", "Utvikling, kontaktskjema og nødvendige integrasjoner", "SEO-grunnlag, ytelse, analyse og publisering"],
    focus: ["Next.js", "React", "SEO", "Tilgjengelighet", "Vercel", "CMS ved behov"],
    process: ["Vi avklarer målgruppe, innhold og ønsket handling.", "Du får en tydelig visuell retning og klikkbar gjennomgang.", "Løsningen bygges, testes og kvalitetssikres på relevante skjermstørrelser.", "Vi publiserer og kan følge opp med drift og videre forbedring."],
    nextStep: "Send dagens nettside, et eksempel du liker eller bare en kort beskrivelse av bedriften."
  },
  {
    number: "02",
    slug: "webapper",
    title: "Webapper",
    cardText: "Kundeportaler, dashboards, interne systemer og skreddersydde arbeidsflyter.",
    eyebrow: "PRODUKT · SYSTEM · AUTOMATISERING",
    lead: "Digitale verktøy som erstatter manuelle steg og samler arbeidet på ett sted.",
    introduction: "Vi designer og utvikler webapper rundt den faktiske arbeidsflyten. Det kan være en kundeportal, et internt system, booking, rapportering eller en ny digital tjeneste som skal kunne vokse over tid.",
    deliverables: ["Behovskartlegging og løsningsarkitektur", "Brukerflyt, grensesnitt og prototype", "Frontend, backend, database og API-er", "Roller, sikkerhet, logging og produksjonssetting"],
    focus: ["Next.js", "TypeScript", "PostgreSQL", "API-er", "Autentisering", "Automatisering"],
    process: ["Vi finner den minste versjonen som skaper reell verdi.", "Kritiske flyter blir prototypet og avklart før full utvikling.", "Funksjoner leveres i kontrollerbare deler med løpende demo.", "Måling og tilbakemeldinger bestemmer hva som bygges videre."],
    nextStep: "Beskriv hva dere gjør manuelt i dag, hvem som bruker løsningen og hva som må bli enklere."
  },
  {
    number: "03",
    slug: "nettbutikk",
    title: "Nettbutikk",
    cardText: "Moderne netthandel, produktstruktur, betaling og integrasjoner som kan utvides.",
    eyebrow: "HANDEL · INNHOLD · VEKST",
    lead: "En ryddig kjøpsreise med en butikk som er enkel å drive videre.",
    introduction: "Vedøy Studio bygger nettbutikker der merkevare, produktpresentasjon og konvertering henger sammen. Vi kan bruke Shopify som handelsmotor og bygge en skreddersydd front, eller sette opp en effektiv standardbutikk når det er riktigst.",
    deliverables: ["Produkt- og kolleksjonsstruktur", "Butikkdesign og mobil kjøpsreise", "Betaling, frakt, e-post og analyse", "Lansering, opplæring og forbedringsplan"],
    focus: ["Shopify", "Checkout", "Headless commerce", "Analyse", "SEO", "Integrasjoner"],
    process: ["Vi avklarer sortiment, marked og driftsbehov.", "Kategorier, produktsider og checkout planlegges som én kundereise.", "Betaling, frakt og varslinger testes før lansering.", "Data fra faktisk bruk brukes til å forbedre butikken."],
    nextStep: "Send produktlisten, dagens butikk eller planlagt sortiment, så foreslår vi riktig oppsett."
  },
  {
    number: "04",
    slug: "hosting-og-domene",
    title: "Hosting & domene",
    cardText: "DNS, SSL, backup, publisering og teknisk drift samlet hos én kontakt.",
    eyebrow: "DOMENE · SERVER · DRIFT",
    lead: "Velg kapasitet, domene og drift — med tydelig pris og sikker betaling.",
    introduction: "Konfiguratoren under beregner en reell bestilling for administrert hosting. Betaling håndteres av Stripe. Domener kontrolleres mot Vercels registrar-API, og servere kan klargjøres gjennom Hetzner når leverandørnøklene er aktivert.",
    deliverables: ["Domene, DNS og SSL", "Valgbar serverkapasitet og lagring", "Overvåking, backup og sikkerhetsoppdateringer", "Publisering og personlig teknisk kontakt"],
    focus: ["Vercel Registrar", "Hetzner Cloud", "Stripe", "DNS", "SSL", "Backup"],
    process: ["Velg servere, RAM, lagring, region og domene.", "Pris og domenestatus valideres på serveren.", "Stripe gjennomfører betaling og oppretter abonnementet.", "Ordren klargjøres automatisk når leverandørtilgang er aktivert."],
    nextStep: "Konfigurer løsningen under, eller kontakt oss dersom du vil flytte en eksisterende tjeneste."
  },
  {
    number: "05",
    slug: "design-og-profil",
    title: "Design & profil",
    cardText: "UI/UX, landingssider, kampanjer og en helhetlig digital identitet.",
    eyebrow: "IDENTITET · UI/UX · SYSTEM",
    lead: "En tydelig identitet som fungerer like godt i produktet som i markedsføringen.",
    introduction: "Vi utvikler visuelle retninger og digitale designsystemer som gjør merkevaren gjenkjennelig og enkel å bruke. Oppdraget kan være en målrettet forbedring eller en komplett retning for en ny satsing.",
    deliverables: ["Visuell retning, farger og typografi", "Logoanvendelse og digitale retningslinjer", "UI-komponenter og sidemaler", "Kampanjemateriell og lanseringsflater"],
    focus: ["Art direction", "UI/UX", "Designsystem", "Prototype", "Merkevare", "Innholdsdesign"],
    process: ["Vi avklarer posisjon, målgruppe og ønsket uttrykk.", "Flere retninger samles til én tydelig retning.", "Identiteten prøves i reelle flater, ikke bare på et moodboard.", "Du får et system som kan brukes konsekvent videre."],
    nextStep: "Del dagens profil og hvor den ikke fungerer godt nok, eller beskriv følelsen dere vil skape."
  },
  {
    number: "06",
    slug: "profilprodukter",
    title: "Profilprodukter",
    cardText: "Klær og tilbehør med bedriftens egen logo — fra produktvalg til produksjon.",
    eyebrow: "KLÆR · LOGO · PRODUKSJON",
    lead: "Bedriftsklær som føles gjennomtenkte — fra digital forhåndsvisning til ferdig produkt.",
    introduction: "Last opp logoen på forsiden og prøv den på utvalgte plagg. Vedøy Studio hjelper med produktvalg, plassering, trykk eller broderi og en bestilling som passer bruken og budsjettet.",
    deliverables: ["Produkt- og størrelsesforslag", "Logojustering og visuell plassering", "Trykk, broderi og produksjonsunderlag", "Tilbud, korrektur og samlet levering"],
    focus: ["Arbeidsklær", "T-skjorter", "Hoodies", "Broderi", "Trykk", "Merkevare"],
    process: ["Velg plagg og last opp logo for en rask visualisering.", "Vi kvalitetssikrer fil, størrelse og plassering.", "Du godkjenner korrektur og pris før produksjon.", "Produktene produseres og leveres samlet."],
    nextStep: "Prøv logoen på plagg på forsiden, og send antall, størrelser og ønsket leveringstid."
  },
  {
    number: "07",
    slug: "shopify-og-commerce",
    title: "Shopify & commerce",
    cardText: "Nettbutikk, Shopify-app og integrasjoner med riktig oppsett for hvordan bedriften faktisk skal selge.",
    eyebrow: "SHOPIFY · APP · INTEGRASJON",
    lead: "Riktig Shopify-verktøy for butikk, app og videre vekst.",
    introduction: "Noen bedrifter trenger en rask nettbutikk. Andre trenger en installérbar Shopify-app som synkroniserer produkter, ordre eller booking. Vedøy Studio velger riktig spor før vi bygger, slik at løsningen blir enklere å drifte og tryggere å utvide.",
    deliverables: ["Shopify-butikk eller skreddersydd Next.js-front", "Shopify CLI-oppsett for installérbar bedrift/app", "Produkter, ordre og kundesynk via Admin API", "Webhooks, testing, tilgangsstyring og lansering"],
    focus: ["Shopify CLI", "Storefront API", "Admin API", "Webhooks", "Next.js", "Vercel"],
    process: ["Vi velger om dere trenger butikk, embedded app eller en integrasjon.", "Vi avklarer data, tilganger, Shopify-scopes og hvilke systemer som skal snakke sammen.", "Løsningen bygges med testbutikk, sikre miljøvariabler og verifiserte webhooks.", "Vi kjører pilot med reelle ordre eller data før bred lansering."],
    nextStep: "Fortell om dere skal selge varer, automatisere arbeid i Shopify eller koble Shopify til Booking og Growth."
  }
];

export function getStudioService(slug: string) {
  return studioServices.find((service) => service.slug === slug);
}
