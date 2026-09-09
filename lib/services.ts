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
    lead: "Velg kapasitet, domene og drift — og send en tydelig forespørsel.",
    introduction: "Konfiguratoren under beregner et prisanslag for administrert hosting og kan brukes som startpunkt for web-apper, nettbutikker og andre fullstack-apper. Du sender en uforpliktende forespørsel som lagres i databasen. Vedøy går gjennom behov, rammeverk, leverandørvalg og levering før en eventuell avtale, betaling eller registrering.",
    deliverables: ["Domene, DNS og SSL", "Web-apper, nettbutikker og fullstack-løsninger", "Valg av rammeverk og serverkapasitet", "Overvåking, backup og personlig teknisk kontakt"],
    focus: ["Next.js", "React", "Vue", "Node", "Shopify", "Vercel / Hetzner"],
    process: ["Velg servere, RAM, lagring, region og domene.", "Pris og domenestatus brukes som grunnlag for forespørselen.", "Forespørselen lagres i Studio og kan sendes på e-post når det er konfigurert.", "Vedøy bekrefter løsning, pris og levering før noe kjøpes eller registreres."],
    nextStep: "Konfigurer løsningen under. Dette er ikke et automatisk kjøp, og du blir kontaktet før neste steg."
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
    cardText: "Vedøy Collective-klær og tilbehør med bedriftens egen logo — fra produktvalg til produksjonsforespørsel.",
    eyebrow: "KLÆR · LOGO · PRODUKSJON",
    lead: "Vedøy Collective-klær som føles gjennomtenkte — fra digital forhåndsvisning til ferdig produkt.",
    introduction: "Vedøy Studio kan tilby bedrifter klær via klesmerket Vedøy Collective. Plagg og tilbehør kan tilpasses med bedriftens logo, mens vi hjelper med produktvalg, plassering, trykk, korrektur og en forespørsel som passer bruken og budsjettet.",
    deliverables: ["Produkt- og størrelsesforslag", "Logojustering og visuell plassering", "Trykk, broderi og produksjonsunderlag", "Produksjon og fulfilment via valgt partner", "Tilbud, korrektur og samlet levering"],
    focus: ["Arbeidsklær", "T-skjorter", "Hoodies", "Broderi", "Trykk", "Merkevare"],
    process: ["Velg plagg og last opp logo for en rask visualisering.", "Vi kvalitetssikrer fil, størrelse og plassering.", "Du godkjenner korrektur og pris før produksjon.", "Produktene produseres og leveres samlet."],
    nextStep: "Prøv logoen på plaggene, og send antall, størrelser og ønsket leveringstid. Vi bekrefter løsning og pris før noe bestilles."
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
  },
  {
    number: "08",
    slug: "trykk-og-print",
    title: "Trykk & print",
    cardText: "Plakater, visittkort, klistremerker, flyers og annet materiell med ferdig design og produksjonsunderlag.",
    eyebrow: "PAPIR · PROFIL · PRODUKSJON",
    lead: "Fysiske flater som gjør merkevaren tydelig i møter, butikker og ute i byen.",
    introduction: "Vedøy Studio kan samle design, korrektur og bestilling av trykksaker hos passende produksjonspartner. Vi avklarer format, materiale, antall og levering før du godkjenner et endelig tilbud.",
    deliverables: ["Plakater, flyers og brosjyrer", "Visittkort og kortprodukter", "Klistremerker, etiketter og emballasjedetaljer", "Design, trykkfiler, korrektur og koordinert produksjon"],
    focus: ["Plakater", "Visittkort", "Klistremerker", "Flyers", "Etiketter", "Trykklar PDF"],
    process: ["Vi avklarer bruksområde, format, antall og frist.", "Design og materialvalg tilpasses merkevaren og budsjettet.", "Du godkjenner digital korrektur og endelig pris.", "Produksjon og levering bestilles først etter godkjenning."],
    nextStep: "Send logo, ønsket produkt, antall og leveringsdato, så finner vi et passende produksjonsoppsett."
  },
  {
    number: "09",
    slug: "musiker-og-artist",
    title: "Musiker & artist",
    cardText: "CD, vinyl, booklet, plateprint, merch og lanseringsmateriell samlet rundt musikken din.",
    eyebrow: "MUSIKK · FYSISK UTGIVELSE · MERCH",
    lead: "Fra ferdig master og artwork til en gjennomført fysisk utgivelse og merch-kolleksjon.",
    introduction: "Vedøy Studio hjelper musikere og artister med design og koordinering av fysiske musikkutgivelser. Det kan omfatte CD med trykk og booklet, vinyl med labels og omslag, plakater og merch. Produksjonspris, minimumsantall og rettigheter avklares før bestilling.",
    deliverables: ["CD med plateprint, cover og booklet", "Vinyl med egne labels, omslag og innstikk", "T-skjorter, hoodies, plakater og turnémerch", "Artwork, produksjonsfiler og lanseringspakke"],
    focus: ["CD", "Vinyl", "Booklet", "Artwork", "Merch", "Lansering"],
    process: ["Vi kartlegger format, opplag, frist og tilgjengelige masterfiler.", "Artwork og merch utvikles som én visuell utgivelse.", "Du godkjenner korrektur, leverandør og totalpris.", "Produksjonen settes i gang etter godkjenning og dokumenterte rettigheter."],
    nextStep: "Send musikkformat, ønsket opplag, artwork og lanseringsdato. Vi lager et realistisk forslag før noe bestilles."
  },
  {
    number: "10",
    slug: "kunstner-og-merch",
    title: "Kunstner & merch",
    cardText: "Kunsttrykk, plakater, klær, nettbutikk og digitale samlerutgaver for kunstnere.",
    eyebrow: "KUNST · PRODUKTER · SALG",
    lead: "Gjør kunsten tilgjengelig som gjennomførte produkter uten å miste det kunstneriske uttrykket.",
    introduction: "Vedøy Studio kan hjelpe kunstnere med kunsttrykk, plakater, kort, klær, merch, portefølje og nettbutikk. Digitale samlerutgaver og NFT-er kan vurderes når det gir mening, men markedsføres aldri som en garantert investering eller inntektskilde.",
    deliverables: ["Kunsttrykk, plakater, kort og nummererte opplag", "Klær, merch og produktvisualisering", "Portefølje, nettbutikk og produktpresentasjon", "Digitale samlerutgaver, metadata og rettighetsinformasjon"],
    focus: ["Kunsttrykk", "Plakater", "Merch", "Nettbutikk", "Digitale utgaver", "NFT ved behov"],
    process: ["Vi velger verk, produkter, opplag og salgskanal.", "Filer, farger, materialer og produktpresentasjon kvalitetssikres.", "Du godkjenner prøve, pris og rettighetsbruk.", "Butikk eller produksjon lanseres i et kontrollert første opplag."],
    nextStep: "Send eksempler på kunsten, ønskede produkter og hvordan du vil selge dem, så foreslår vi en liten første lansering."
  }
];

export function getStudioService(slug: string) {
  return studioServices.find((service) => service.slug === slug);
}
