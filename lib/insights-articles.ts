export type InsightArticle = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readingMinutes: number;
  author: string;
  journalist?: string;
  editor?: string;
  disclosure?: string;
  articleCta?: { eyebrow: string; title: string; description: string; href: string; linkText: string };
  sections: ReadonlyArray<{ heading: string; paragraphs: ReadonlyArray<string> }>;
};

export const INSIGHT_ARTICLES: readonly InsightArticle[] = [
  {
    "slug": "hva-er-kvanteteknologi-forklart-uten-mysterier",
    "title": "Hva er kvantefysikk? Kvantemekanikk og kvanteteknologi forklart",
    "excerpt": "Hva er kvantefysikk og kvantemekanikk? Lær hvordan kvanteteknologi, kvantedatamaskiner og kvantesikkerhet fungerer – enkelt forklart med eksempler.",
    "category": "Teknologi og forskning",
    "publishedAt": "2026-11-07",
    "readingMinutes": 10,
    "author": "Vedoy Insights",
    "journalist": "Vedoy Insights",
    "editor": "Eiolf-Leander Haugsnes Vedøy",
    "disclosure": "Vedoy Insights er en publikasjon fra Vedøy. Artikkelen er en allmennfaglig forklaring basert på åpne fagkilder. Eksempler på fremtidig bruk er muligheter, ikke garantier eller lanserte Vedøy-tjenester.",
    "articleCta": {
      "eyebrow": "UTFORSK TEKNOLOGIEN",
      "title": "Vedoy Studio",
      "description": "Vedøy utforsker hvordan programvare, sikkerhetsanalyse og nye teknologier kan bli nyttige verktøy for utviklere og bedrifter.",
      "href": "https://vedoystudio.no",
      "linkText": "Utforsk Vedoy Studio"
    },
    "sections": [
      {
        "heading": "Er kvantefysikk, kvantemekanikk og kvanteteknologi det samme?",
        "paragraphs": [
          "Begrepene ligner, men har ulike betydninger. Kvantefysikk er et bredt fagområde som beskriver hvordan atomer, lys og andre svært små systemer oppfører seg. Kvantemekanikk er det sentrale matematiske rammeverket som brukes til å beskrive slike systemer. I dagligtale brukes de to ordene ofte om hverandre.",
          "Kvanteteknologi er derimot de praktiske løsningene som utnytter disse fysiske lovene. Kvantedatamaskiner er ett eksempel, mens kvantesensorer og kvantekommunikasjon er andre. Du trenger altså ikke en kvantedatamaskin for å bruke kvanteteknologi.",
          "Kort sagt: Kvantefysikk er fagområdet, kvantemekanikk forklarer reglene matematisk, og kvanteteknologi bruker kunnskapen til å bygge nyttige verktøy."
        ]
      },
      {
        "heading": "Kvanteteknologi begynner med naturens minste byggesteiner",
        "paragraphs": [
          "Se for deg at du kan undersøke et atom, et elektron eller et enkelt lyskvant – et foton. På disse skalaene oppfører naturen seg annerledes enn det vi er vant til fra biler, fotballer og datamaskiner. Reglene beskrives av kvantemekanikken, en teori som har blitt utviklet og testet gjennom mer enn hundre år.",
          "Kvanteteknologi betyr å utnytte slike kvantefenomener målrettet. Det er ikke én bestemt maskin, men en familie av teknologier: kvantedatamaskiner som utfører spesielle beregninger, kvantesensorer som måler svært små endringer, og kvantekommunikasjon som bruker egenskaper ved blant annet lys.",
          "Det finnes allerede kvantefysikk i hverdagen vår. Transistorer, lasere og mye moderne elektronikk er mulige fordi forskere forstår den. Det nye er at vi i større grad kan kontrollere individuelle kvantesystemer og bruke dem direkte til informasjon og måling."
        ]
      },
      {
        "heading": "Vanlige bits og kvantebits: hva er forskjellen?",
        "paragraphs": [
          "En vanlig datamaskin lagrer informasjon i bits, som representerer enten 0 eller 1. En kvantedatamaskin bruker kvantebits, ofte kalt qubits. En qubit kan være i en superposisjon: en kvantetilstand som beskrives ved en kombinasjon av mulige måleresultater.",
          "Det betyr ikke at du kan lese ut både 0 og 1 samtidig. Når en qubit måles, får du et vanlig resultat, 0 eller 1. Det spesielle er hvordan sannsynlighetene og bølgeegenskapene kan påvirkes før målingen. Kvantealgoritmer forsøker å forsterke de nyttige svarene og svekke de uønskede.",
          "Tenk på dette som en ny måte å regne på, ikke som en super-PC som automatisk gjør alt raskere. En vanlig laptop vil fortsatt være bedre egnet til tekstbehandling, nettlesing og de fleste vanlige programmer."
        ]
      },
      {
        "heading": "Tre ord som forklarer mye: superposisjon, sammenfiltring og interferens",
        "paragraphs": [
          "Superposisjon beskriver hvordan kvantetilstanden kan være en kombinasjon av mulige utfall. Sammenfiltring, eller entanglement, betyr at flere kvantesystemer kan ha så sterke kvantekorrelasjoner at tilstanden ikke kan beskrives som uavhengige deler. Men sammenfiltring lar oss ikke sende beskjeder raskere enn lyset.",
          "Interferens oppstår når kvantetilstandenes sannsynlighetsamplituder virker sammen. Enkelte utfall kan forsterkes, mens andre svekkes. Dette er avgjørende for hvordan kvantealgoritmer forsøker å gi nyttige resultater.",
          "Kvantefenomenene er samtidig sårbare for støy. Varme, elektromagnetiske forstyrrelser og uønsket påvirkning kan ødelegge tilstander og skape feil. Derfor krever mange kvantedatamaskiner omfattende kontrollsystemer og i noen tilfeller ekstrem nedkjøling."
        ]
      },
      {
        "heading": "Hva kan en kvantedatamaskin egentlig brukes til?",
        "paragraphs": [
          "Et av de mest lovende forskningsområdene er simulering av kjemi og materialer. Molekyler følger kvantemekaniske lover, og nøyaktig simulering av store kvantesystemer er krevende for vanlige datamaskiner. Mer robuste kvantedatamaskiner kan på sikt hjelpe forskere med å forstå nye batterier, katalysatorer og materialer.",
          "Et annet område er spesielle matematiske problemer. Shors algoritme viser at en tilstrekkelig kraftig, feilkorrigert kvantedatamaskin i prinsippet kan faktorisere store tall effektivt. Dette er en trussel mot kryptosystemer som RSA. Grovers algoritme gir en teoretisk kvadratisk forbedring i visse typer søk.",
          "Det forskes også på optimalisering, for eksempel logistikk og komplekse planleggingsoppgaver. Men det er ikke bevist at kvantedatamaskiner vil slå de beste klassiske metodene i alle slike problemer. Mange lovende bruksområder er fortsatt forskning."
        ]
      },
      {
        "heading": "Kvantesensorer kan bli nyttige før kvantedatamaskinene blir kraftige",
        "paragraphs": [
          "Kvanteteknologi handler ikke bare om beregninger. Kvantesensorer kan bruke atomer, lys eller andre kvantesystemer til å måle tid, magnetfelt, tyngdekraft og bevegelse svært presist. Noen slike teknologier finnes allerede i laboratorier og spesialiserte systemer.",
          "Et mulig bruksområde er kartlegging. Små variasjoner i tyngdefeltet kan gi informasjon om masser under bakken, for eksempel geologiske strukturer. Målingene må likevel tolkes sammen med andre data: En kvantesensor er ikke et kamera som kan se gjennom jord og fjell.",
          "For digitale kart og tredimensjonale modeller kan kombinasjonen av sensorer, geografiske data og visualisering på sikt åpne nye muligheter. Selve 3D-modellen kan bygges på vanlige datamaskiner; det er måleinstrumentet som eventuelt benytter kvanteteknologi."
        ]
      },
      {
        "heading": "Vil kvantedatamaskiner kunne lese hemmelighetene våre?",
        "paragraphs": [
          "En stor bekymring er at fremtidige kvantedatamaskiner kan bryte enkelte mye brukte metoder for offentlig-nøkkel-kryptografi. Det gjelder særlig algoritmer basert på faktorisering og diskrete logaritmer, som RSA og mange elliptisk-kurve-systemer. En liten kvantedatamaskin som finnes i dag, kan ikke praktisk knekke RSA-2048.",
          "Derfor utvikles postkvantekryptografi: matematiske algoritmer som er laget for å motstå både vanlige datamaskiner og kjente kvanteangrep. NIST publiserte i 2024 standardene ML-KEM for nøkkelutveksling og ML-DSA og SLH-DSA for digitale signaturer. Disse algoritmene kan kjøres på helt vanlige datamaskiner.",
          "Dette må ikke forveksles med Quantum Key Distribution, eller QKD. QKD utnytter fysiske kvantesystemer til nøkkeldistribusjon og krever spesialisert kommunikasjonsutstyr. Postkvantekryptografi krever normalt ikke kvantedatamaskin eller kvantelink."
        ]
      },
      {
        "heading": "Er kvanteteknologi i bruk allerede?",
        "paragraphs": [
          "Ja. Forskere og utviklere kan kjøre eksperimenter på ekte kvanteprosessorer gjennom skytjenester. Kvantesensorer, svært presise klokker og enkelte former for kvantekommunikasjon er også under utvikling eller i spesialisert bruk. Samtidig er dagens universelle kvantedatamaskiner fortsatt preget av støy, begrenset størrelse og betydelige feilrater.",
          "Det er derfor misvisende å si at kvantedatamaskiner allerede har erstattet superdatamaskiner. Foreløpig er de i hovedsak forsknings- og utviklingsverktøy for utvalgte oppgaver. Den store utfordringen er å bygge flere stabile, feilkorrigerte qubits som faktisk kan gjennomføre lange og nyttige beregninger."
        ]
      },
      {
        "heading": "Hva betyr dette for norske bedrifter og utviklere?",
        "paragraphs": [
          "For en vanlig bedrift er det sjelden riktig å kjøpe kvantemaskinvare. Det mer praktiske spørsmålet er hvilke data som bør forbli konfidensielle lenge, hvilken kryptografi systemene bruker, og om leverandører har en plan for overgangen til postkvantesikre løsninger.",
          "Utviklere kan også lære ved å bruke simulatorer og offentlige læringsressurser. Det gir innsikt i hvordan kvantekretser fungerer uten at man trenger et laboratorium. Den viktigste første investeringen er ofte kompetanse – ikke kostbart utstyr.",
          "Vedøy utforsker mulighetene innen sikkerhetsverktøy, kvanteberedskap og visualisering. Slike ideer er utviklingsretninger, ikke bevis for at et prosjekt allerede er kvantesikkert eller at en kvantedatamaskin har validert sikkerheten."
        ]
      },
      {
        "heading": "Hva bør vi huske om fremtiden?",
        "paragraphs": [
          "Kvanteteknologi er verken magi eller en garanti for at alle vanskelige oppgaver snart blir enkle. Men når vi lærer å kontrollere naturens minste systemer, får vi nye metoder for beregning, kommunikasjon og måling.",
          "For samfunnet kan dette bety bedre vitenskapelige instrumenter, nye muligheter i materialforskning og behov for å oppdatere sikkerhetssystemer. For den enkelte er den viktigste lærdommen enkel: Fremtidens teknologi utvikles allerede, men løftene må vurderes opp mot hva som faktisk er demonstrert."
        ]
      },
      {
        "heading": "Kilder og videre lesning",
        "paragraphs": [
          "NIST – Quantum Computing Explained: https://www.nist.gov/quantum-information-science/quantum-computing-explained",
          "NIST – Post-Quantum Cryptography: https://csrc.nist.gov/Projects/Post-Quantum-Cryptography",
          "IBM – What Is Quantum Computing?: https://www.ibm.com/think/topics/quantum-computing",
          "EU-kommisjonen – Quantum technologies: https://digital-strategy.ec.europa.eu/en/policies/quantum",
          "EuroHPC – Quantum Technologies: https://www.eurohpc-ju.europa.eu/quantum-technologies_en"
        ]
      }
    ]
  },
  {
    "slug": "nattens-utvikling-tryggere-sky-enklere-verktoy",
    "title": "Nattens utvikling hos Vedøy: tryggere sky og enklere verktøy",
    "excerpt": "Natt til 6. november fortsatte arbeidet med Vedoy Cloud, Developer Portal og Collective. Vedoy Shield inngår i sikkerhetsplanene for økosystemet.",
    "category": "Utvikling hos Vedøy",
    "publishedAt": "2026-11-06T05:10:00+01:00",
    "readingMinutes": 3,
    "author": "Eiolf-Leander Haugsnes Vedøy",
    "journalist": "Eiolf-Leander Haugsnes Vedøy",
    "editor": "Eiolf-Leander Haugsnes Vedøy",
    "disclosure": "Vedoy Insights er en publikasjon fra Vedøy. Opplysningene bygger på utviklingsarbeid dokumentert i GitHub. Flere løsninger er fortsatt under utvikling eller testing og er ikke nødvendigvis offentlig lansert.",
    "articleCta": {
      "eyebrow": "UTFORSK ARBEIDET",
      "title": "Vedoy Studio",
      "description": "Se hvordan Vedøy utvikler digitale verktøy og tjenester for bedrifter.",
      "href": "https://vedoystudio.no",
      "linkText": "Besøk Vedoy Studio"
    },
    "sections": [
      {
        "heading": "Sikkerhet før lansering",
        "paragraphs": [
          "Natt til 6. november fortsatte arbeidet med Vedoy Cloud. Sikkerhetsforbedringer for prosjektportalen ble slått sammen i hovedgrenen, med strengere kontroll av tilgang mellom kunder og tester av løsningens avgrensninger.",
          "Cloud-funksjonene er likevel ikke åpnet for produksjonsdata. Videre kontroll i testmiljø og verifisering av databaseendringer gjenstår før offentlig lansering."
        ]
      },
      {
        "heading": "En enklere Developer Portal",
        "paragraphs": [
          "Vedoy Developer Portal fikk en tydeligere oppdeling mellom dokumentasjon og arbeidsområdet der utviklere håndterer prosjekter, moduler og API-nøkler. Også spillkatalogen og tidligere lenker ble tatt hensyn til.",
          "Målet er å gjøre det enklere å finne riktig API og forstå hvordan det brukes, uten å måtte navigere i én overfylt side."
        ]
      },
      {
        "heading": "Bedriftsverktøy og kreative tjenester",
        "paragraphs": [
          "Vedoy Studio fikk videreutviklet Multisite med en mer interaktiv veiviser for nettsidebehov, pristilbud og tydelig Vedoy-branding. Parallelt ble det arbeidet med Vedoy Stock Media i Collective-appen, blant annet forhåndsvisninger av bilder under lisensvurdering.",
          "Vedoy Collective fikk også forbedringer i interne vurderingsresultater og analyse knyttet til lanseringsarbeidet. Utvikling og testing pågår fortsatt."
        ]
      },
      {
        "heading": "Vedoy Shield: en felles sikkerhetsretning",
        "paragraphs": [
          "Vedoy Shield er konseptet for et felles sikkerhetslag på tvers av Vedøys digitale tjenester. Ambisjonen er å samle prinsipper for kryptering, trygg nøkkelhåndtering, tilgangskontroll og beskyttelse av API-er, slik at sikkerhet bygges inn fra starten.",
          "For meldinger og andre sensitive data vurderes blant annet ende-til-ende-kryptering og nøkkelrotasjon. Dette er foreløpig planlagte egenskaper, ikke en ferdig implementert eller uavhengig sikkerhetsrevidert løsning. Dokumentasjon, testing og gjennomgang av kryptografiske valg må komme før konkrete sikkerhetsgarantier kan gis."
        ]
      },
      {
        "heading": "Veien videre",
        "paragraphs": [
          "Nattens arbeid viser en tydelig prioritering: bedre sikkerhet, enklere brukeropplevelse og verktøy som kan løse konkrete problemer. Neste steg er å teste helheten, lukke gjenværende feil og gjøre de mest nyttige løsningene klare for kunder."
        ]
      }
    ]
  },
  {
    "slug": "fra-ide-til-fungerende-teknologi-utviklingsdag-vedoy",
    "title": "Fra idé til fungerende teknologi: En innholdsrik utviklingsdag hos Vedøy",
    "excerpt": "En dag med utvikling av finansapper, skyløsninger, nettbutikker og automatisering. Hos Vedøy handler arbeidet stadig mer om å gjøre ideer til teknologi som faktisk kan brukes.",
    "category": "Utvikling hos Vedøy",
    "publishedAt": "2026-11-06T01:12:00+01:00",
    "readingMinutes": 5,
    "author": "Eiolf-Leander Haugsnes Vedøy",
    "journalist": "Eiolf-Leander Haugsnes Vedøy",
    "editor": "Eiolf-Leander Haugsnes Vedøy",
    "disclosure": "Vedoy Insights er en publikasjon fra Vedøy. Enkelte produkter omtales som prototyper eller planlagte tjenester, ikke som ferdiglanserte løsninger.",
    "articleCta": {
      "eyebrow": "UTFORSK VEDØY",
      "title": "Vedoy Studio",
      "description": "Oppdag nettsider, apper, booking og andre digitale tjenester fra Vedøy.",
      "href": "https://vedoystudio.no",
      "linkText": "Se Vedoy Studio"
    },
    "sections": [
      {
        "heading": "Flere prosjekter, én felles retning",
        "paragraphs": [
          "Det er lett å få ideer til nye teknologiprodukter. Den virkelige utfordringen er å bygge dem, teste dem og gjøre dem nyttige for andre.",
          "Den 5. november jobbet Vedøy videre med flere tjenester som på sikt skal inngå i et større teknologisk økosystem. Noen løsninger fikk fungerende prototyper, andre ble forbedret, og flere kom nærmere lansering."
        ]
      },
      {
        "heading": "Vedoy Bank – et nytt konsept tar form",
        "paragraphs": [
          "En av dagens større utviklingsoppgaver var Vedoy Bank, en prototype som utforsker hvordan digitale kontoer, betalingskort, valuta og lojalitetspoeng kan samles i én applikasjon.",
          "En første versjon ble distribuert gjennom Vercel, og en valutakalkulator basert på Frankfurter API ble implementert og testet.",
          "Vedoy Bank er foreløpig en teknologiprototype, ikke en operativ bank eller godkjent finanstjeneste."
        ]
      },
      {
        "heading": "Vedoy Studio blir enklere å presentere",
        "paragraphs": [
          "På vedoystudio.no ble en ny demoseksjon publisert. Her skal potensielle kunder lettere kunne se hvordan nettsider, bookingløsninger og andre digitale tjenester kan fungere i praksis.",
          "Det ble også utarbeidet en firesiders brosjyre som presenterer Vedøys tjenester.",
          "Målet er å gjøre det enklere for små bedrifter å forstå hvilke problemer teknologien kan løse, uten at de trenger omfattende teknisk kunnskap."
        ]
      },
      {
        "heading": "Vedoy Cloud og fremtidens utviklerverktøy",
        "paragraphs": [
          "Arbeidet med Vedoy Cloud fortsatte med en prosjektportal for opprettelse av prosjekter, import fra GitHub og håndtering av filer.",
          "En forhåndsvisning ble tilgjengelig, men produksjonspublisering avventet videre sikkerhetstesting.",
          "Samtidig ble Vedoy Control videreutviklet som én samlet plattform for versjonskontroll. Målet er å gjøre Git enklere, blant annet gjennom KI-assistert konflikthåndtering, tydeligere kommandoer og muligheten til å gjenopprette tidligere versjoner."
        ]
      },
      {
        "heading": "Rust, Python og kunstig intelligens",
        "paragraphs": [
          "Et strategidokument om effektivisering og automatisering ble også ferdigstilt.",
          "Her ble det sett nærmere på hvordan Rust kan brukes til ytelseskritiske tjenester, Python til automatisering og kunstig intelligens til oppgaver som ellers krever mye manuelt arbeid.",
          "For Vedøy handler automatisering først og fremst om å bruke mindre tid på gjentakende oppgaver og mer tid på å utvikle tjenester kundene faktisk trenger."
        ]
      },
      {
        "heading": "Vedoy Collective nærmere lansering",
        "paragraphs": [
          "Natt til 6. november ble oppdateringer i Vedoy Collective-appen slått sammen, og nettappen ble publisert.",
          "Arbeidet omfattet blant annet ny logoimplementering, appikon, en «Om oss»-side og tydelig informasjon om Vedøy som utvikler.",
          "De rapporterte testene ble bestått. Android-versjonen var bygget, mens publisering i Google Play fortsatt gjensto."
        ]
      },
      {
        "heading": "Bedre prosjektstyring",
        "paragraphs": [
          "Et annet fokusområde var Vedøy Project Manager, en planlagt løsning for å samle prosjekter, oppgaver, tidsbruk og prioriteringer.",
          "Når flere tjenester utvikles parallelt, blir god prosjektstyring avgjørende. Det er ikke nødvendigvis prosjektet med flest funksjoner som bør få mest oppmerksomhet, men prosjektet som kan gi størst verdi med ressursene som er tilgjengelige."
        ]
      },
      {
        "heading": "Veien videre",
        "paragraphs": [
          "Arbeidet fremover handler om å gjøre flere av løsningene klare for faktisk bruk.",
          "Det betyr grundigere testing, sikkerhetsforbedringer, enklere brukeropplevelser og større oppmerksomhet rundt tjenester som kan skape inntekter.",
          "Vedøy bygger ikke bare for å utvikle teknologi. Ambisjonen er å skape løsninger som er robuste, sikre og som løser reelle problemer.",
          "Og selv om ikke alle prosjektene er ferdige, er hver fungerende prototype et steg nærmere det målet."
        ]
      }
    ]
  },
  {
    "slug": "rust-python-ki-automatisering-vedoy-studio",
    "title": "Mindre rutinearbeid, mer verdiskaping: slik kan Rust, Python og KI brukes i bedriften",
    "excerpt": "Automatisering handler ikke om å la KI gjøre alt. Det handler om å bygge bedre arbeidsflyter. Her er konkrete eksempler fra tjenestene i Vedoy Studio.",
    "category": "Teknologi og automatisering",
    "publishedAt": "2026-11-05T22:43:00+01:00",
    "readingMinutes": 7,
    "author": "Vedoy Insights",
    "journalist": "Vedoy Insights",
    "editor": "Eiolf-Leander Haugsnes Vedøy",
    "articleCta": {
      "eyebrow": "UTFORSK TJENESTENE",
      "title": "Vedoy Studio",
      "description": "Se mulighetene for nettsider, booking, nettbutikker, KI-assistenter og skreddersydde webapplikasjoner.",
      "href": "https://vedoystudio.no",
      "linkText": "Se Vedoy Studio"
    },
    "disclosure": "Løsningene som beskrives, er eksempler på mulige arbeidsflyter, ikke en påstand om at alle integrasjoner eller automatiseringer allerede er satt i produksjon.",
    "sections": [
      {
        "heading": "Den lille oppgaven som stjeler mer tid enn du tror",
        "paragraphs": [
          "En kunde bestiller et møte gjennom nettsiden. Kalenderen oppdateres, men noen må fortsatt kopiere kontaktinformasjon til en prosjektliste, opprette en mappe og sende en bekreftelse. Hver oppgave virker beskjeden. Gjentas den ofte nok, går det likevel mye tid til arbeid som ikke trenger å være manuelt.",
          "Det er nettopp her automatisering har størst verdi. Ikke nødvendigvis i de mest spektakulære KI-funksjonene, men i overgangene mellom systemene en bedrift bruker hver dag."
        ]
      },
      {
        "heading": "Start med rutinen, ikke med KI-verktøyet",
        "paragraphs": [
          "Før du skriver én linje kode, er det verdt å stille tre spørsmål: Hva setter oppgaven i gang? Hvilke data trenger den? Og når må et menneske ta en beslutning? Svarene avgjør hva som kan automatiseres trygt.",
          "En god første kandidat er en rutine med tydelige regler og få unntak: bekreftelser, påminnelser, rapportutkast, prosjektopprettelse eller varsler ved feil. Behold manuell kontroll over betalinger, tilgangsendringer og publisering til løsningene er grundig testet."
        ]
      },
      {
        "heading": "Rust: når en SaaS-tjeneste trenger en solid motor",
        "paragraphs": [
          "Rust er et kompilert programmeringsspråk som legger vekt på ytelse og minnesikkerhet. Det er særlig interessant for SaaS-produkter som skal håndtere mange samtidige forespørsler, hendelser eller sanntidsoppdateringer. API-er, webhooks, købehandling og enkelte sikkerhetskomponenter er typiske bruksområder.",
          "For en løsning som behandler tusenvis av automatiske hendelser, kan effektiv ressursbruk være viktig for både responstid og serverkostnad. Men Rust er ingen snarvei til god programvare. Det tar ofte mer tid å utvikle med enn enklere alternativer, og en treg database blir ikke rask bare fordi API-et er skrevet i Rust.",
          "Derfor er det fornuftig å måle belastningen før teknologien velges. I en tidlig versjon av en tjeneste kan det være bedre å prioritere raske forbedringer fremfor maksimal ytelse."
        ]
      },
      {
        "heading": "Python og KI: godt egnet til analyse, utkast og beslutningsstøtte",
        "paragraphs": [
          "Python har et modent økosystem for integrasjoner, dataanalyse og kunstig intelligens. Det gjør språket godt egnet til å bygge KI-assistenter som leser en henvendelse, foreslår neste steg, oppsummerer et prosjekt eller lager et førsteutkast til tekst.",
          "Se for deg en ny forespørsel om nettside. En Python-tjeneste kan trekke ut ønskene kunden beskriver og lage en ryddig prosjektbrief. Den kan foreslå oppgaver og estimater, mens en medarbeider avgjør hva som faktisk skal tilbys. KI sparer tid i forarbeidet, men erstatter ikke faglig vurdering.",
          "Også KI trenger rammer: personopplysninger må håndteres forsvarlig, svar må kontrolleres og feil skal kunne spores. Der resultatet må være hundre prosent deterministisk, er vanlige regler ofte et bedre valg enn en språkmodell."
        ]
      },
      {
        "heading": "Fem praktiske eksempler med Vedoy Studio",
        "paragraphs": [
          "Nettsider og booking: En bedrift kan samle kontaktskjema, timebestilling og kalender. Etter en bestilling kan systemet sende bekreftelse, opprette en oppfølgingsoppgave og minne kunden på avtalen. Vedoy Studio kan bygge en slik arbeidsflyt som en del av en nettside eller bookingløsning.",
          "Nettbutikker: Når en ordre kommer inn, kan ordrestatus, interne oppgaver og kundevarsler oppdateres automatisk. Et godt system tar også høyde for returer, lageravvik og forsinkede betalinger. Ikke alle hendelser skal behandles som en vellykket ordre.",
          "CRM og prosjektstyring: Nye kundehenvendelser kan sorteres og knyttes til riktig prosjekt. Vedoy Studio kan kombinere kundesystem, oppgaveoversikt og enkel rapportering, slik at informasjon ikke blir liggende spredt i e-post, regneark og chat.",
          "KI-assistenter: En assistent kan lage forslag til kundesvar, produktbeskrivelser eller oppsummeringer. Det bør være tydelig når innhold er KI-generert, og kunden eller medarbeideren må kunne godkjenne svaret før det sendes.",
          "Hosting og vedlikehold: Overvåking kan fange opp nedetid, mislykkede sikkerhetskopier eller uvanlig belastning. Automatiske varsler gjør det lettere å oppdage feil tidlig, men virksomheten trenger fortsatt en ansvarlig person og en dokumentert plan for håndtering."
        ]
      },
      {
        "heading": "Slik kan en automatisert prosjektstart fungere",
        "paragraphs": [
          "Tenk at en kunde bestiller et møte om ny nettbutikk. Bookingløsningen registrerer hendelsen og oppretter et kundeemne. Når tilbudet er akseptert, oppretter prosjektverktøyet en sjekkliste, en prosjektmappe og et Git-repository i Gitea dersom oppdraget krever kode. Samtidig får kunden en oversikt over de neste stegene.",
          "En KI-assistent kan deretter foreslå milepæler basert på kundens behov. Prosjektlederen gjennomgår forslaget og godkjenner planen. Når utvikleren leverer kode, kan automatiske tester rapportere resultatet tilbake til prosjektet.",
          "Dette trenger ikke være én stor, komplisert app. En felles hendelsesmodell, tydelige API-er og noen få pålitelige integrasjoner kan gi mer verdi enn mange funksjoner som ikke snakker sammen."
        ]
      },
      {
        "heading": "Automatisering uten kontroll er ikke effektivisering",
        "paragraphs": [
          "En løsning som sender samme faktura tre ganger eller oppretter duplikate prosjekter, har ikke spart bedriften for arbeid. Gode rutiner krever derfor feilhåndtering, idempotente operasjoner, logging, varsler og en måte å forsøke på nytt uten å doble resultatet.",
          "Kundetilgang må avgrenses mellom virksomheter, hemmelige API-nøkler må beskyttes, og persondata bør ikke sendes til KI-tjenester uten et klart behandlingsgrunnlag og nødvendige avtaler. Særlig i en SaaS-tjeneste er gode tillatelser og sikker dataseparasjon avgjørende."
        ]
      },
      {
        "heading": "Hva kan bedriften gjøre de neste 30 dagene?",
        "paragraphs": [
          "Den første uken: Velg én gjentakende oppgave og mål hvor lang tid den tar. Den andre uken: Tegn opp arbeidsflyten og automatiser bare de forutsigbare trinnene. Den tredje uken: Test med reelle, men kontrollerte situasjoner, også når noe går galt. Den fjerde uken: Mål tidsbruk, feil og kostnad på nytt.",
          "Det viktigste tallet er ikke hvor mange KI-funksjoner bedriften har fått. Det er hvor mye tid som frigjøres, hvor mange feil som unngås og om kundene faktisk får en bedre opplevelse.",
          "For Vedøy er dette også en måte å bygge mer bærekraftige tjenester på: gjenbrukbare komponenter der det lønner seg, mennesker i kontroll over beslutningene og mindre rutinearbeid i hverdagen."
        ]
      }
    ]
  },
  {
    slug: "lokal-levering-uten-eget-budteam",
    title: "Lokal levering uten eget budteam: hva bør små bedrifter vurdere?",
    excerpt: "Rask levering er mer enn transport. Se hva lokale butikker og serveringssteder bør avklare om pris, kapasitet, personvern og kundens forventninger.",
    category: "Logistikk og digitalisering",
    publishedAt: "2026-11-05T17:00:00+01:00",
    readingMinutes: 5,
    author: "Vedoy Insights",
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
