# Vedoy Deliver – budmedlemskap og oppdrag

En separat Next.js-basert MVP for lokale leveringsoppdrag. Målgruppen for budsøknader er 15–25 år, med særskilt vurdering av arbeidstid, oppgavetype, rutelengde og trafikksikkerhet for mindreårige.

## Funksjoner

- Søknad om medlemskap via Supabase e-postinnlogging. Søknaden starter som `pending`.
- Aldersgruppe 15–17, 18–20 eller 21–25, ønsket transportform og tilgjengelighet.
- Oppdragskort med forhåndsvisning av godtgjørelse, tidsestimat, transport og område.
- Kun godkjente bud kan kreve et ekte oppdrag; samme oppdrag kan bare tildeles én person.
- Avsender- og mottakeradresse holdes privat til budet får oppdraget.
- Statusflyt: ledig → tildelt → hentet → levert → manuelt godkjent.
- Godkjent opptjening vises separat fra oppdrag som venter på kontroll.
- Bedrifter kan sende en uforpliktende forespørsel om leveringsbehov.
- Demooppdrag er merket og kan aldri aksepteres.
- Mobiltilpasset grensesnitt, tastaturnavigasjon og hensyn til redusert bevegelse.

## Utvikling

```bash
cd apps/vedoy-deliver
npm install
npm run typecheck
npm run test
npm run build
npm run dev
```

`app/page.tsx` bruker en egen React-komponent. Prosjektet må publiseres som et **separat Vercel-prosjekt** med Root Directory `apps/vedoy-deliver`, slik at Vedoy Studio ikke endres.

## Supabase (før ekte pilot)

1. Opprett et eget Supabase-prosjekt og kjør `supabase/schema.sql` i SQL Editor. SQL er **ikke kjørt i et eksternt prosjekt**.
2. Sett `NEXT_PUBLIC_SUPABASE_URL` og `NEXT_PUBLIC_SUPABASE_ANON_KEY` i prosjektets miljøvariabler.
3. Aktiver e-post-OTP i Supabase Auth og hvitelist riktig redirect-URL.
4. Test RLS med to vanlige budkontoer, en pending konto og en administrator. Bekreft at en annen brukers adresse aldri kan leses.
5. Verifiser alder, identitet, arbeiderstatus, transportmåte, sikkerhet og arbeidsavtale manuelt før `vdeliver_couriers.status` settes til `approved`. Sett `minor_checked=true` for godkjente mindreårige etter særskilt vurdering.
6. Opprett virkelige leveringer via en gjennomgått administrativ prosess, inkludert private adresser.
7. Godkjenn `delivered` til `verified` manuelt etter kvalitetskontroll. Det utløser **ikke** lønnsutbetaling.

## Sikkerhets- og driftsbegrensninger

- Ingen ekte leveringer, automatisk dispatch, Wolt Drive, betaling, BankID, billeveringsbevis eller lønnskjøring er aktivert.
- Oppdragsbeløpene i demonstrasjonen er **fiktive eksempler**, ikke lønnstilbud.
- Yngre bud kan kun bruke gange/sykkel, og bare etter at en konkret rute er sikkerhetsgodkjent. Profilens selvrapporterte aldersgruppe er aldri tilstrekkelig som identitetsbevis.
- Utbetaling per oppdrag er ikke et bevis for at personen er selvstendig næringsdrivende. Vurder arbeidsforhold, minstelønn der den gjelder, feriepenger, arbeidstid, ulykkesforsikring, skatterapportering og HMS.
- Innfør personvernrutiner, dataminimering, sletting av leveringsadresser og ansvar for mattransport før produksjon.
- Wolt Drive kan først aktiveres hvis kommersiell avtale, API-tilgang, pris og faktisk lokal dekning er verifisert.

## Status

Kildekode/MVP for testing. **Ikke produksjonssatt**, og uten bekreftet databasemigrering eller Vercel-bygg. En eventuell teknisk/visuell byggekontroll og utprøving mot ekte Supabase er fortsatt nødvendig.
