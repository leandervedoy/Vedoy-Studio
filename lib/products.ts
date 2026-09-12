import type { StudioProduct } from "@/lib/types";

export const studioProducts: StudioProduct[] = [
  {
    id: "domains",
    name: "Vedøy Domains",
    description: "Søk, kjøp og administrer domener med tydelige priser og personlig hjelp.",
    icon: "◎",
    href: "/studio/domains",
    group: "Bygg",
    status: "beta",
    accent: "#dfb934",
    highlights: ["Domenesøk", "DNS-oversikt", "Automatisk fornyelse"]
  },
  {
    id: "hosting",
    name: "Vedøy Hosting",
    description: "Deploy nettsider og API-er, følg status og administrer miljøvariabler.",
    icon: "△",
    href: "/tjenester/hosting-og-domene#konfigurer-hosting",
    group: "Bygg",
    status: "live",
    accent: "#171714",
    highlights: ["Next.js", "API-hosting", "Deploy-logg"]
  },
  {
    id: "builder",
    name: "Vedøy Builder",
    description: "Start fra ferdige, rolige maler og bygg en profesjonell nettside raskere.",
    icon: "▦",
    href: "/projects/builder",
    group: "Bygg",
    status: "planned",
    accent: "#8b5cf6",
    highlights: ["Seksjoner", "Tema", "Publisering"]
  },
  {
    id: "commerce",
    name: "Vedøy Ecommerce",
    description: "Payhip eller Shopify valgt etter pris, produkter og hvordan kunden faktisk skal selge.",
    icon: "⌘",
    href: "/tjenester/ecommerce#velg-handelsplattform",
    group: "Bygg",
    status: "demo",
    accent: "#26a269",
    highlights: ["Payhip", "Shopify", "Integrasjoner"]
  },
  {
    id: "booking",
    name: "Vedøy Booking",
    description: "Booking med tjenester, ansatte, lokasjoner, åpningstider og kapasitet – koblet til Vedøy Calendar.",
    icon: "□",
    href: "/studio/booking",
    group: "Drift",
    status: "beta",
    accent: "#2563eb",
    highlights: ["Ansatte og lokasjon", "Kalender og påminnelser", "Kapasitet og venteliste"]
  },
  {
    id: "growth",
    name: "Vedøy Growth",
    description: "Bedriftsplattformen som samler kunder, booking, notater, timer og videre drift.",
    icon: "✦",
    href: "/studio",
    group: "Drift",
    status: "beta",
    accent: "#14b86a",
    highlights: ["CRM og kunder", "Booking og timer", "Notater og oppfølging"]
  },
  {
    id: "canvas",
    name: "Vedøy Canvas",
    description: "Et samlet arbeidsrom for bedriftsnotater, prosjekter, møter, oppgaver og kunnskap.",
    icon: "▤",
    href: "https://vedoy-canvas.vercel.app/",
    group: "Drift",
    status: "beta",
    accent: "#16835d",
    highlights: ["Arbeidsrom", "Oppgaver og sider", "Deling og historikk"]
  },
  {
    id: "calendar",
    name: "Vedøy Calendar",
    description: "Samlet kalender for booking, timeregistrering og samordning av Google-, Microsoft- og e-postkalendere.",
    icon: "◷",
    href: "/projects/calendar",
    group: "Drift",
    status: "beta",
    accent: "#0f766e",
    highlights: ["Booking og timer", "Google / Microsoft", "Konfliktkontroll"]
  },
  {
    id: "email",
    name: "Vedøy E-post",
    description: "Profesjonell e-post, maler, varsler og en enkel felles innboks.",
    icon: "✉",
    href: "https://mail.vedoystudio.no",
    group: "Drift",
    status: "planned",
    accent: "#0891b2",
    highlights: ["Domene-e-post", "Maler", "Teaminnboks"]
  },
  {
    id: "crm",
    name: "Vedøy CRM",
    description: "Kunder, henvendelser, historikk og oppfølging samlet uten tungt fagspråk.",
    icon: "◉",
    href: "/studio/customers",
    group: "Drift",
    status: "beta",
    accent: "#16a34a",
    highlights: ["Kundekort", "Notater", "Oppfølging"]
  },
  {
    id: "statistics",
    name: "Vedøy Statistics",
    description: "Forstå trafikk, salg, booking og drift i ett oversiktlig dashboard.",
    icon: "↗",
    href: "/studio/analytics",
    group: "Voks",
    status: "beta",
    accent: "#ea580c",
    highlights: ["Trafikk", "Konvertering", "Rapporter"]
  },
  {
    id: "vedi",
    name: "Vedi AI",
    description: "En trygg KI-assistent som forklarer data og foreslår neste praktiske steg.",
    icon: "✦",
    href: "/studio/vedi",
    group: "Voks",
    status: "beta",
    accent: "#7c3aed",
    highlights: ["Oppsummering", "Idéer", "Kundehjelp"]
  },
  {
    id: "academy",
    name: "Vedøy Academy",
    description: "Korte kurs om nettsider, sikkerhet, markedsføring og digitale verktøy.",
    icon: "◇",
    href: "/studio/academy",
    group: "Voks",
    status: "beta",
    accent: "#be123c",
    highlights: ["Mikrokurs", "Fremdrift", "Sjekklister"]
  },
  {
    id: "omnicart-tycoon",
    name: "Omnicart Tycoon",
    description: "E-commerce simulator for å lære salg, lager, ordre og vekst gjennom en interaktiv butikk.",
    icon: "✹",
    href: "https://vedoy-eccomerce-game.vercel.app/",
    group: "Voks",
    status: "beta",
    accent: "#6366f1",
    highlights: ["Butikkstrategi", "Lager og ordre", "Simulator"]
  },
  {
    id: "api",
    name: "Vedøy API",
    description: "API-nøkler, webhooks og gjenbrukbare tjenester for egne apper og nettsider.",
    icon: "{}",
    href: "/studio/apis",
    group: "Utvikle",
    status: "beta",
    accent: "#334155",
    highlights: ["API-nøkler", "Webhooks", "SDK"]
  },
  {
    id: "database",
    name: "Vedøy Database",
    description: "Databaser og tabeller med tydelige statusindikatorer og sikre tilkoblinger.",
    icon: "◫",
    href: "/studio/databases",
    group: "Utvikle",
    status: "planned",
    accent: "#0f766e",
    highlights: ["PostgreSQL", "Backups", "Tilkoblinger"]
  },
  {
    id: "monitoring",
    name: "Vedøy Monitor",
    description: "Overvåk nettsider, API-er, domener og SSL før kundene merker problemer.",
    icon: "⌁",
    href: "/studio/monitoring",
    group: "Utvikle",
    status: "beta",
    accent: "#65a30d",
    highlights: ["Oppetid", "SSL", "Varsler"]
  },
  {
    id: "support",
    name: "Vedøy Assist",
    description: "Personlig IT-hjelp og oppfølging når en automatisert løsning ikke er nok.",
    icon: "☺",
    href: "/studio/support",
    group: "Drift",
    status: "live",
    accent: "#0369a1",
    highlights: ["Menneskelig hjelp", "Fjernhjelp", "Bedriftsavtaler"]
  },
  {
    id: "avvik",
    name: "Vedøy Avvik",
    description: "Planlagt avvikssystem for å registrere, følge opp og dokumentere saker på ett sted.",
    icon: "!",
    href: "/projects/avvik",
    group: "Utvikle",
    status: "planned",
    accent: "#ef4444",
    highlights: ["Avvikslogg", "Ansvar og frister", "Historikk"]
  },
  {
    id: "tillitsvalgt",
    name: "Vedøy Tillitsvalgt",
    description: "Planlagt trygg kanal for å finne riktig kontaktperson, sende henvendelser og følge opp dialog.",
    icon: "◇",
    href: "/projects/tillitsvalgt",
    group: "Utvikle",
    status: "planned",
    accent: "#0ea5e9",
    highlights: ["Kontaktoversikt", "Trygg henvendelse", "Status"]
  },
  {
    id: "developers",
    name: "Vedøy Developers",
    description: "Dokumentasjon, GitHub, Node.js-biblioteker, API-er og ressurser for utviklere.",
    icon: "</>",
    href: "/developers",
    group: "Utvikle",
    status: "beta",
    accent: "#111827",
    highlights: ["Dokumentasjon", "GitHub", "API-er"]
  }
];

export const productGroups = ["Bygg", "Drift", "Voks", "Utvikle"] as const;
