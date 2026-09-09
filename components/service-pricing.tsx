import Link from "next/link";

type PricingType = "website" | "webapp" | "store";

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
      { label: "01 · LITEN START", price: "9 500–19 000 kr", description: "En tydelig landingsside eller liten nettside for en lokal bedrift.", includes: ["1–5 sider", "Responsivt design", "Kontaktskjema", "SEO-grunnoppsett", "Publisering"] },
      { label: "02 · BEDRIFTSNETTSIDE", price: "23 750–57 000 kr", description: "En komplett side som forklarer tjenester og skaper henvendelser.", includes: ["5–10 sider", "Tilpasset design", "Innholdsstruktur", "Skjema eller booking", "Analyse og teknisk SEO"], featured: true },
      { label: "03 · SKREDDERSYDD", price: "Fra 57 000 kr", description: "For bedrifter som trenger CMS, flere språk eller integrasjoner.", includes: ["Skreddersydd designsystem", "CMS og dynamisk innhold", "API-er og integrasjoner", "Avansert SEO", "Utvidet testing"] }
    ],
    examples: [
      { price: "12 000 kr", description: "Én side for håndverker med tjenester, referanser og kontakt." },
      { price: "32 000 kr", description: "Seks sider for lokal bedrift med eget uttrykk, tekststruktur og booking." },
      { price: "75 000 kr", description: "Flerspråklig nettsted med CMS, innholdsmigrering og systemintegrasjon." }
    ],
    runningPrice: "Fra 950 kr/mnd",
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
      { label: "01 · PROTOTYPE", price: "47 500–76 000 kr", description: "En fokusert løsning som avklarer flyt og tester om idéen skaper verdi.", includes: ["Kjerneflyt og prototype", "Responsivt grensesnitt", "Enkel datamodell", "Testmiljø", "Videre utviklingsplan"] },
      { label: "02 · MVP MED BACKEND", price: "Fra 95 000 kr", description: "En første brukbar versjon med ekte data og funksjoner for pilotkunder.", includes: ["Frontend og backend", "Database", "Innlogging og roller", "Adminflate", "Produksjonssetting"], featured: true },
      { label: "03 · SKALERBART SYSTEM", price: "Fra 380 000 kr", description: "For større arbeidsflyter, flere organisasjoner og krevende integrasjoner.", includes: ["Løsningsarkitektur", "Flere roller og virksomheter", "Betaling eller abonnement", "Integrasjoner og hendelser", "Logging og skaleringsplan"] }
    ],
    examples: [
      { price: "65 000 kr", description: "Internt registreringsverktøy med dashboard og enkel database." },
      { price: "120 000 kr", description: "Kundeportal med innlogging, roller, bestillinger og adminflate." },
      { price: "Fra 400 000 kr", description: "SaaS-plattform med abonnement, organisasjoner og flere integrasjoner." }
    ],
    runningPrice: "Fra 1 900 kr/mnd",
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
      { label: "01 · BUTIKKSTART", price: "Fra 95 000 kr", description: "En ryddig nettbutikk med produkter, betaling, frakt og grunnleggende vekstoppsett.", includes: ["Produkt- og kategoristruktur", "Shopify-oppsett", "Betaling og frakt", "Mobil kjøpsreise", "Lansering og opplæring"] },
      { label: "02 · VEKSTBUTIKK", price: "142 500–285 000 kr", description: "For butikker som trenger eget uttrykk, mer innhold og flere salgssystemer.", includes: ["Tilpasset butikkdesign", "Migrering av produkter", "E-post og analyse", "Flere markeder ved behov", "Utvalgte integrasjoner"], featured: true },
      { label: "03 · HEADLESS COMMERCE", price: "Fra 285 000 kr", description: "Skreddersydd handleopplevelse med Shopify som handelsmotor.", includes: ["Next.js-butikkfront", "Shopify Storefront API", "Skreddersydd designsystem", "Avanserte integrasjoner", "Ytelse og skalering"] }
    ],
    examples: [
      { price: "95 000 kr", description: "Mindre Shopify-butikk med opptil 30 produkter og standardintegrasjoner." },
      { price: "175 000 kr", description: "Merkevarebutikk med migrering, eget design, e-postflyt og analyse." },
      { price: "Fra 300 000 kr", description: "Headless nettbutikk med spesialdesign og koblinger mot eksterne systemer." }
    ],
    runningPrice: "Fra 2 850 kr/mnd",
    runningText: "Kan omfatte teknisk drift, mindre endringer, overvåking og support. Shopify-abonnement, betalingsgebyrer, apper, domene og annonsekostnader betales separat.",
    sources: [
      { name: "DinNettside", href: "https://dinnettside.no/fagstoff/nettside-pris" },
      { name: "Innovena", href: "https://www.innovena.no/nettside/" },
      { name: "Shopify", href: "https://www.shopify.com/no/pricing" }
    ]
  }
};

export function ServicePricing({ type }: { type: PricingType }) {
  const config = pricing[type];
  return <section className="website-pricing" id="priser">
    <div className="website-pricing__heading"><div><p className="editorial-kicker lime">VEILEDENDE PRISER · 2026</p><h2>Et ærlig<br /><em>startpunkt.</em></h2></div><div><strong>Dette er priseksempler – ikke et bindende tilbud.</strong><p>En {config.subject} kan være liten eller svært omfattende. Endelig pris kan derfor ikke loves før vi kjenner {config.factors}.</p></div></div>
    <div className="website-pricing__cards">{config.packages.map((item) => <article className={item.featured ? "is-featured" : undefined} key={item.label}>{item.featured ? <span>MEST AKTUELL</span> : null}<small>{item.label}</small><h3>{item.price}</h3><p>{item.description}</p><ul>{item.includes.map((included) => <li key={included}>{included}</li>)}</ul></article>)}</div>
    <div className="website-pricing__examples"><div><p className="editorial-kicker">EKSEMPLER</p><h3>Hva kan prosjektet bli?</h3></div><div>{config.examples.map((item) => <article key={item.price + item.description}><strong>{item.price}</strong><p>{item.description}</p></article>)}</div></div>
    <div className="website-pricing__running"><div><small>DRIFT OG VIDEREUTVIKLING</small><strong>{config.runningPrice}</strong></div><p>{config.runningText}</p></div>
    <div className="website-pricing__notice"><strong>Viktig om prisene</strong><p>Prisene er avrundede Vedøy-eksempler, omtrent 5 % under relevante offentlig publiserte norske markedsnivåer kontrollert 9. september 2026. De er oppgitt ekskl. eventuell MVA og kan bli både lavere og høyere etter behovsavklaring. Du får alltid et spesifisert tilbud før arbeidet blir bindende.</p><p className="website-pricing__sources">Markedsgrunnlag: {config.sources.map((source, index) => <span key={source.href}>{index ? ", " : ""}<a href={source.href} target="_blank" rel="noreferrer">{source.name}</a></span>)}.</p></div>
    <Link href="/#kontakt" className="editorial-button">Be om konkret pris <span>↗</span></Link>
  </section>;
}
