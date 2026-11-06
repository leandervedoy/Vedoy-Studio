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

Nettsiden er publisert på https://vedoy-deliver.vercel.app som en **offentlig pilot**. Supabase-tabeller og RLS er opprettet, og miljøvariabler er lagt inn i Vercel. Oppdrag og private adresser har strenge rollerettigheter. E-postinnlogging, godkjenningsflyt og tilgangskontroll mellom flere faktiske brukerkontoer er ennå ikke ende-til-ende-verifisert. **Ingen ekte budoppdrag, betalingsflyt, BankID-verifisering eller lønnskjøring er åpnet.**

## Signicat BankID (påbegynt, ikke verifisert)

- Ny knapp i budprofil starter `POST /api/identity/start` med Supabase access token.
- Start- og callback-ruter bruker server-only credentials, tilfeldig state, HttpOnly-cookie og server-side statusoppslag.
- `supabase/identity.sql` legger til private identitetssesjoner og verifiseringsmarkør. Kjør etter `schema.sql`.
- Konfigurer servervariablene i `.env.example` i en hemmelighetshåndterer. Ikke legg BankID-data eller service-role-nøkler i nettleseren.
- **Kritisk:** Signicats faktiske konto-/API-kontrakt, provider-ID, attributter og statusverdier må verifiseres mot din Signicat-konfigurasjon. Ingen autentisering er testet ende til ende.
- **Kritisk:** Koble identitetsstatus inn i admin-godkjenning og tildelingsreglene før produksjon; identitet alene gir aldri rett til oppdrag.
- Ikke aktiver reelle verifiseringer før det finnes databehandleravtale, personvernerklæring, sletterutiner og samtykke/annet gyldig behandlingsgrunnlag.
- Ytterligere utestående: adminpanel, oppdragsoppretting, varsler, rute/kart, utbetalingssystem, Wolt Drive, juridiske arbeidsgiverkontroller og ende-til-ende-tester.
