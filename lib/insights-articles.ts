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
    "slug": "hvordan-selge-kunst-pa-klaer",
    "title": "Hvordan selge kunst på klær? Rettigheter, pris og samarbeid",
    "excerpt": "Praktisk guide for kunstnere og nettbutikker: opphavsrett, produktgodkjenning, prøveplagg, fortjeneste og lansering.",
    "category": "Kunst og netthandel",
    "publishedAt": "2026-11-07T16:00:00+01:00",
    "readingMinutes": 5,
    "author": "Vedoy Insights",
    "editor": "Eiolf-Leander Haugsnes Vedøy",
    "disclosure": "Vedoy Insights er utgitt av Vedøy, som utvikler Vedoy Collective. Artikkelen gir generell veiledning, ikke juridisk rådgivning. Samarbeid og produkttillatelser må avklares konkret.",
    "articleCta": {
      "eyebrow": "KUNST OG KREATIVE SAMARBEID",
      "title": "Vedoy Collective",
      "description": "Vi utvikler løsninger for kunstnere og produktkolleksjoner.",
      "href": "https://vedoycollective.com",
      "linkText": "Se Vedoy Collective"
    },
    "sections": [
      {
        "heading": "Kort svar: slik kommer du i gang",
        "paragraphs": [
          "Velg noen få motiver, avklar skriftlig hvilke produkter og kanaler kunsten kan brukes i, bestill prøveplagg, beregn en bærekraftig salgspris og innhent godkjenning før publisering.",
          "Hos Vedoy Collective arbeider vi med forhåndsvisning av kunstnerprodukter og en tydelig godkjenningsprosess. Produktforslag er ikke det samme som godkjente produkter."
        ]
      },
      {
        "heading": "Hvem eier kunsten når den trykkes på klær?",
        "paragraphs": [
          "Som utgangspunkt beholder kunstneren opphavsretten med mindre annet er avtalt. En avtale om bruk på klær gir ikke automatisk rett til å bruke motivet i spill, premier eller andre markedsføringsflater.",
          "Avklar motiv, trykkplassering, varighet, geografisk marked, eksklusivitet, kreditering og retten til å endre designet."
        ]
      },
      {
        "heading": "Hva bør kunstneren tjene per salg?",
        "paragraphs": [
          "Det finnes ingen universell riktig prosentsats. En avtale bør presisere om andelen beregnes av omsetning, bruttofortjeneste eller nettofortjeneste, og hvilke kostnader som trekkes fra.",
          "Eksempel: Hvis salgsprisen er 500 kr og avtalte kostnader er 300 kr, blir beregningsgrunnlaget 200 kr. Ved 50 % av dette grunnlaget blir kunstnerandelen 100 kr. Tallene er kun et regneeksempel og forutsetter at avtalen definerer kostnadene slik."
        ]
      },
      {
        "heading": "Sjekkliste før lansering",
        "paragraphs": [
          "Kontroller produktbilder, materialer, størrelser, pris, kvalitet på prøveplagg, godkjenning av kunstner, leveringsvilkår og returhåndtering. La gjerne kunstneren kommentere hvert enkelt produkt.",
          "Et godt samarbeid handler ikke bare om salg. Kunstneren bør kunne si nei til enkeltprodukter og til nye bruksområder uten å måtte avvise hele kolleksjonen."
        ]
      }
    ]
  },
  {
    "slug": "kan-lojalitetspoeng-brukes-pa-alle-produkter",
    "title": "Kan lojalitetspoeng brukes på alle produkter? Slik fungerer unntak",
    "excerpt": "Hva betyr det når et produkt er unntatt bonuspoeng, rabatter eller spillpremier? En enkel forklaring for kunder, skapere og nettbutikker.",
    "category": "Lojalitet og netthandel",
    "publishedAt": "2026-11-07T15:59:00+01:00",
    "readingMinutes": 4,
    "author": "Vedoy Insights",
    "editor": "Eiolf-Leander Haugsnes Vedøy",
    "disclosure": "Vedoy Coins og tilknyttede appfunksjoner omtales som planlagte løsninger. Reglene for faktiske kjøp og fordeler må fremgå av gjeldende vilkår ved lansering.",
    "articleCta": {
      "eyebrow": "LOJALITET OG KREATIV HANDEL",
      "title": "Vedoy Collective",
      "description": "Les om plattformen vi bygger for klær, kunst og digitale opplevelser.",
      "href": "https://vedoycollective.com",
      "linkText": "Utforsk Collective"
    },
    "sections": [
      {
        "heading": "Kort svar: nei, ikke nødvendigvis",
        "paragraphs": [
          "En nettbutikk kan ha ulike regler for forskjellige produkter, men vilkårene må være tydelige. Et produkt kan være unntatt opptjening av poeng, bruk av poeng eller rabattkampanjer.",
          "Det bør stå på produktsiden før betaling hva som gjelder, slik at kunden ikke oppdager begrensningen først i kassen."
        ]
      },
      {
        "heading": "Hvorfor blir enkelte produkter unntatt?",
        "paragraphs": [
          "Vanlige grunner kan være særskilte kunstneravtaler, små marginer, begrensede opplag eller andre kampanjevilkår. «Eksklusiv» betyr likevel ikke automatisk «ingen bonuspoeng».",
          "Et forståelig merke kan være: «Dette produktet er unntatt Vedoy Coins i henhold til egne samarbeidsvilkår.» Konfidensielle avtaledetaljer trenger ikke publiseres."
        ]
      },
      {
        "heading": "Hva med spill og premier?",
        "paragraphs": [
          "Det er forskjell på å vise et produkt i en app og å bruke kunstverket som spillpremie eller del av spillets grafikk. Sistnevnte kan kreve en egen tillatelse fra rettighetshaveren.",
          "Vedoy Collective ønsker å gjøre det mulig for samarbeidspartnere å velge deltakelse i app, poengordninger og kampanjer hver for seg. Dette er en planlagt arbeidsflyt, ikke en bekreftelse på at alle valgene er ferdig utviklet."
        ]
      },
      {
        "heading": "Slik kan en butikk gjøre det ryddig",
        "paragraphs": [
          "Bruk separate innstillinger for poengopptjening, poenginnløsning, rabatt, appvisning og spillbruk. Dokumenter hvem som godkjente hva, og når.",
          "Kunder bør se en kort forklaring. Samarbeidspartnere bør ha en privat oversikt med mer detaljerte rettigheter."
        ]
      }
    ]
  },
  {
    "slug": "black-friday-nettbutikk-forpris-og-rabatt",
    "title": "Black Friday for nettbutikker: førpris, rabatt og lønnsomhet",
    "excerpt": "Hvordan planlegge Black Friday og Black Weekend i Norge? Lær om 30-dagersregelen, prismerking, marginer og en praktisk sjekkliste.",
    "category": "Markedsføring og handel",
    "publishedAt": "2026-11-07T15:58:00+01:00",
    "readingMinutes": 5,
    "author": "Vedoy Insights",
    "editor": "Eiolf-Leander Haugsnes Vedøy",
    "disclosure": "Generell informasjon, ikke juridisk rådgivning. Kontroller oppdaterte regler hos Forbrukertilsynet og faktisk prishistorikk før kampanjer publiseres.",
    "articleCta": {
      "eyebrow": "DIGITAL HANDEL",
      "title": "Vedoy Studio",
      "description": "Utforsk nettsider og digitale verktøy for bedrifter.",
      "href": "https://vedoystudio.no",
      "linkText": "Se Vedoy Studio"
    },
    "sections": [
      {
        "heading": "Når er Black Friday i 2026?",
        "paragraphs": [
          "Black Friday er fredag 27. november 2026, og Cyber Monday er mandag 30. november. Black Weekend brukes ofte om kampanjeperioden mellom disse dagene.",
          "En nettbutikk som lanseres 15. november, har 12 dager frem til Black Friday. Det gir tid til å teste bestillinger og produktpresentasjon, men ikke til å bygge opp en kunstig førpris."
        ]
      },
      {
        "heading": "Hva er 30-dagersregelen for førpris?",
        "paragraphs": [
          "Ved markedsføring av prisnedsettelser er hovedregelen i Norge at førprisen skal være den laveste prisen virksomheten har brukt i minst de 30 dagene før salget startet, jf. prisopplysningsforskriften § 9a.",
          "Ikke vis en rabattprosent basert på en vilkårlig veiledende pris. Nye varer med kort prishistorikk krever særskilt vurdering før de markedsføres med avslag. Se Forbrukertilsynets veiledning på forbrukertilsynet.no."
        ]
      },
      {
        "heading": "Hvordan beregne om en rabatt lønner seg?",
        "paragraphs": [
          "Eksempel: Et produkt selges for 500 kr og har 300 kr i relevante kostnader. Bidraget før rabatt er 200 kr. Ved 20 % rabatt blir salgsprisen 400 kr og bidraget 100 kr, hvis kostnadene ellers er uendret.",
          "Regn også inn betalingsgebyrer, frakt, retur, markedsføring og eventuelle kunstnerandeler. Høy omsetning betyr ikke automatisk høy fortjeneste."
        ]
      },
      {
        "heading": "Hva bør nettbutikken gjøre før kampanjen?",
        "paragraphs": [
          "Sjekk produktdata, prislogg, lager eller leverandørkapasitet, betalingsflyt, leveringstid, returvilkår og kundeservice. Velg heller få tydelige tilbud enn rabatter som ikke tåler kostnadene.",
          "Vedoy Collective vurderer lanserings- og kampanjeplanlegging for kreative kolleksjoner. Produkter med kunstneravtaler bør ikke settes på tilbud uten at pris og rettigheter er avklart."
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
