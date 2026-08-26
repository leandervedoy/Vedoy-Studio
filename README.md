# Vedøy Studio Full-stack

Et stort Next.js-prosjekt som samler flest mulig av Vedøy-idéene i én sammenhengende og visuelt gjennomført plattform:

- Vedøy Domains
- Vedøy Hosting og prosjektoversikt
- Vedøy Builder-prototype
- Vedøy Booking-pakken
- Vedøy Notes med notatbøker, historikk, vedlegg og deling
- Vedøy CRM
- Vedøy E-post-prototype
- Vedøy Statistics
- Vedi AI
- Vedøy Academy
- API-nøkler og utviklerdokumentasjon
- Databaseoversikt
- Overvåkning
- Vedøy Assist

## 1. Start prosjektet

**Windows PowerShell**

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

**macOS / Linux**

```bash
npm install
cp .env.example .env.local
npm run dev
```

Åpne `http://localhost:3000`.

Når `NEXT_PUBLIC_DEMO_MODE=true`, kan du logge inn med:

```text
demo@vedoy.no
vedoydemo
```

## 2. Bygg og test

```bash
npm run check:project
npm run typecheck
npm run build
npm start
```

## 3. Data

Uten `DATABASE_URL` bruker appen et minnelager på serveren. Det er fint for design, demo og lokal utvikling, men data nullstilles ved omstart.

For varig data:

1. Opprett PostgreSQL hos for eksempel Neon, Supabase, Railway eller Prisma Postgres.
2. Legg adressen i `.env.local`:

```env
DATABASE_URL=postgresql://...
```

3. Kjør:

```bash
npm run db:setup
```

Datamodellen ligger i `data/schema.sql`.

Vedøy Notes krever PostgreSQL for varig lagring. Ved oppgradering av en eksisterende installasjon kjøres:

```bash
npm run db:migrate:notes-workspace
npm run db:migrate:notes-advanced
```

## 4. Vedi AI

Vedi bruker trygg demomodus uten nøkkel. For ekte KI-svar legger du inn:

```env
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5-mini
```

Nøkkelen brukes bare på serveren via `/api/ai` og skal aldri ha prefikset `NEXT_PUBLIC_`.

## 5. Booking

Den gjenbrukbare pakken ligger i:

```text
packages/booking
```

Appen importerer den som:

```tsx
import { BookingCalendar } from "@vedoy/booking";
import "@vedoy/booking/styles.css";
```

Den offentlige bookingdemoen bruker et API-adapter mot `/api/bookings`. Adminsiden har bestillingskalender, kundevisning, åpningstider og tjeneste-/planredigering.

## 6. Vedøy Notes

Notes under `/studio/notes` lagrer notatbøker, seksjoner, nøkkelord, sjekklister og festede sider i PostgreSQL. Hver lagring lager en gjenopprettbar versjon. Vedlegg støtter PNG, JPG, WebP, PDF og tekst opptil 2 MB og lagres privat i databasen.

Delingslenker er tilfeldige, skrivebeskyttede og kan deaktiveres av administrator. Delte sider har `noindex`, men alle med lenken kan lese innholdet. Nettleseren beholder dessuten en lokal kladd ved nettbrudd; den erstatter ikke full offline-synk mellom enheter.

## 7. Deploy til Vercel

1. Push hele mappen til GitHub.
2. Importer repoet i Vercel med rotmappe satt til prosjektroten.
3. Legg inn miljøvariabler fra `.env.example`.
4. Koble PostgreSQL og kjør `npm run db:setup` mot databasen.
5. Sett `NEXT_PUBLIC_DEMO_MODE=false` før ekte kundedrift.

## 8. Hosting, domene og betaling

Den offentlige siden `/tjenester/hosting-og-domene` har en servervalidert konfigurator for 1–5 servere, RAM, lagring, region, backup og domene. Betalingen opprettes på serveren og sendes til Stripe Checkout. Pris kan ikke endres fra nettleseren.

### Stripe

Vercel Marketplace-ressursen kan brukes i testmodus med `STRIPE_SECRET_KEY`. For produksjon må Stripe-ressursen være koblet til riktig Stripe-konto og webhooken må peke til:

```text
https://vedoy-studio.vercel.app/api/stripe/webhook
```

Legg signeringsnøkkelen i `STRIPE_WEBHOOK_SECRET`. Webhooken lytter til `checkout.session.completed` og `checkout.session.async_payment_succeeded`. Sett `STRIPE_AUTOMATIC_TAX=true` først når Stripe Tax har en gyldig hovedkontoradresse; ellers behold `false`.

### Domener

Live søk og kjøp bruker Vercel Registrar API. Opprett en Vercel Access Token med nødvendig domenetilgang og legg den i:

```env
VERCEL_REGISTRAR_TOKEN=...
VERCEL_REGISTRAR_TEAM_ID=team_...
DOMAIN_USD_NOK_RATE=12
```

Uten token er «Kjøp nytt domene» bevisst deaktivert. Eksisterende domene kan fortsatt velges.

### Automatisk serverklargjøring

Betalte ordre kan opprette Hetzner Cloud-servere og lagringsvolumer automatisk:

```env
HETZNER_API_TOKEN=...
HETZNER_SSH_KEY_NAMES=vedoy-production
HETZNER_IMAGE=ubuntu-24.04
```

Uten disse variablene registreres betalingen og ordrekonfigurasjonen hos Stripe, mens klargjøringen må gjøres manuelt. Ikke aktiver live betaling før minst én av disse leveringsrutinene er operativ og testet.

## Hva er reelt og hva er prototype?

### Fungerer i prosjektet

- Full markedsføringsside og responsivt Studio-dashboard
- Innlogging med signert, HTTP-only cookie
- Prosjekt-API med opprettelse
- Booking-API med konfliktkontroll
- Seks klikkbare tjenestesider med egne leveranser, prosess og neste steg
- Hostingkonfigurator med servervalidert pris
- Stripe Checkout for abonnement, etablering og eventuell domeneregistrering
- Live Vercel Registrar-adapter for søk, pris og kjøp når token er konfigurert
- Hetzner Cloud-adapter med idempotent server- og volumoppretting når token og SSH-nøkler er konfigurert
- Supporthenvendelser
- API-nøkler med hash ved databasebruk
- PostgreSQL-adapter og minnebasert demo
- Vedi med OpenAI Responses API eller smart demomodus
- Lokal `@vedoy/booking`-pakke

### Krever aktivering før ekte salg

- Stripe-ressursen må kobles til en live Stripe-konto, og produksjonswebhook må ha signeringsnøkkel
- Domenekjøp krever `VERCEL_REGISTRAR_TOKEN`
- Automatisk serverlevering krever Hetzner-token og minst én SSH-nøkkel; ellers brukes dokumentert manuell levering
- Automatisk Vercel/Cloudflare-deploy
- E-postsending og postbokser
- Vipps-betaling
- SMS-varsler
- Google/Outlook-kalendersynk
- Full multi-tenant autentisering, roller og fakturering
- Dra-og-slipp-nettsidebygger

## Produksjonssjekkliste

- Bytt enkel admininnlogging med Auth.js, Clerk eller annen identitetsleverandør.
- Bruk sterk `SESSION_SECRET` og separate produksjonsnøkler.
- Legg alle leverandørhandlinger på serveren og valider tilgang per organisasjon.
- Gjennomfør tilgjengelighets-, sikkerhets- og personverntest.
- Få bestillingsvilkår, personvernerklæring og databehandleroppsett kvalitetssikret for virksomhetens faktiske drift.
- Kvalitetssikre priser og kostnader før de vises som ekte tilbud.

## Teknisk retning

Prosjektet bruker Next.js App Router og Route Handlers. PostgreSQL-laget er bevisst tynt, slik at det senere kan byttes til Prisma, Drizzle eller en egen Vedøy Database-adapter uten å bygge om UI-et.
