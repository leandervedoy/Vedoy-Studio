# Vedoy Jobs — pilot

A dedicated Next.js 16 app in the Vedoy Studio monorepo.

## MVP

- Mobile-first Norwegian marketplace with explicitly labeled demo tasks.
- Search/filter by category, estimated time, total compensation, and minimum age.
- Passwordless Supabase authentication and worker/business profiles.
- Businesses submit jobs for manual Vedoy approval (never publish directly).
- Workers may express interest in published jobs and view application status.
- Writing and digital categories can accept expressions of interest from ages 15–17; all delivery, sales and physical tasks require 18+ during pilot.
- Wolt Drive is a proposed optional reserve. **No actual Wolt API calls or dispatch in MVP.**
- No actual employment, contracting, payroll, invoice, or payment collection.

## Run

From apps/vedoy-jobs:

    npm install
    npm run dev

## Supabase

1. Set up a separate Supabase project, enable email OTP and configure authenticated URL redirects.
2. Apply supabase/schema.sql in the SQL editor, then verify RLS.
3. Configure env vars from .env.example. Never expose service-role credentials.
4. Verify employer identity and job details, then approve job through authorized admin SQL/service-role workflow. Browser accounts cannot self-approve.
5. Start collecting real tasks only when privacy notices, worker verification and manual review are in place.

Without valid Supabase variables, the UI is a demo and never collects personal information.

## Delivery backup

Only after Wolt Drive partner agreement and server credentials: check local courier availability, request Wolt delivery quote, show it to the business and get explicit confirmation, then book from a server and handle authenticated status updates. Do not promise Wolt availability or price beforehand.

## Legal and trust gates

- The chosen age band is self-reported, **not age verification**. A 15–17-year-old's interest cannot automatically create a job.
- Before actual work, review applicable minor employment rules, parental involvement where required, occupational risk, rest periods, working hours, insurance and school obligations.
- Electric-scooter delivery is 18+ in this pilot pending safety and insurance review. Phone sales is 18+ and requires marketing-law and payroll compliance.
- Explicit employment classification and taxation are required before payouts. Never treat every contributor automatically as self-employed.
- No publication of a worker's private address or birthdate; use city-level information only.
- Before launch: identity checks, moderation dashboard, payment reconciliation, contracts, dispute handling, retention policies, audit logs, rate limits, a privacy impact assessment for minors and cross-account tests.

## Structure

- app/: Next.js App Router
- components/marketplace.tsx: browsing, profile, business and application UI
- lib/jobs.ts: age and category eligibility
- lib/supabase.ts: limited-privilege Supabase browser client
- supabase/schema.sql: RLS-protected tables

Recommended Vercel deployment: a separate vedoy-jobs project, root directory apps/vedoy-jobs.
