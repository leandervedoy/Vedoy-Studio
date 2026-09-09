import Link from "next/link";

type PricingType = "website" | "webapp" | "store" | "general" | "clothing";

type PricingConfig = {
  subject: string;
  factors: string;
  packages: Array<{ label: string; price: string; description: string; includes: string[]; featured?: boolean }>;
  examples: Array<{ price: string; description: string }>;
  runningPrice: string;
  runningText: string;
  sources: Array<{ name: string; href: string }>;
};

const pricing: Record<PricingType, PricingConfig> = {
  website: {
    subject: "nettside",
    factors: "antall sider, innhold, designnivå, språk, skjemaer, booking og integrasjoner",
    packages: [
      { label: "01 · LITEN START", price: "ca. 2 375–4 750 kr", description: "En tydelig landingsside eller liten nettside for en lokal bedrift.", includes: ["1–5 sider", "Responsivt design", "Kontaktskjema", "SEO-grunnoppsett", "Publisering"] },
      { label: "02 · BEDRIFTSNETTSIDE", price: "ca. 5 938–14 250 kr", description: "En komplett side som forklarer tjenester og skaper henvendelser.", includes: ["5–10 sider", "Tilpasset design", "Innholdsstruktur", "Skjema eller booking", "Analyse og teknisk SEO"], featured: true },
      { label: "03 · SKREDDERSYDD", price: "Fra ca. 14 250 kr", description: "For bedrifter som trenger CMS, flere språk eller integrasjoner.", includes: ["Skreddersydd designsystem", "CMS og dynamisk innhold", "API-er og integrasjoner", "Avansert SEO", "Utvidet testing"] }
    ],
    examples: [
      { price: "ca. 3 000 kr", description: "Én side for håndverker med tjenester, referanser og kontakt." },
      { price: "ca. 8 000 kr", description: "Seks sider for lokal bedrift med eget uttrykk, tekststruktur og booking." },
      { price: "ca. 18 750 kr", description: "Flerspråklig nettsted med CMS, innholdsmigrering og systemintegrasjon." }
    ],
    runningPrice: "Fra ca. 238 kr/mnd",
    runningText: "Kan omfatte hosting, sikkerhetsoppfølging, mindre endringer og teknisk support. Domene, betalte tjenester, større endringer og tredjepartskostnader prises separat.",
    sources: [
      { name: "Elevera", href: "https://elevera.no/blogg/nettside-bedrift-pris" },
      { name: "DinNettside", href: "https://dinnettside.no/fagstoff/nettside-pris" },
      { name: "FX Media", href: "https://fx-media.no/verktoy/nettside-priskalkulator" }
    ]
  },
  webapp: {
    subject: "webapp",
    factors: "antall brukerflyter og skjermbilder, roller, innlogging, database, integrasjoner, sikkerhet og automatisering",
    packages: [
      { label: "01 · PROTOTYPE", price: "ca. 11 875–19 000 kr", description: "En fokusert løsning som avklarer flyt og tester om idéen skaper verdi.", includes: ["Kjerneflyt og prototype", "Responsivt grensesnitt", "Enkel datamodell", "Testmiljø", "Videre utviklingsplan"] },
      { label: "02 · MVP MED BACKEND", price: "Fra ca. 23 750 kr", description: "En første brukbar versjon med ekte data og funksjoner for pilotkunder.", includes: ["Frontend og backend", "Database", "Innlogging og roller", "Adminflate", "Produksjonssetting"], featured: true },
      { label: "03 · SKALERBART SYSTEM", price: "Fra ca. 95 000 kr", description: "For større arbeidsflyter, flere organisasjoner og krevende integrasjoner.", includes: ["Løsningsarkitektur", "Flere roller og virksomheter", "Betaling eller abonnement", "Integrasjoner og hendelser", "Logging og skaleringsplan"] }
    ],
    examples: [
      { price: "ca. 32 500 kr", description: "Internt registreringsverktøy med dashboard og enkel database." },
      { price: "ca. 60 000 kr", description: "Kundeportal med innlogging, roller, bestillinger og adminflate." },
      { price: "Fra ca. 200 000 kr", description: "SaaS-plattform med abonnement, organisasjoner og flere integrasjoner." }
    ],
    runningPrice: "Fra ca. 475 kr/mnd",
    runningText: "Kan omfatte hosting, overvåking, backup, sikkerhetsoppdateringer og en avtalt mengde support. Videreutvikling, betalte API-er og høy trafikk kommer i tillegg.",
    sources: [
      { name: "Larsen Utvikling", href: "https://www.larsenutvikling.no/priser" },
      { name: "Mobilapplikasjon", href: "https://mobilapplikasjon.no/" },
      { name: "STUDIO X", href: "https://www.studiox.no/artikler/hva-koster-apputvikling" }
    ]
  },
  store: {
    subject: "nettbutikk",
    factors: "antall produkter og markeder, design, betalingsmåter, frakt, innhold, migrering og integrasjoner mot andre systemer",
    packages: [
      { label: "01 · PAYHIP START", price: "ca. 5 900–11 900 kr", description: "Den rimeligste Vedøy-starten for digitale produkter, kurs, medlemskap eller et mindre vareutvalg.", includes: ["Payhip-oppsett", "Inntil 10 produkter", "Tilpasset enkel butikkfront", "Betaling og domene", "Lansering og opplæring"], featured: true },
      { label: "02 · SHOPIFY START", price: "Fra ca. 23 750 kr", description: "En ryddig nettbutikk med produkter, betaling, frakt og grunnleggende vekstoppsett.", includes: ["Produkt- og kategoristruktur", "Shopify-oppsett", "Betaling og frakt", "Mobil kjøpsreise", "Lansering og opplæring"] },
      { label: "03 · VEKSTBUTIKK", price: "ca. 35 625–71 250 kr", description: "For butikker som trenger eget uttrykk, mer innhold og flere salgssystemer.", includes: ["Tilpasset butikkdesign", "Migrering av produkter", "E-post og analyse", "Flere markeder ved behov", "Utvalgte integrasjoner"] },
      { label: "04 · SKREDDERSYDD", price: "Fra ca. 71 250 kr", description: "En egen handleopplevelse med Shopify eller annen handelsmotor i bunnen.", includes: ["Next.js-butikkfront", "Handels-API", "Skreddersydd designsystem", "Avanserte integrasjoner", "Ytelse og skalering"] }
    ],
    examples: [
      { price: "ca. 5 900–11 900 kr", description: "Payhip-butikk for digitale produkter, kurs eller et lite sortiment." },
      { price: "Fra ca. 23 750 kr", description: "Mindre Shopify-butikk med opptil 30 produkter og standardintegrasjoner." },
      { price: "175 000 kr", description: "Merkevarebutikk med migrering, eget design, e-postflyt og analyse." },
      { price: "Fra 300 000 kr", description: "Headless nettbutikk med spesialdesign og koblinger mot eksterne systemer." }
    ],
    runningPrice: "Fra ca. 713 kr/mnd",
    runningText: "Kan omfatte teknisk drift, mindre endringer, overvåking og support. Payhip- eller Shopify-abonnement, transaksjons- og betalingsgebyrer, apper, domene og annonsekostnader betales separat.",
    sources: [
      { name: "DinNettside", href: "https://dinnettside.no/fagstoff/nettside-pris" },
      { name: "Innovena", href: "https://www.innovena.no/nettside/" },
      { name: "Shopify", href: "https://www.shopify.com/no/pricing" },
      { name: "Payhip", href: "https://payhip.com/pricing" }
    ]
  },
  general: {
    subject: "tjeneste",
    factors: "omfang, innhold, teknologi, antall brukere, integrasjoner, leverandører og ønsket leveranse",
    packages: [
      { label: "01 · IT-HJELP", price: "ca. 150 kr", description: "En enkel og avgrenset IT-hjelp for bedrift, etter avtale og tilgjengelig kapasitet.", includes: ["Inntil avtalt hjelp per sak", "Feilsøking og veiledning", "PC, mobil eller nett", "Kort oppsummering etterpå"] },
      { label: "02 · DIGITALT PRODUKT", price: "ca. 12 500–47 500 kr", description: "For mindre digitale løsninger, oppdateringer og første versjon av et produkt.", includes: ["Behovsmøte og plan", "Design og utvikling", "Testing og publisering", "Dokumentert overlevering"], featured: true },
      { label: "03 · FULLSKALA APP", price: "fra ca. 47 500 kr", description: "For webapper, mobilapper, desktop-applikasjoner og systemer med backend.", includes: ["Arkitektur og datamodell", "Roller og innlogging", "API, database og integrasjoner", "Pilot og videre driftsplan"] }
    ],
    examples: [
      { price: "ca. 299 kr", description: "Kun IT-hjelp til bedrift, for eksempel oppsett, feilsøking eller trygg veiledning." },
      { price: "ca. 15 000–35 000 kr", description: "Nettside som lages eller en eksisterende nettside som oppdateres og klargjøres for hosting." },
      { price: "ca. 1 500–4 500 kr/år", description: "Domene og grunnleggende domeneadministrasjon. Leverandørpris og valgt endelse kan variere." },
      { price: "ca. 150 000–450 000 kr", description: "Mobilapp for iOS og Android med felles kodebase, innlogging og backend." },
      { price: "ca. 120 000–400 000 kr", description: "Applikasjon for Windows, Linux eller macOS, avhengig av funksjoner og distribusjon." },
      { price: "ca. 25 000–100 000 kr", description: "Nettbutikk eller mindre webapp med betaling, skjemaer, database eller integrasjoner." }
    ],
    runningPrice: "Fra ca. 150 kr/mnd",
    runningText: "Løpende drift kan omfatte hosting, oppdateringer, backup, overvåking og support. Domene, skytjenester, app-butikkgebyrer, betalte API-er og andre leverandørkostnader kommer normalt i tillegg.",
    sources: [
      { name: "Apple Developer", href: "https://developer.apple.com/programs/" },
      { name: "Google Play Console", href: "https://support.google.com/googleplay/android-developer/answer/6112435" },
      { name: "Vercel pricing", href: "https://vercel.com/pricing" }
    ]
  },
  clothing: {
    subject: "profilprodukt",
    factors: "plagg, trykk eller broderi, antall, størrelser, logo, levering og valgt produksjonspartner",
    packages: [
      { label: "01 · TESTDROP", price: "ca. 150–500 kr", description: "En liten test med noen få plagg og enkel logo for å kvalitetssikre uttrykket.", includes: ["5 plagg", "En logo/trykkflate", "Enkel korrektur", "Pris avklares før produksjon"] },
      { label: "02 · BEDRIFTSTART", price: "ca. 750–1 750 kr", description: "En liten profilpakke for team, arrangement eller oppstart.", includes: ["10 plagg", "Produkt- og størrelsesforslag", "Logo og plassering", "Korrektur før produksjon"], featured: true },
      { label: "03 · TEAMPAKKE", price: "ca. 3 000–7 000 kr", description: "Profilklær for et større team eller en kampanje.", includes: ["50 plagg", "Flere størrelser", "Trykk eller broderi etter behov", "Samlet leveranse"] },
      { label: "04 · KOLLEKSJON", price: "ca. 6 000–15 000 kr", description: "En mer gjennomført kolleksjon for bedrift, artist eller merkevare.", includes: ["100 plagg", "Flere produkter eller farger", "Produktvisualisering", "Produksjonsunderlag"] },
      { label: "05 · STØRRE OPPLAG", price: "Fra ca. 25 000 kr", description: "For 500 plagg eller mer. Kontakt oss for konkret tilbud.", includes: ["500+ plagg", "Volumvurdering", "Leveringsplan", "Individuelt tilbud"] }
    ],
    examples: [
      { price: "ca. 299–999 kr", description: "5 plagg med enkel logo og valgt plassering." },
      { price: "ca. 1 500–3 500 kr", description: "10 plagg til et lite team eller arrangement." },
      { price: "ca. 6 000–14 000 kr", description: "50 plagg med størrelsesfordeling og korrektur." },
      { price: "ca. 12 000–30 000 kr", description: "100 plagg som liten kolleksjon eller kampanje." },
      { price: "Fra ca. 50 000 kr", description: "500 plagg eller mer — kontakt oss for volumpris." }
    ],
    runningPrice: "Fra ca. 150 kr/mnd",
    runningText: "Kan omfatte produktoppdateringer, ny korrektur, nettbutikk eller løpende bestillingshjelp. Produksjon, frakt og leverandørkostnader avtales separat.",
    sources: [
      { name: "Vedøy Collective", href: "/tjenester/profilprodukter" },
      { name: "Printify", href: "https://printify.com/custom-clothing/" }
    ]
  }
};

const subscriptions = [
  { name: "IT-hjelp", price: "150 kr/mnd", description: "For bedrifter som først og fremst trenger trygg hjelp når noe stopper opp.", features: ["2 timer inkludert per måned", "Oppmøte etter behov", "Telefon eller Teams når mulig", "Ekstra 30 min: 100 kr", "Tid rundes opp til nærmeste halve time"] },
  { name: "IT + drift", price: "450 kr/mnd", description: "For bedrifter som vil ha både hjelp og en nettside som holdes i orden.", features: ["6 timer IT-hjelp inkludert", "Oppmøte, telefon eller Teams", "Ekstra 30 min: 80 kr", "Nettsidehosting og drift", "2 innholdsoppdateringer per måned", "Vedøy-feil på Vedøy-laget side rettes uten ekstra kostnad"] , featured: true},
  { name: "Vedøy Growth", price: "750 kr/mnd", description: "En samlet bedriftsplattform for drift, kunder, oppgaver og videre vekst.", features: ["6 timer IT-hjelp inkludert", "Ekstra time: 50 kr", "Nettsidehosting", "3 oppdateringer per måned", "Vedøy Growth med CRM, booking og notater", "Fordeler på nye Vedøy-prosjekter"] },
  { name: "Growth Pro", price: "Fra 1 250 kr/mnd", description: "For team som trenger mer kapasitet, flere brukere og tettere oppfølging.", features: ["10 timer IT-hjelp inkludert", "Flere ansatte og roller", "Prioritert support", "Vedøy Growth og Canvas", "Nettside, app eller butikk kan videreutvikles", "Egen plan etter møte"] }
];

export function ServicePricing({ type }: { type: PricingType }) {
  const config = pricing[type];
  return <section className="website-pricing" id="priser">
    <div className="website-pricing__heading"><div><p className="editorial-kicker lime">VEILEDENDE PRISER · 2026</p><h2>Et ærlig<br /><em>startpunkt.</em></h2></div><div><strong>Dette er priseksempler – ikke et bindende tilbud.</strong><p>En {config.subject} kan være liten eller svært omfattende. Endelig pris kan derfor ikke loves før vi kjenner {config.factors}.</p></div></div>
    <div className="website-pricing__cards">{config.packages.map((item) => <article className={item.featured ? "is-featured" : undefined} key={item.label}>{item.featured ? <span>MEST AKTUELL</span> : null}<small>{item.label}</small><h3>{item.price}</h3><p>{item.description}</p><ul>{item.includes.map((included) => <li key={included}>{included}</li>)}</ul></article>)}</div>
    <div className="website-pricing__examples"><div><p className="editorial-kicker">EKSEMPLER</p><h3>Hva kan prosjektet bli?</h3></div><div>{config.examples.map((item) => <article key={item.price + item.description}><strong>{item.price}</strong><p>{item.description}</p></article>)}</div></div>
    <div className="website-pricing__running"><div><small>DRIFT OG VIDEREUTVIKLING</small><strong>{config.runningPrice}</strong></div><p>{config.runningText}</p></div>
    <div className="website-pricing__notice"><strong>Viktig om ca-prisene</strong><p>Alle beløp er veiledende ca-priser, oppgitt ekskl. eventuell MVA. De kan bli både lavere og høyere etter møtet, når vi kjenner behov, omfang og leverandørkostnader. Etter møtet blir vi enige om en konkret pris og du får et spesifisert tilbud før arbeidet blir bindende.</p><p className="website-pricing__sources">Prisene er eksempler basert på Vedøy-vurderinger og relevante leverandørkostnader: {config.sources.map((source, index) => <span key={source.href}>{index ? ", " : ""}<a href={source.href} target="_blank" rel="noreferrer">{source.name}</a></span>)}.</p></div>
    <Link href="/#kontakt" className="editorial-button">Be om konkret pris <span>↗</span></Link>
    <section className="business-subscriptions"><div className="business-subscriptions__heading"><div><p className="editorial-kicker lime">BEDRIFTSABONNEMENTER</p><h2>Én avtale.<br /><em>Mer ro.</em></h2></div><p>Abonnementene går igjen på tvers av nettsider, webapper, nettbutikker, profilprodukter og andre Vedøy-tjenester. Vi tilpasser innholdet etter virksomheten etter et møte.</p></div><div className="business-subscriptions__grid">{subscriptions.map((plan) => <article className={plan.featured ? "is-featured" : undefined} key={plan.name}><small>{plan.featured ? "ANBEFALT" : "VEDØY BEDRIFT"}</small><h3>{plan.name}</h3><strong>{plan.price}</strong><p>{plan.description}</p><ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></article>)}</div><div className="business-subscriptions__upgrade"><strong>Har dere allerede en løsning?</strong><p>Vi kan oppgradere eller overta nettsider, apper, nettbutikker, hosting, drift og integrasjoner dere allerede bruker. Vi starter med en gjennomgang og foreslår bare det som gir verdi.</p><Link href="/#kontakt" className="editorial-button">Be om gjennomgang <span>↗</span></Link></div></section>
  </section>;
}
