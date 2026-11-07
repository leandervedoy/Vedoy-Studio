/** Curated, source-controlled employee learning content.
 * Never insert user-authored JavaScript or unsafe HTML into these blocks.
 */
export type StaffArea = "studio" | "link" | "pbx";
export type StaffTool = "studio-profit" | "link-economics" | "pbx-economics" | "pbx-routing";

export type StaffArticle = {
  slug: string;
  area: StaffArea;
  title: string;
  intro: string;
  category: string;
  minutes: number;
  updated: string;
  badge: string;
  sections: ReadonlyArray<{
    id: string;
    title: string;
    paragraphs: readonly string[];
    bullets?: readonly string[];
  }>;
  tool?: StaffTool;
  checklist: readonly string[];
  quiz: { question: string; answers: readonly string[]; correct: number; explanation: string };
  sources?: ReadonlyArray<{ label: string; href: string }>;
};

export const STAFF_AREAS: Readonly<Record<StaffArea, {
  name: string; short: string; kicker: string; title: string; subtitle: string;
  emoji: string; accent: string; focus: readonly string[];
}>> = {
  studio: {
    name: "Vedoy Studio", short: "Studio", kicker: "TEKNOLOGI · SALG · LEVERANSE",
    title: "Fra idé til lønnsom leveranse.",
    subtitle: "Produktkunnskap, salg, 3D-løsninger og gjennomføring for Vedoy Studio-teamet.",
    emoji: "◈", accent: "lime", focus: ["3D-produkter", "Leveranser", "Økonomi"]
  },
  link: {
    name: "Vedoy Link", short: "Link", kicker: "NUMRE · MELDINGER · PERSONVERN",
    title: "Kommunikasjon som bare virker.",
    subtitle: "Lær provisjonering av numre, marginberegning, onboarding og sikker kommunikasjon.",
    emoji: "↗", accent: "cyan", focus: ["Nummerøkonomi", "Onboarding", "Personvern"]
  },
  pbx: {
    name: "Vedoy PBX", short: "PBX", kicker: "SENTRALBORD · IVR · DRIFT",
    title: "Telefonisystemet bak bedriften.",
    subtitle: "Praktiske arbeidsflyter for bedriftssentralbord, køer, omdirigering og kundeservice.",
    emoji: "⌘", accent: "violet", focus: ["Samtaleflyt", "Kapasitet", "Pålitelighet"]
  }
};

export const STAFF_ARTICLES: readonly StaffArticle[] = [
  {
    slug: "3d-profit-playbook", area: "studio", title: "Selg resultatet: 3D som lønnsom tjeneste",
    intro: "En interaktiv intern salgsartikkel med kostnadsmodell, tilbudslogikk og klare stoppregler.",
    category: "Forretningsutvikling", minutes: 9, updated: "2026-11-07", badge: "INTERAKTIV MODELL",
    sections: [
      { id: "retning", title: "01 / Selg effekten – ikke motoren", paragraphs: [
        "En kunde kjøper sjelden Three.js eller en kompilator. Kunden betaler for en bedre produktpresentasjon, færre manuelle oppgaver eller en opplevelse som gjør det lettere å velge riktig vare.",
        "Start med én tydelig tjeneste: interaktiv 3D-produktvisning eller konfigurator med kundens egne, lisensierte 3D-modeller. Tilbud på avansert modellering, spesialeffekter og integrasjoner gis separat."
      ], bullets: ["Finn ett konkret brukerproblem.", "Vis en mobilvennlig demo, ikke bare kildekode.", "Avklar hvem som eier og leverer modellfiler."] },
      { id: "pris", title: "02 / Pris etter leveransen", paragraphs: [
        "En testpris kan være 12 900 kr for oppsett og 790 kr per måned for avtalt drift. Dette er en beslutningshypotese, ikke et publisert pristilbud eller dokumentert betalingsvilje.",
        "En standardleveranse må ha fast omfang, tydelige revisjoner, skriftlig godkjenning og avtalt support. Prisen må endres når faktisk tidsbruk er kjent."
      ] },
      { id: "mal", title: "03 / Simuler før du sender tilbud", paragraphs: [
        "Juster antall nye installasjoner og aktive kunder under. Verktøyet trekker fra direktekostnader, faste kostnader og en antatt økonomisk verdi på 350 kr for hver arbeidstime.",
        "Kalkulatoren er en intern planmodell. Den inkluderer ikke skatt, salgstid, all risiko eller ekstra modellproduksjon."
      ] }
    ],
    tool: "studio-profit",
    checklist: ["Kontrollert kundens faktiske problem og mål.", "Fått lovlig tilgang til 3D-modeller og materiale.", "Avklart fast scope, revisjoner og supportnivå.", "Estimert reell arbeidstid og direktekostnader.", "Sikret skriftlig godkjenning før produksjonsstart."],
    quiz: { question: "Hva bør Vedoy Studio primært prise i et standard 3D-oppdrag?", answers: ["Antall JavaScript-filer", "Kundeverdi og tydelig definert leveranse", "Hvor mange shaders motoren bruker"], correct: 1, explanation: "Et standardisert resultat med avgrenset omfang er enklere å selge og levere lønnsomt." },
    sources: [{ label: "Unity Bridge – utviklingsstatus (PR #29)", href: "https://github.com/leandervedoy/Vedoy-Studio/pull/29" }]
  },
  {
    slug: "unity-web-handoff", area: "studio", title: "Fra Unity-prosjekt til nettleser: trygg leveranse",
    intro: "Interaktiv kontrolliste for import, C#-kompatibilitet, ytelse og publisering av WebGL-spill.",
    category: "Utvikling", minutes: 7, updated: "2026-11-07", badge: "LEVERANSEGUIDE",
    sections: [
      { id: "spor", title: "01 / Velg riktig byggevei", paragraphs: [
        "Vedoy Unity Bridge har to prinsipielt forskjellige spor. Unity Web Build kjører spillet med Unitys kjøremiljø og er den tryggeste veien for C#-logikk som Unity støtter på web.",
        "Vedoy Web 3D Engine bruker Three.js. Den kan lese deler av scener og objekter, men kan ikke kjøre generelle C#-skript eller hele Unity-API-et direkte."
      ] },
      { id: "bindinger", title: "02 / Behold koblinger mellom filer", paragraphs: [
        "Importer Assets, scener, prefabs og tilhørende .meta-filer sammen. Unitys fileID- og GUID-referanser brukes for å bevare sammenhengen mellom objekter og skript.",
        "Ved eksport til GLB bør stabil objekt-ID følge med i metadata. Manglende komponenter skal rapporteres som advarsler – ikke skjules bak et falskt grønt godkjenningsstempel."
      ] },
      { id: "kvalitet", title: "03 / Test før kunden får lenken", paragraphs: [
        "Kjør ekte Unity 6 Web Build, test på mobil, kontroller teksturer, materialer, input og feil i nettleserkonsollen.",
        "Kjør aldri ubetrodde Unity Editor-skript i samme miljø som kundenes data eller Vedøys produksjonsnøkler. Bruk isolert byggearbeider med kvoter."
      ] }
    ],
    checklist: ["Prosjektets Unity-versjon og pakker er dokumentert.", ".meta-filer, GUID-er og prefab-koblinger følger med.", "Eventuelle C#-begrensninger er oppført i en rapport.", "Unity Web Build er kjørt og verifisert i nettleseren.", "Minst én mobiltest, ytelsestest og rollback-test er utført."],
    quiz: { question: "Kan et vilkårlig Unity C#-skript kjøres direkte i Three.js?", answers: ["Ja, alltid", "Bare når filen heter .cs", "Nei, det krever porter eller Unity Web-kjøremiljø"], correct: 2, explanation: "Three.js er en 3D-renderer, ikke en erstatning for Unitys C#-kjøremiljø." },
    sources: [{ label: "Unity Bridge – teknisk prototype", href: "https://github.com/leandervedoy/Vedoy-Studio/pull/29" }]
  },
  {
    slug: "phone-number-economics", area: "link", title: "Hva tjener vi på ett ekstra telefonnummer?",
    intro: "Interaktiv marginmodell for abonnementer, nummerkostnader, SMS, minutter og kundestøtte.",
    category: "Prising", minutes: 8, updated: "2026-11-07", badge: "INTERAKTIV MODELL",
    sections: [
      { id: "verdi", title: "01 / Hva kjøper kunden?", paragraphs: [
        "Vedoy Link kan tilby et ekstra nummer, samtalefunksjon og SMS gjennom en mobil- eller nettapp. Før salg må man avklare hva operatøren faktisk støtter i landet, hvilke numre som er tilgjengelige og hvilke tjenester som krever godkjenning.",
        "Det mest lønnsomme produktet er ikke nødvendigvis det billigste nummeret. Pris etter forventet bruksvolum, behov for support og klare begrensninger."
      ] },
      { id: "kostnad", title: "02 / Hvilke kostnader må med?", paragraphs: [
        "Nummerleie, samtaler, SMS, avgifter, betaling, portering og kundestøtte har ulike kostnadsdrivere. SMS og samtaler til utlandet kan ha helt andre priser enn norske standardeksempler.",
        "Tallet i kalkulatoren er fiktive testforutsetninger, ikke et pristilbud fra Twilio, Telnyx eller en annen operatør."
      ] },
      { id: "scenario", title: "03 / Modellér marginen", paragraphs: [
        "Juster antall kunder, månedspris og bruksnivå. Husk at lavt fakturabeløp ikke nødvendigvis betyr høy profitt dersom hver kunde krever mye support.",
        "Vedoy Link må skille mellom inntekt fra abonnement og volumavhengig viderefakturering, og være tydelig på at vanlig SMS ikke automatisk gir ende-til-ende-kryptering."
      ] }
    ],
    tool: "link-economics",
    checklist: ["Verifisert numertilgjengelighet og geografiske krav.", "Kontrollert operatørens pris per nummer/minutt/SMS.", "Avklart nødtjenester, nummerportering og begrensninger.", "Skrevet tydelige vilkår for SMS og personvern.", "Testet innkommende/utgående samtale og fakturering i sandbox."],
    quiz: { question: "Hva er den største feilen i en abonnementsmargin?", answers: ["Å telle med faktisk supporttid", "Å glemme brukskostnader og support", "Å skille abonnementspris fra oppstartspris"], correct: 1, explanation: "Reell margin inkluderer operatørkostnader, variable volumkostnader og tidsforbruk." }
  },
  {
    slug: "link-onboarding-security", area: "link", title: "Aktiver nummer uten å love for mye",
    intro: "Ansattguide for ID, nummeraktivering, personvern, leveringsstatus og kunder som trenger hjelp.",
    category: "Sikkerhet og drift", minutes: 6, updated: "2026-11-07", badge: "KUNNSKAPSTEST",
    sections: [
      { id: "først", title: "01 / Bekreft identitet og tilgjengelighet", paragraphs: [
        "Før aktivering skal systemet sjekke om ønsket nummer kan tildeles til kunden i relevant land og til relevant bruk. KYC, adresse- og identitetskrav varierer med nummerkategori og leverandør.",
        "Et sandbox-nummer som vises i appen, er ikke dokumentasjon på at det kan selges som et ekte, aktivt nummer."
      ] },
      { id: "sms", title: "02 / Vær presis om kryptering", paragraphs: [
        "TLS beskytter transporten mellom app og tjeneste, men klassisk SMS passerer ofte via flere nettverksledd og er ikke ende-til-ende-kryptert.",
        "Et eget sikkert meldingslag kan bare gi ende-til-ende-kryptering når avsender og mottaker faktisk bruker en kompatibel løsning. Ikke beskriv standard-SMS som ende-til-ende-kryptert."
      ] },
      { id: "support", title: "03 / Kunden skal vite hvor henvendelsen er", paragraphs: [
        "Registrer bestilling, reservering, identitetskontroll, aktivering og eventuell feil som separate statussteg. Gi konkrete feilmeldinger uten å vise persondata eller API-hemmeligheter.",
        "Fjern unødvendige personopplysninger fra logger og testdata. Hendelser må ha sporbar referanse slik at support kan finne saken uten å se innhold i kommunikasjon."
      ] }
    ],
    checklist: ["Nummerets land og type samsvarer med brukstilfellet.", "KYC-/adressekrav er undersøkt.", "Kundens nummer- og SMS-begrensninger er dokumentert.", "Samtaler og SMS er testet separat fra hverandre.", "Support og feilhåndtering har tydelig eier."],
    quiz: { question: "Er vanlig SMS automatisk ende-til-ende-kryptert fordi appen bruker HTTPS?", answers: ["Ja", "Nei", "Bare på iPhone"], correct: 1, explanation: "HTTPS beskytter transporten til API-et, ikke alle ledd i SMS-nettverket." }
  },
  {
    slug: "pbx-capacity-and-pricing", area: "pbx", title: "Bygg lønnsomme bedriftssentralbord",
    intro: "Interaktiv økonomimodell for virksomheter, ansatte, samtaleforbruk og støttebehov.",
    category: "Prising", minutes: 8, updated: "2026-11-07", badge: "INTERAKTIV MODELL",
    sections: [
      { id: "omfang", title: "01 / Hva inngår i en PBX-leveranse?", paragraphs: [
        "Et bedriftssentralbord kan inneholde ett hovednummer, åpningstider, internnumre, IVR, kø, ringegrupper og omdirigering. Hvilke funksjoner som fungerer, avhenger av telefonioperatør og valgt programvare.",
        "Bygg først én standardpakke med få innstillinger. Spesialintegrasjoner, opptak og avansert rapportering prises separat."
      ] },
      { id: "modell", title: "02 / Pris etter virksomhet og bruk", paragraphs: [
        "Én modell er fast månedlig bedriftspris pluss pris per aktiv bruker. Ta høyde for samtaleminutter, telefonnumre, støtte og oppsettarbeid.",
        "Eksempelet nedenfor bruker fiktive arbeids- og operatørkostnader, ikke verifiserte leverandørpriser. Overskuddet er økonomisk bidrag etter verdsatt arbeidstid."
      ] },
      { id: "skalering", title: "03 / Når bør du skalere?", paragraphs: [
        "Ikke øk salget før automatisk oppsett, riktig ruting, sikker tilgang og fakturering fungerer uten manuelle inngrep for hver kunde.",
        "Mål feilrate, antall supporttimer per kunde og hvor stor andel av inntektene som går til telefonioperatører."
      ] }
    ],
    tool: "pbx-economics",
    checklist: ["Leveransepakke og antall brukere er dokumentert.", "Pris for nummer, minutter og oppsett er verifisert.", "Kø, overføring, åpningstider og failover er testet.", "Kundens rollebaserte tilgang er kontrollert.", "Avtale om opptak, lagring og personvern er vurdert."],
    quiz: { question: "Hva bør måles før PBX skaleres til flere kunder?", answers: ["Bare antall nye funksjoner", "Antall CSS-komponenter", "Supporttimer, rutingsikkerhet og kundemargin"], correct: 2, explanation: "Driftskostnad og pålitelighet avgjør om abonnementsmodellen faktisk kan skaleres." }
  },
  {
    slug: "pbx-call-routing-lab", area: "pbx", title: "Simuler samtaleflyt: IVR, kø og failover",
    intro: "Prøv en interaktiv sentralbordflyt før du endrer noe i produksjon.",
    category: "Drift", minutes: 7, updated: "2026-11-07", badge: "INTERAKTIV LAB",
    sections: [
      { id: "routing", title: "01 / Hver samtale trenger en tydelig rute", paragraphs: [
        "En innkommende samtale treffer et hovednummer. Systemet sjekker åpningstid, spiller eventuelt en meny, finner riktig kø eller ringegruppe og bruker en fallback når ingen svarer.",
        "Simulatoren nedenfor er en pedagogisk modell, ikke koblet til ekte telefonnumre eller en PBX-instans."
      ] },
      { id: "feil", title: "02 / Planlegg for at noe kan feile", paragraphs: [
        "Hva skjer hvis det er utenfor åpningstid? Hva skjer hvis alle ansatte er opptatt? Hva hvis SIP-tilkoblingen faller ut? Lag en dokumentert plan for hver av disse situasjonene.",
        "Nødanrop, lovpålagte regler og eventuelle samtaleopptak må håndteres av godkjent leverandør og riktig konfigurasjon."
      ] },
      { id: "teste", title: "03 / Test før du aktiverer", paragraphs: [
        "Test oppringing fra eksternt nummer, valg i tastemeny, ventetid, timeout, voicemail og viderekobling. Kontroller også at bedriftsadministratoren bare kan styre egne numre.",
        "Legg gjerne ved testjournal med dato, scenario, forventet resultat og faktisk resultat."
      ] }
    ],
    tool: "pbx-routing",
    checklist: ["Åpningstider og tidssone er kontrollert.", "Alle menyvalg har gyldig mottaker.", "Opptatt- og ubesvartregler er testet.", "Voicemail og failover er kontrollert med ekte testanrop.", "Kundens roller og rettigheter er gjennomgått."],
    quiz: { question: "Hva skjer normalt med en samtale som kommer utenfor åpningstid?", answers: ["Den skal følge en definert utenom-åpningstid-rute", "Den bør slettes fra loggen", "Den skal alltid ringe alle ansatte"], correct: 0, explanation: "En forutsigbar fallback kan peke til beskjed, telefonsvarer eller vakttelefon." }
  }
];

export function isStaffArea(value: string): value is StaffArea {
  return value === "studio" || value === "link" || value === "pbx";
}
export function getStaffArticles(area?: StaffArea): readonly StaffArticle[] {
  return area ? STAFF_ARTICLES.filter((article) => article.area === area) : STAFF_ARTICLES;
}
export function getStaffArticle(area: StaffArea, slug: string): StaffArticle | undefined {
  return STAFF_ARTICLES.find((article) => article.area === area && article.slug === slug);
}
