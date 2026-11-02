import type { StudioService } from "./services";

export type ServiceExample = {
  audience: string;
  title: string;
  challenge: string;
  result: string;
  items: string[];
};
export type ServiceStory = {
  slug: string;
  accent: string;
  heroEmphasis: string;
  statement: string;
  preview: "site" | "app" | "commerce" | "infra" | "brand" | "merch" | "print" | "music" | "gallery" | "style" | "phone" | "rewards";
  examples: ServiceExample[];
  faq: { question: string; answer: string }[];
};
export const serviceStories: Record<string, ServiceStory> = {
  "nettsider": {
    "slug": "nettsider",
    "accent": "#c2fa71",
    "heroEmphasis": "som folk forstår.",
    "statement": "Fra første inntrykk til en enkel henvendelse, uten unødvendige klikk.",
    "preview": "site",
    "examples": [
      {
        "audience": "Lokal tjeneste",
        "title": "Frisør med enkel timebestilling",
        "challenge": "Kundene finner priser, men vet ikke hvordan de bestiller.",
        "result": "En mobilside med priser, åpningstider og en tydelig bestillingsknapp.",
        "items": [
          "Tjenester og priser",
          "Bestill time",
          "Finn salongen"
        ]
      },
      {
        "audience": "Håndverker",
        "title": "Rørlegger med tydelig kontakt",
        "challenge": "Henvendelser går tapt når telefonnummer og tjenester er gjemt.",
        "result": "En rask side med tjenesteområder, referansebilder og kontakt.",
        "items": [
          "Dette hjelper vi med",
          "Vårt område",
          "Be om befaring"
        ]
      },
      {
        "audience": "Konsulent",
        "title": "En profesjonell presentasjon",
        "challenge": "Bedriften trenger et tydelig sted å forklare tilbudet sitt.",
        "result": "Et ryddig nettsted som viser prosess, kompetanse og neste steg.",
        "items": [
          "Kompetanse",
          "Slik jobber vi",
          "Ta kontakt"
        ]
      }
    ],
    "faq": [
      {
        "question": "Må jeg ha alt innhold klart?",
        "answer": "Nei. Vi kan starte med en enkel innholdsplan og hjelpe deg å strukturere tekst og bilder."
      },
      {
        "question": "Kan siden utvides senere?",
        "answer": "Ja. Booking, flere sider og integrasjoner kan legges til etter behov og avtalt pris."
      }
    ]
  },
  "webapper": {
    "slug": "webapper",
    "accent": "#88d4ff",
    "heroEmphasis": "som sparer manuelle steg.",
    "statement": "Egne digitale arbeidsflater for oppgaver som i dag skjer i regneark og innbokser.",
    "preview": "app",
    "examples": [
      {
        "audience": "Kundeportal",
        "title": "Kunder følger egne saker",
        "challenge": "Kunden må sende e-post for å få status.",
        "result": "En innlogget oversikt med saker, dokumenter og tydelige neste steg.",
        "items": [
          "Mine saker",
          "Dokumenter",
          "Ny henvendelse"
        ]
      },
      {
        "audience": "Interne prosesser",
        "title": "Oppgaver samlet ett sted",
        "challenge": "Ansatte mister oversikt over hvem som gjør hva.",
        "result": "En arbeidsflate med ansvar, status og oppfølging.",
        "items": [
          "Oppgaver",
          "Ansvarlige",
          "Historikk"
        ]
      },
      {
        "audience": "Bestilling",
        "title": "Enkel administrasjon av forespørsler",
        "challenge": "Bestillinger håndteres manuelt i flere kanaler.",
        "result": "En samlet kø med detaljer og status på hver forespørsel.",
        "items": [
          "Nye forespørsler",
          "Behandles",
          "Fullført"
        ]
      }
    ],
    "faq": [
      {
        "question": "Må vi bygge alt med en gang?",
        "answer": "Nei. Vi starter med én kritisk arbeidsflyt og vurderer neste steg etter en testbar førsteversjon."
      },
      {
        "question": "Kan en webapp kobles til systemene våre?",
        "answer": "Ofte, hvis systemene tilbyr egnede API-er og riktige tilganger. Vi vurderer dette før tilbud."
      }
    ]
  },
  "nettbutikk": {
    "slug": "nettbutikk",
    "accent": "#ffcf8b",
    "heroEmphasis": "som er lett å handle i.",
    "statement": "Fra produkt til trygg betaling med en butikk tilpasset sortimentet.",
    "preview": "commerce",
    "examples": [
      {
        "audience": "Lokal butikk",
        "title": "Butikk med utvalgte produkter",
        "challenge": "Kundene trenger en enkel måte å bestille på.",
        "result": "Produktkategorier, lagerstatus og tydelig utsjekk.",
        "items": [
          "Produkter",
          "Handlekurv",
          "Betaling"
        ]
      },
      {
        "audience": "Klesmerke",
        "title": "Lanser en liten kolleksjon",
        "challenge": "Størrelser og varianter skaper friksjon.",
        "result": "Kolleksjonsside med produktvalg og størrelsesguide.",
        "items": [
          "Kolleksjoner",
          "Størrelser",
          "Kassen"
        ]
      },
      {
        "audience": "Kunstner",
        "title": "Selg trykk og originale verk",
        "challenge": "Verkene må presenteres med riktig informasjon.",
        "result": "En kuratert butikk med opplag, motiver og leveringsvalg.",
        "items": [
          "Galleri",
          "Opplag",
          "Bestill"
        ]
      }
    ],
    "faq": [
      {
        "question": "Må jeg ha stort varelager?",
        "answer": "Nei. Leverandørmodell, små opplag eller bestillingsproduksjon kan vurderes ut fra produktene dine."
      },
      {
        "question": "Hvem håndterer betaling og frakt?",
        "answer": "Det avklares i oppsettet. Vi kan integrere etablerte betalings- og fraktløsninger."
      }
    ]
  },
  "hosting-og-domene": {
    "slug": "hosting-og-domene",
    "accent": "#7de7bc",
    "heroEmphasis": "som bare fungerer.",
    "statement": "Domene, publisering og drift med én teknisk kontakt.",
    "preview": "infra",
    "examples": [
      {
        "audience": "Småbedrift",
        "title": "Flytt en eksisterende nettside",
        "challenge": "Domenet og nettsiden styres av ulike leverandører.",
        "result": "En planlagt flytting med DNS, SSL og kontroll av tilgjengelighet.",
        "items": [
          "Domene og DNS",
          "SSL",
          "Backup"
        ]
      },
      {
        "audience": "Nettside",
        "title": "Drift etter lansering",
        "challenge": "Bedriften vil ha hjelp når noe må endres.",
        "result": "En driftsavtale med avtalt oppfølging og teknisk kontakt.",
        "items": [
          "Publisering",
          "Overvåking",
          "Support"
        ]
      },
      {
        "audience": "Webapp",
        "title": "Hosting for en app",
        "challenge": "Prosjektet trenger API, database og riktig oppsett.",
        "result": "Tilpasset hosting med miljøer og nødvendig sikkerhetskontroll.",
        "items": [
          "App og API",
          "Database",
          "Miljøer"
        ]
      }
    ],
    "faq": [
      {
        "question": "Eier jeg domenet mitt?",
        "answer": "Ja, eierskap og leverandørvalg avtales tydelig før registrering eller flytting."
      },
      {
        "question": "Inkluderer hosting endringer på nettsiden?",
        "answer": "Bare det som er definert i driftsavtalen. Nye funksjoner prises separat."
      }
    ]
  },
  "design-og-profil": {
    "slug": "design-og-profil",
    "accent": "#c7b1ff",
    "heroEmphasis": "du blir husket for.",
    "statement": "Et visuelt uttrykk som fungerer fra visittkort til app.",
    "preview": "brand",
    "examples": [
      {
        "audience": "Ny bedrift",
        "title": "Identitet for en liten kafé",
        "challenge": "Kaféen mangler et samlende visuelt språk.",
        "result": "Logoanvendelse, fargepalett og maler til meny og sosiale medier.",
        "items": [
          "Farger",
          "Typografi",
          "Malverk"
        ]
      },
      {
        "audience": "Konsulent",
        "title": "Profesjonell bedriftsprofil",
        "challenge": "Dokumenter og nettside ser forskjellige ut.",
        "result": "Et konsekvent uttrykk på presentasjon, nettside og tilbud.",
        "items": [
          "Profil",
          "Presentasjon",
          "Nettside"
        ]
      },
      {
        "audience": "Digitalt produkt",
        "title": "Design av en app",
        "challenge": "Knappene og skjermene oppleves ujevne.",
        "result": "Komponenter og skjermmaler med en tydelig visuell retning.",
        "items": [
          "Komponenter",
          "Mobil",
          "Tilgjengelighet"
        ]
      }
    ],
    "faq": [
      {
        "question": "Kan vi bruke eksisterende logo?",
        "answer": "Ja. Oppdraget kan handle om å gjøre eksisterende identitet mer konsekvent."
      },
      {
        "question": "Hva får jeg levert?",
        "answer": "Det avtales på forhånd, for eksempel logoformater, designfiler, farger og en kort profilguide."
      }
    ]
  },
  "profilprodukter": {
    "slug": "profilprodukter",
    "accent": "#ffba9c",
    "heroEmphasis": "som teamet vil bruke.",
    "statement": "Klær og tilbehør med egen profil, fra idé til bestillingsgrunnlag.",
    "preview": "merch",
    "examples": [
      {
        "audience": "Arbeidsteam",
        "title": "Arbeidsklær med logo",
        "challenge": "Ansatte trenger et samlet og praktisk uttrykk.",
        "result": "Et oversiktlig utvalg plagg med størrelser og logoplassering.",
        "items": [
          "T-skjorte",
          "Genser",
          "Logo"
        ]
      },
      {
        "audience": "Arrangement",
        "title": "Klær til et lokalt event",
        "challenge": "Arrangøren vil ha et lite, tydelig utvalg.",
        "result": "En enkel kolleksjon med trykk og samlet bestilling.",
        "items": [
          "Crew",
          "Deltakere",
          "Bestill"
        ]
      },
      {
        "audience": "Skaper",
        "title": "Merch for en liten merkevare",
        "challenge": "Produkter må testes før større salg.",
        "result": "Visualisering av aktuelle plagg og prøvebestilling.",
        "items": [
          "Produktvalg",
          "Prøve",
          "Produksjon"
        ]
      }
    ],
    "faq": [
      {
        "question": "Må jeg bestille mange plagg?",
        "answer": "Minimumsantall avhenger av leverandør og produkt. Vi avklarer dette før bestilling."
      },
      {
        "question": "Kan jeg se hvordan logoen blir?",
        "answer": "Vi kan lage en visualisering. Trykkplassering og produksjonsfil godkjennes før produksjon."
      }
    ]
  },
  "ecommerce": {
    "slug": "ecommerce",
    "accent": "#a3e8bd",
    "heroEmphasis": "som passer virksomheten.",
    "statement": "Velg handelsløsning etter hva du selger, ikke etter flest funksjoner.",
    "preview": "commerce",
    "examples": [
      {
        "audience": "Digitale produkter",
        "title": "Selg digitale filer",
        "challenge": "Du trenger et lett oppsett uten stor butikk.",
        "result": "En enkel produktside og digital leveranse med passende plattform.",
        "items": [
          "Digital fil",
          "Checkout",
          "Levering"
        ]
      },
      {
        "audience": "Fysiske varer",
        "title": "Butikk som kan vokse",
        "challenge": "Flere varer og varianter skal håndteres.",
        "result": "En produktkatalog med betaling og ordreflyt.",
        "items": [
          "Produkter",
          "Varianter",
          "Ordre"
        ]
      },
      {
        "audience": "Test et konsept",
        "title": "Start med få produkter",
        "challenge": "Du vil teste etterspørselen før større investering.",
        "result": "En liten nettbutikk med oversiktlige kostnader.",
        "items": [
          "Lansering",
          "Priser",
          "Resultater"
        ]
      }
    ],
    "faq": [
      {
        "question": "Er Shopify alltid riktig?",
        "answer": "Nei. Vi sammenligner for eksempel Shopify og Payhip ut fra produkt, volum, kostnad og behov."
      },
      {
        "question": "Kan plattformen byttes senere?",
        "answer": "Ofte, men migrering av produkter, kunder og design må planlegges."
      }
    ]
  },
  "trykk-og-print": {
    "slug": "trykk-og-print",
    "accent": "#ffd78b",
    "heroEmphasis": "du kan holde i hånden.",
    "statement": "Tydelig design på trykksaker som folk faktisk får med seg.",
    "preview": "print",
    "examples": [
      {
        "audience": "Lokalt tilbud",
        "title": "Flyers til en kampanje",
        "challenge": "Budskapet blir borte i for mye tekst.",
        "result": "En fokusert flyer med ett tilbud og én kontaktmåte.",
        "items": [
          "Budskap",
          "QR-kode",
          "Kontakt"
        ]
      },
      {
        "audience": "Bedrift",
        "title": "Visittkort som ser profesjonelle ut",
        "challenge": "Profilen må fungere også utenfor skjermen.",
        "result": "Et lesbart kort med riktige formater og produksjonsfil.",
        "items": [
          "Logo",
          "Kontakt",
          "Trykkfil"
        ]
      },
      {
        "audience": "Arrangement",
        "title": "Plakat for et arrangement",
        "challenge": "Tid, sted og billettinformasjon må synes raskt.",
        "result": "En plakat med tydelig hierarki og nødvendig informasjon.",
        "items": [
          "Dato",
          "Sted",
          "Påmelding"
        ]
      }
    ],
    "faq": [
      {
        "question": "Kan dere ordne selve trykket?",
        "answer": "Vi kan avklare produksjonspartner, kvalitet, antall og levering før bestilling."
      },
      {
        "question": "Får jeg korrektur først?",
        "answer": "Ja. Innhold og trykkgrunnlag skal godkjennes før produksjon."
      }
    ]
  },
  "musiker-og-artist": {
    "slug": "musiker-og-artist",
    "accent": "#d0b0ff",
    "heroEmphasis": "som matcher musikken.",
    "statement": "Gi utgivelser, konserter og merch en tydelig visuell helhet.",
    "preview": "music",
    "examples": [
      {
        "audience": "Singel",
        "title": "Visuell identitet for en låt",
        "challenge": "En utgivelse trenger et gjenkjennelig uttrykk.",
        "result": "Cover, grafiske formater og enkel lanseringsside.",
        "items": [
          "Cover",
          "Forhåndsvisning",
          "Lansering"
        ]
      },
      {
        "audience": "Konsert",
        "title": "Materiale til en spillejobb",
        "challenge": "Dato, sted og billetter skal kommuniseres.",
        "result": "Plakat, sosiale formater og QR-lenke til billetter.",
        "items": [
          "Plakat",
          "Billettlenke",
          "Deling"
        ]
      },
      {
        "audience": "Artistmerch",
        "title": "Et lite utvalg merch",
        "challenge": "Merch må passe artistens stil og publikum.",
        "result": "Visuelle produktforslag og en enkel bestillingsprosess.",
        "items": [
          "T-skjorte",
          "Plakat",
          "Opplag"
        ]
      }
    ],
    "faq": [
      {
        "question": "Kan dere hjelpe med fysisk utgivelse?",
        "answer": "Vi kan undersøke leverandører for CD, vinyl og trykksaker. Pris og tilgjengelighet avklares."
      },
      {
        "question": "Hvem eier musikken og designet?",
        "answer": "Rettigheter og bruksomfang avtales skriftlig før oppstart."
      }
    ]
  },
  "kunstner-og-merch": {
    "slug": "kunstner-og-merch",
    "accent": "#f3b2c6",
    "heroEmphasis": "som løfter frem kunsten.",
    "statement": "Fra verk til presentasjon, kunsttrykk og salg på nett.",
    "preview": "gallery",
    "examples": [
      {
        "audience": "Nummerert opplag",
        "title": "Kunsttrykk i liten serie",
        "challenge": "Kunstneren vil teste en begrenset utgave.",
        "result": "Presentasjon av format, opplag og signeringsrutine.",
        "items": [
          "Motiv",
          "Format",
          "Opplag"
        ]
      },
      {
        "audience": "Digitalt galleri",
        "title": "Samle verkene på én side",
        "challenge": "Publikum trenger et sted å utforske kunsten.",
        "result": "Et galleri med verkstekster og tydelig kontakt.",
        "items": [
          "Verk",
          "Kunstner",
          "Forespørsel"
        ]
      },
      {
        "audience": "Kunst på klær",
        "title": "En kolleksjon med motiv",
        "challenge": "Originalmotivet skal fungere på tekstil.",
        "result": "Produktfremvisning, prøve og avklart rettighetsbruk.",
        "items": [
          "Genser",
          "Motiv",
          "Godkjenning"
        ]
      }
    ],
    "faq": [
      {
        "question": "Kan verk selges i begrenset opplag?",
        "answer": "Ja, men opplagsstørrelse, nummerering og eventuell signering må avtales."
      },
      {
        "question": "Må kunstneren godkjenne produktet?",
        "answer": "Ja. Motivbruk, produkter og rettigheter skal godkjennes før salg."
      }
    ]
  },
  "vedoy-growth": {
    "slug": "vedoy-growth",
    "accent": "#86e4a3",
    "heroEmphasis": "som gir deg oversikt.",
    "statement": "Kunder, forespørsler og oppfølging i en roligere arbeidsdag.",
    "preview": "app",
    "examples": [
      {
        "audience": "Småbedrift",
        "title": "Kunder og henvendelser",
        "challenge": "Forespørsler ligger spredt i ulike innbokser.",
        "result": "En oversikt med kundekort, neste steg og ansvar.",
        "items": [
          "Kundekort",
          "Henvendelser",
          "Oppfølging"
        ]
      },
      {
        "audience": "Tjenestebedrift",
        "title": "Timer og bookinger",
        "challenge": "Ansatte mangler én felles oversikt.",
        "result": "En arbeidsflate for avtaler og timeregistrering.",
        "items": [
          "Booking",
          "Timer",
          "Kunder"
        ]
      },
      {
        "audience": "Team",
        "title": "Oppgaver og notater",
        "challenge": "Viktig kontekst forsvinner mellom samtaler.",
        "result": "Delte notater med prosjektstatus og oppgaver.",
        "items": [
          "Notater",
          "Oppgaver",
          "Status"
        ]
      }
    ],
    "faq": [
      {
        "question": "Må vi ta i bruk alt samtidig?",
        "answer": "Nei. Vi kan starte med én modul og utvide etter behov."
      },
      {
        "question": "Kan Growth tilpasses vår bedrift?",
        "answer": "Behov og integrasjoner vurderes i en pilot. Ikke alle planlagte moduler er ferdige."
      }
    ]
  },
  "vedoy-css": {
    "slug": "vedoy-css",
    "accent": "#81cfff",
    "heroEmphasis": "som henger sammen.",
    "statement": "Et felles designspråk for raske, tilgjengelige og gjenkjennelige grensesnitt.",
    "preview": "style",
    "examples": [
      {
        "audience": "Nettsider",
        "title": "Knapper og skjemaer",
        "challenge": "Hver side har ulik stil og avstand.",
        "result": "En liten samling komponenter som gjør siden mer konsekvent.",
        "items": [
          "Knapper",
          "Skjemaer",
          "Typografi"
        ]
      },
      {
        "audience": "Produktteam",
        "title": "Komponentbibliotek for app",
        "challenge": "Utviklerne lager de samme elementene på nytt.",
        "result": "Gjenbrukbare komponenter med definerte tilstander.",
        "items": [
          "Komponenter",
          "Tilstander",
          "Tokens"
        ]
      },
      {
        "audience": "Merkevare",
        "title": "Visuell systematisering",
        "challenge": "Farger og skriftstørrelser varierer for mye.",
        "result": "Enkle regler for farge, tekst og spacing.",
        "items": [
          "Farger",
          "Spacing",
          "Kontrast"
        ]
      }
    ],
    "faq": [
      {
        "question": "Kan Vedøy CSS brukes i eksisterende prosjekter?",
        "answer": "Det avhenger av teknologien og kodebasen. Vi kan vurdere en gradvis integrasjon."
      },
      {
        "question": "Er dette et ferdig universelt UI-bibliotek?",
        "answer": "Det er et designsystem i utvikling. Omfanget av en leveranse beskrives før avtale."
      }
    ]
  },
  "vedoy-phone": {
    "slug": "vedoy-phone",
    "accent": "#81baff",
    "heroEmphasis": "som samler samtalene.",
    "statement": "En planlagt løsning for bedriftens nummer, meldinger og sentralbord.",
    "preview": "phone",
    "examples": [
      {
        "audience": "Liten bedrift",
        "title": "Ett bedriftsnummer",
        "challenge": "Kunder ringer ulike ansatte uten felles oversikt.",
        "result": "Et planlagt oppsett med nummer og enkel viderekobling.",
        "items": [
          "Bedriftsnummer",
          "Viderekobling",
          "Ansatte"
        ]
      },
      {
        "audience": "Kundeservice",
        "title": "Felles inngang for henvendelser",
        "challenge": "Henvendelser blir liggende hos enkeltpersoner.",
        "result": "En planlagt delt oversikt for samtaler og meldinger.",
        "items": [
          "Samtaler",
          "SMS",
          "Historikk"
        ]
      },
      {
        "audience": "Ekstern IT",
        "title": "Administrasjon av telefoni",
        "challenge": "Tilganger og numre må kunne forvaltes sentralt.",
        "result": "Et planlagt administrasjonspanel for bedrifter.",
        "items": [
          "Brukere",
          "Numre",
          "Tilgang"
        ]
      }
    ],
    "faq": [
      {
        "question": "Kan vi bestille Vedoy Phone nå?",
        "answer": "Nei. Løsningen er under utvikling. Meld gjerne interesse for en framtidig pilot."
      },
      {
        "question": "Er telefonnummer og SMS tilgjengelig i alle land?",
        "answer": "Nei. Tilgjengelighet, identitetskrav og lokale regler må vurderes per land og leverandør."
      }
    ]
  },
  "vedoy-rewards": {
    "slug": "vedoy-rewards",
    "accent": "#ffe088",
    "heroEmphasis": "som gir kundene en grunn til å komme tilbake.",
    "statement": "En planlagt belønningsløsning med poeng, fordeler og frivillig deltakelse.",
    "preview": "rewards",
    "examples": [
      {
        "audience": "Kafé",
        "title": "Digitalt stempelkort",
        "challenge": "Gjestene glemmer papirkort.",
        "result": "Et planlagt poengkort med en tydelig og frivillig belønning.",
        "items": [
          "Besøk",
          "Poeng",
          "Belønning"
        ]
      },
      {
        "audience": "Nettbutikk",
        "title": "Fordeler for gjengangere",
        "challenge": "Butikken vil takke faste kunder.",
        "result": "En planlagt fordelsoversikt med enkle belønningsregler.",
        "items": [
          "Konto",
          "Fordeler",
          "Bruk poeng"
        ]
      },
      {
        "audience": "Kundeinnsikt",
        "title": "Frivillig undersøkelse",
        "challenge": "Bedriften ønsker nyttige tilbakemeldinger.",
        "result": "En planlagt spørreundersøkelse med tydelig samtykke og belønning.",
        "items": [
          "Spørsmål",
          "Samtykke",
          "Poeng"
        ]
      }
    ],
    "faq": [
      {
        "question": "Kan jeg bruke Vedoy Rewards i dag?",
        "answer": "Nei. Produktet er under utvikling og åpner ikke for ordinær bestilling ennå."
      },
      {
        "question": "Må kundene dele personopplysninger?",
        "answer": "Deltakelse skal være frivillig. Eventuell databruk må beskrives tydelig og vurderes mot personvernreglene."
      }
    ]
  }
};

export const upcomingServiceDetails: Record<string, StudioService> = {
  "vedoy-phone": {
    "number": "13",
    "slug": "vedoy-phone",
    "title": "Vedoy Phone",
    "cardText": "Planlagt bedrifts­telefoni med samtaler, SMS og sentralbord.",
    "eyebrow": "PLANLAGT · BEDRIFTSTELEFONI",
    "lead": "Bedriftens samtaler og numre i én oversikt.",
    "introduction": "Vedoy Phone utvikles som en løsning for bedrifter som vil administrere numre, innkommende henvendelser og ansatte fra ett sted. Funksjoner, priser, landdekning og lansering er ikke fastsatt.",
    "deliverables": [
      "Planlagt nummer- og brukeradministrasjon",
      "Planlagt sentralbord og samtaleoversikt",
      "Planlagt SMS-håndtering",
      "Tilgangsstyring og leverandørintegrasjoner vurderes"
    ],
    "focus": [
      "VoIP",
      "SMS",
      "Bedriftsnummer",
      "PBX",
      "Tilganger"
    ],
    "process": [
      "Vi samler behov fra interesserte bedrifter.",
      "Vi tester en avgrenset pilot mot leverandør og lokale krav.",
      "Funksjoner og sikkerhet vurderes før eventuell åpning.",
      "Tidspunkt og priser publiseres først når de er bekreftet."
    ],
    "nextStep": "Meld interesse og beskriv hvor mange ansatte og numre dere trenger. Dette er ikke en bestilling.",
    "renderType": "general",
    "published": false
  },
  "vedoy-rewards": {
    "number": "14",
    "slug": "vedoy-rewards",
    "title": "Vedoy Rewards",
    "cardText": "Planlagt lojalitetsprogram med poeng og frivillige belønninger.",
    "eyebrow": "PLANLAGT · KUNDELOJALITET",
    "lead": "Belønn gode kundeopplevelser på en ryddig måte.",
    "introduction": "Vedoy Rewards utvikles for bedrifter som ønsker enkle belønninger, kundeengasjement og frivillig deltakelse. Eksemplene nedenfor er konsepter; funksjoner, integrasjoner og lanseringsdato er ikke bekreftet.",
    "deliverables": [
      "Planlagte poeng- og belønningsregler",
      "Planlagte fordeler for lojale kunder",
      "Mulig butikk- og appintegrasjon i framtiden",
      "Tydelig samtykke og personvernvurdering før databruk"
    ],
    "focus": [
      "Lojalitet",
      "Poeng",
      "Belønninger",
      "Personvern",
      "Integrasjoner"
    ],
    "process": [
      "Vi kartlegger hvilke belønninger som er nyttige.",
      "Vi tester regler og frivillig kundedeltakelse.",
      "Vi kvalitetssikrer personvern og integrasjoner.",
      "Pilot og priser annonseres når løsningen er klar."
    ],
    "nextStep": "Meld interesse og fortell hvilken belønning du ønsker å gi kundene. Dette er ikke en bestilling.",
    "renderType": "general",
    "published": false
  }
};
