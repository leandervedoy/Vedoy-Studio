export type ReaderLevel = "standard" | "beginner" | "intermediate" | "advanced";
export type LevelSection = { heading: string; paragraphs: string[] };
export const INSIGHT_LEVEL_CONTENT: Record<string, Partial<Record<Exclude<ReaderLevel, "standard">, LevelSection[]>>> = {
  "hvordan-selge-kunst-pa-klaer": {
    "beginner": [
      {
        "heading": "Hva er print-on-demand?",
        "paragraphs": [
          "Print-on-demand betyr at plagget produseres eller trykkes når kunden bestiller. Du trenger vanligvis ikke kjøpe inn et stort lager på forhånd."
        ]
      },
      {
        "heading": "Hva trenger jeg?",
        "paragraphs": [
          "Du trenger et motiv du har rett til å bruke, en leverandør, en nettbutikk eller samarbeidspartner og en avtale om pris og bruk."
        ]
      },
      {
        "heading": "Hva er viktigst først?",
        "paragraphs": [
          "Bestill et prøveplagg og få skriftlig godkjenning av motiv, farge og plassering før salget åpner."
        ]
      }
    ],
    "intermediate": [
      {
        "heading": "Slik beregner du kunstnerandelen",
        "paragraphs": [
          "Lag et regneark med salgspris, produksjon, frakt, gebyrer, returer og avtalte fradrag. Avtal om andelen gjelder omsetning eller et definert fortjenestegrunnlag."
        ]
      },
      {
        "heading": "Slik organiserer du godkjenning",
        "paragraphs": [
          "Gi hvert produkt en status: forslag, endring ønsket eller godkjent. Lagre godkjent versjon, dato og hvem som godkjente."
        ]
      },
      {
        "heading": "Slik tester du etterspørsel",
        "paragraphs": [
          "Start med et lite utvalg, mål klikk og kjøp per produkt og juster basert på tilbakemeldinger, ikke bare antall visninger."
        ]
      }
    ],
    "advanced": [
      {
        "heading": "Datamodell for rettigheter",
        "paragraphs": [
          "Bruk creator_id, artwork_id, product_id, license_scope, channels, valid_from, valid_until, approval_version og approved_at. Skill rettighet til trykk fra markedsføring og spillbruk."
        ]
      },
      {
        "heading": "Integrasjon med Shopify",
        "paragraphs": [
          "Hent produkter på serveren gjennom Admin GraphQL API, bruk produkt-GID som stabil nøkkel, synkroniser endringer med webhooks og sørg for idempotent behandling."
        ]
      },
      {
        "heading": "Sikkerhet og revisjon",
        "paragraphs": [
          "Bruk tilgangsstyring per samarbeidspartner, RLS i databasen, hendelseslogg for godkjenning og serverlagrede API-nøkler. Ikke la en ny synkronisering overskrive tidligere godkjenningshistorikk."
        ]
      }
    ]
  },
  "kan-lojalitetspoeng-brukes-pa-alle-produkter": {
    "beginner": [
      {
        "heading": "Hva er lojalitetspoeng?",
        "paragraphs": [
          "Poeng er en belønning enkelte butikker gir når du handler. Poengene kan gi fordeler senere, hvis vilkårene tillater det."
        ]
      },
      {
        "heading": "Hvorfor får jeg ikke poeng på alt?",
        "paragraphs": [
          "Noen varer kan ha egne avtaler eller begrensninger. Butikken bør opplyse om unntak før du betaler."
        ]
      },
      {
        "heading": "Er eksklusive produkter alltid unntatt?",
        "paragraphs": [
          "Nei. Et begrenset opplag og et unntak fra poeng er to ulike ting."
        ]
      }
    ],
    "intermediate": [
      {
        "heading": "Skill opptjening fra innløsning",
        "paragraphs": [
          "Et produkt kan gi poeng ved kjøp, men ikke kunne betales med poeng. Vis begge reglene separat."
        ]
      },
      {
        "heading": "Slik forklarer du unntak",
        "paragraphs": [
          "Bruk en kort tekst på produktsiden og en egen vilkårsside med eksempler. Unngå å avsløre private avtalevilkår."
        ]
      },
      {
        "heading": "Tenk på økonomien",
        "paragraphs": [
          "Regn poeng som en mulig fremtidig kostnad og vurder marginen før du inkluderer kunstnerprodukter i kampanjer."
        ]
      }
    ],
    "advanced": [
      {
        "heading": "En enkel policy-motor",
        "paragraphs": [
          "Definer canEarnCoins, canRedeemCoins, canDiscount, canShowInApp og canUseInGames per produkt, med fallback til kolleksjon og avtale."
        ]
      },
      {
        "heading": "Sikre transaksjoner",
        "paragraphs": [
          "Beregn poeng på serveren fra betalte ordrelinjer, håndter returer med reversering og bruk idempotency keys for å hindre dobbel opptjening."
        ]
      },
      {
        "heading": "Databeskyttelse",
        "paragraphs": [
          "Lagre minste nødvendige kundedata, før revisjonslogg og avklar behandlingsgrunnlag og slettefrister. Skill offentlige produktflagg fra private samarbeidsavtaler."
        ]
      }
    ]
  },
  "black-friday-nettbutikk-forpris-og-rabatt": {
    "beginner": [
      {
        "heading": "Hva er Black Friday?",
        "paragraphs": [
          "En kampanjedag med tilbud, i 2026 fredag 27. november. Mange butikker fortsetter tilbudene gjennom helgen."
        ]
      },
      {
        "heading": "Er 50 % rabatt alltid et godt kjøp?",
        "paragraphs": [
          "Nei. Se på faktisk pris, frakt og kvalitet. En stor prosent betyr lite hvis førprisen ikke er reell."
        ]
      },
      {
        "heading": "Hva er førpris?",
        "paragraphs": [
          "Førpris er prisen et tilbud sammenlignes med. I Norge gjelder egne regler for hvordan den beregnes."
        ]
      }
    ],
    "intermediate": [
      {
        "heading": "Hva betyr laveste pris siste 30 dager?",
        "paragraphs": [
          "Ved markedsført prisnedsettelse er hovedregelen at førprisen er laveste pris brukt i minst de siste 30 dagene. Dokumenter prisendringer."
        ]
      },
      {
        "heading": "Regn ut bidrag etter rabatt",
        "paragraphs": [
          "Trekk relevante kostnader fra kampanjeprisen. Sammenlign bidrag per ordre med ordinært salg og forventet volum."
        ]
      },
      {
        "heading": "Velg riktig tilbudstype",
        "paragraphs": [
          "Ikke kall en introduksjonspris et prisavslag fra en udokumentert førpris. Vurder produktpakker eller tydelig ordinær pris når reglene krever det."
        ]
      }
    ],
    "advanced": [
      {
        "heading": "Prislogg og kampanjeregler",
        "paragraphs": [
          "Lagre product_variant_id, price, currency, valid_from, valid_to og kanal. Beregn referansepris fra dokumentert historikk før kampanjepublisering."
        ]
      },
      {
        "heading": "Analyse av lønnsomhet",
        "paragraphs": [
          "Mål dekningsbidrag etter rabatt, CAC, konverteringsrate, returer og gjennomsnittlig ordreverdi. Skill brutto omsetning fra netto effekt."
        ]
      },
      {
        "heading": "Teknisk kontroll",
        "paragraphs": [
          "Lag automatiserte tester for førpris, rabattkodekombinasjoner, avgifter og kunstnerprovisjon. Behold audit-logg og ha mulighet til å stoppe feilprising raskt."
        ]
      }
    ]
  }
};
