# Vedøy Trust

Vedøy Trust er et separat produkt for små og mellomstore arbeidsplasser: fortrolige saker, tillitsvalgt, verneombud, HMS/avvik og rettighetsinformasjon.

## Vedøy-prinsipper

1. Enkelt språk før fagspråk.
2. Minst mulig data.
3. Fortrolighet er en tilgangsregel, ikke en etikett.
4. Leder/admin får aldri automatisk tilgang til fortrolige saker.
5. Vedi/AI er et hjelpelag, aldri autorisasjonslaget.
6. Appen skal forklare hva som skjer videre.
7. Tillitsvalgt og verneombud er separate roller.
8. Kritiske sikkerhetsregler håndheves i databasen med RLS.

## Teknologi

- Next.js 16
- React 19
- Supabase Auth + PostgreSQL + RLS
- Vercel som separat deployment når prosjektoppretting er aktivert

## Lokal oppstart

Kopier .env.example til .env.local og fyll inn Supabase URL og publishable key.

npm install
npm run dev

## Supabase

Datamodellen bruker prefikset trust_:
- trust_organizations
- trust_memberships
- trust_cases
- trust_case_messages
- trust_incidents
- trust_documents
- trust_audit_log

Ingen service_role-nøkkel skal ligge i frontend.
