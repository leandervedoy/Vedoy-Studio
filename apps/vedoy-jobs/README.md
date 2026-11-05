# Vedoy Marked – Next.js marketplace MVP

Vedoy Marked is a broader second-hand marketplace inspired by easy, low-friction listings, with Vedoy Jobs preserved under `/oppdrag`.

## Included
- Mobile-first responsive browse experience, categories, query, type, location, price filters, sorting, details and favorites.
- Three-step create-listing wizard with manual moderation required before any listing is visible.
- Passwordless Supabase email authentication, user profiles, private 1:1 threads and text messages, RLS-based permissions.
- Listings for electronics, fashion, home, vehicles, housing, sports, services and other; existing jobs app is linked via `/oppdrag`.
- Deliberate and reduced-motion-aware CSS animations. Placeholder illustrations explicitly marked as examples, not genuine offers.
- No fake checkout: shipping, image uploads, payments, escrow, verification and production-scale search are not yet implemented.

## Development
From `apps/vedoy-jobs`, run `npm install`, `npm run dev`, `npm run typecheck`, `npm run build`.

## Supabase
1. Create separate project and set passwordless email OTP plus approved redirect URL.
2. Run `supabase/schema.sql` first for legacy Jobs, then `supabase/market.sql` for the marketplace.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the target Vercel project; do not expose service-role credentials.
4. Moderate pending ads via trusted administrative workflow only; no browser self-approval.
5. Verify RLS with two accounts and confirm unauthorized conversations and private ads remain inaccessible.
6. Only enable photographs after setting up a suitably secured Supabase Storage bucket and access policies. Ads currently publish without uploaded images.

## Pre-launch
- Test build, mobile UI, accessible keyboard navigation, network failures and cross-account authorization.
- Implement compliant terms, consent and GDPR processes including retention/deletion requests.
- Anti-spam/rate limits, abuse reporting, blocking, identity verification where appropriate, moderation workflows and audit logs.
- Add verified seller onboarding, optional trade protection, payment integration, actual image uploads and shipping only after security/legal review.
- Vehicle/property ads need category-specific disclosures and more robust moderation.
- Human review of age requirements for job assignments, transportation risks and employment classification is still needed in `/oppdrag`.

## Vercel
Deploy as an **independent project** sourced from `leandervedoy/Vedoy-Studio` with root directory `apps/vedoy-jobs` so the existing Vedoy Studio site remains unaffected.

No claims about live operations until Vercel deployment and real backend setup have been verified.
