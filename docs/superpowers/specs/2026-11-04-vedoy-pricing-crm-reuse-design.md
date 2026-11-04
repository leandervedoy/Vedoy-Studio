# Vedøy Studio: gjenbruk i prisforespørsler

> Område: Vedøy Pricing / Vedøy Manager, ikke et nytt CRM.

## Arkitektur og eksisterende prosjekter
- Vedøy Developer Portal forblir offentlig, autoritativt API for publiserte priser fra Supabase-tabellen `vedoy_price_catalog`.
- Vedøy Studio er hovedversjonen av Growth. Gjenbruk `lib/repository.ts` og Neon-tabellen `contact_requests` til leads, i stedet for å kreve en ny hemmelig Supabase-nøkkel for ordinære henvendelser.
- Gjenbruk `createGrowthNotification` i samme repository for varsler til Studio.
- Behold Vedøy OAuth/Studio-signert session for beskyttede adminfunksjoner; ingen nye passordsystemer.
- Behold Vedøy Booking og Notes gjennom eksisterende workspace-pakker; ikke kopier bibliotekene.
- Komponentbiblioteket i `vedoy-growth` er et designbibliotek, ikke et stabilt versjonert runtime-API. Ikke importér kildefiler direkte på tvers av to deployed apper.

## Sikker prisforespørsel
- UI sender kun pakke-ID og kontaktdetaljer til `POST /api/pricing/leads`.
- Serveren slår opp den publiserte katalogen på nytt via Developer Portal. Nettleserens beløp blir aldri brukt.
- Pris, oppsett, valuta, mva og katalogversjon skrives som tekstsnapshot i Studio-CRM.
- Kundeforespørselen vises i /studio/requests og får Growth-varsling; feilet varsel er ikke feilet lagring.
- Origin-sjekk, bot-honeypot og databasebasert per-epost kvote (maks tre/time); Turnstile brukes hvis secret er konfigurert. Rategrensen alene er ikke fullverdig anti-bot-beskyttelse og må vurderes før stor kampanje.
- Et lagret lead er ikke en inngått avtale eller en betalt bestilling.

## Eksisterende avgrensninger
- Konfigurer `VEDOY_SUPABASE_SECRET_KEY` separat for Vedøy Manager (admin-skriving). Dette leadarbeidet legger ikke inn en utrygg nøkkel eller omgår dette kravet.
- Vedøy Owner-rolle og øvrige bedriftsroller må få egen gjennomgang av server-side autorisasjon før nye moduler aktiveres for kunder.
- Pris-API-et er offentlig for publiserte oppføringer. Private katalogutkast blir ikke eksponert.
