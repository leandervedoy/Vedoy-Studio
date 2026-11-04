# Vedøy Manager, Pricing og Developer Portal

## Systemkart

1. Vedøy Manager på `/studio/vedoy-manager` redigerer priser og redigerbare hovedseksjoner.
2. Data lagres i Vedøy-prosjektets Supabase-database (`vedoy_price_catalog`, `vedoy_site_content`).
3. Vedøy Developer Portal eksponerer kun **publiserte** data gjennom `GET /api/v1/pricing` og `GET /api/v1/site-content`.
4. Vedoystudio.no leser de samme dataene gjennom Developer Portal. Ingen kopier av gjeldende pakkebeløp skal legges inn i frontend-kode.
5. Forespørsler går kun via `POST /api/pricing/leads`, med Cloudflare Turnstile, ratebegrensning og servervalidering.

## Nødvendig Vercel-konfigurasjon (vedoy-studio)

```dotenv
VEDOY_DEVELOPER_API_BASE_URL=https://vedoy-dev-portal.vercel.app/api
VEDOY_SUPABASE_URL=https://niedmgyyougvgiiuwcvw.supabase.co
VEDOY_SUPABASE_SECRET_KEY=         # Supabase secret API key, bare server!
NEXT_PUBLIC_TURNSTILE_SITE_KEY=   # Cloudflare Turnstile public site key
TURNSTILE_SECRET_KEY=             # Cloudflare Turnstile secret, bare server!
VEDOY_PRICING_HASH_SECRET=        # Tilfeldig verdi minst 32 tegn, bare server!
```

Alle hemmeligheter legges inn direkte i Vercel; aldri commit i GitHub eller bruk `NEXT_PUBLIC_` på secret-verdier. Sett hostnames for Turnstile til den faktiske domenelisten. Ved feil eller manglende konfigurasjon skal innsendinger/administrasjon feile lukket med en synlig feilmelding, ikke simulere suksess.

## Administrator og innlogging

Vedøy Studio bruker eksisterende Vedøy OAuth/Neon-innlogging. Vedøy Manager åpnes kun når OAuth-userinfo eksplisitt sier `email_verified = true` og e-posten er nøyaktig `leander@vedoy.store`. Callback utsteder da en signert `vedoy_owner`-sesjon. Hver manager-side og hvert manager-endepunkt kontrollerer både rolle og e-post; bruker med `owner` eller `admin` har ikke tilgang til Manager. Logg inn på nytt for å få den nye sesjonsrollen.

Bedriftseiere med sesjonsrollen `owner` kan opprette og redigere egne roller via `/studio/roles`. Den spesielle rollen `vedoy_owner` finnes ikke i rollelisten og kan aldri tildeles der.

**Begrensning i denne versjonen:** Dette er et første RBAC-lag for rolleregister og nye moduler. Eldre API-ruter i Vedøy Studio bruker fortsatt sine eksisterende rolle- og abonnementskontroller og må migreres før egendefinerte tillatelser håndheves for hele plattformen. Ikke anta at skjulte menypunkter alene er tilgangskontroll.

## Sikkerhet

- Publiserte priser og nettsidetekster: Supabase public select-policy med RLS.
- Utkast, roller, audit og leads: RLS aktivert, ingen anon/authenticated privileges, kun serverbasert Supabase secret API key.
- Manager-write: serververifisert `vedoy_owner`, strengt Origin-sjekk og Zod-validering.
- Prisoppdatering: optimistisk versjonskontroll, returnerer 409 ved konflikt.
- Alle prisbeløp lagres i **øre**, med valutakode NOK og eksplisitt mva-modus.
- Etter endring hentes oppdatert pris via Developer Portal. Developer Portal edge cache kan gi opptil ~30 sekunders forsinkelse.
- PII i prisforespørsler holdes privat; oppdater personverninformasjon og innfør dokumentert sletting/lagringstid før produksjonslansering.

## Gjenstående integrasjoner

- Oppdater eldre prisvisninger i `components/service-pricing.tsx` og andre Vedøy-apper til å bruke Developer Portal før man kan si at **alle** priser er synkronisert.
- Rull ut rolle-policy til øvrige API-endepunkter og organisasjoner.
- Verifiser Turnstile på produksjonsdomene, e-postvarsling og GDPR-rutiner.
- Kjør full manuell QA og gjennomgang av sikkerhet før produksjonsmerge.
