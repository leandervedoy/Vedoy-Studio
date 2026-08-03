# Vedøy Studio Full-stack

Et stort Next.js-prosjekt som samler flest mulig av Vedøy-idéene i én sammenhengende og visuelt gjennomført plattform:

- Vedøy Domains
- Vedøy Hosting og prosjektoversikt
- Vedøy Builder-prototype
- Vedøy Booking-pakken
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

## 6. Deploy til Vercel

1. Push hele mappen til GitHub.
2. Importer repoet i Vercel med rotmappe satt til prosjektroten.
3. Legg inn miljøvariabler fra `.env.example`.
4. Koble PostgreSQL og kjør `npm run db:setup` mot databasen.
5. Sett `NEXT_PUBLIC_DEMO_MODE=false` før ekte kundedrift.

## Hva er reelt og hva er prototype?

### Fungerer i prosjektet

- Full markedsføringsside og responsivt Studio-dashboard
- Innlogging med signert, HTTP-only cookie
- Prosjekt-API med opprettelse
- Booking-API med konfliktkontroll
- Domenesøk med deterministiske demodata
- Supporthenvendelser
- API-nøkler med hash ved databasebruk
- PostgreSQL-adapter og minnebasert demo
- Vedi med OpenAI Responses API eller smart demomodus
- Lokal `@vedoy/booking`-pakke

### Krever ekstern leverandør før salg

- Faktisk registrering og betaling av domener
- Automatisk Vercel/Cloudflare-deploy
- E-postsending og postbokser
- Stripe/Vipps-betaling
- SMS-varsler
- Google/Outlook-kalendersynk
- Full multi-tenant autentisering, roller og fakturering
- Dra-og-slipp-nettsidebygger

## Produksjonssjekkliste

- Bytt enkel admininnlogging med Auth.js, Clerk eller annen identitetsleverandør.
- Bruk sterk `SESSION_SECRET` og separate produksjonsnøkler.
- Legg alle leverandørhandlinger på serveren og valider tilgang per organisasjon.
- Gjennomfør tilgjengelighets-, sikkerhets- og personverntest.
- Opprett vilkår, personvernerklæring og databehandleroversikt.
- Kvalitetssikre priser og kostnader før de vises som ekte tilbud.

## Teknisk retning

Prosjektet bruker Next.js App Router og Route Handlers. PostgreSQL-laget er bevisst tynt, slik at det senere kan byttes til Prisma, Drizzle eller en egen Vedøy Database-adapter uten å bygge om UI-et.
