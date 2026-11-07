# Vedoy Insights / Monetize privacy rollout checklist

## Implemented in PR #33
- New SEO-oriented articles and four reader levels.
- Optional reading-goal dialog. Escape, X and backdrop dismiss without consent.
- Optional interest-based article ordering entirely in the browser; no server event on topic selection.
- Explicit local storage opt-in for interests and reading level; default is no persistence.
- Existing VoluntaryStatistics component displayed on Insights. Default choice is No.
- Cloud persistence is visibly unavailable until authenticated storage and consent revocation are ready.

## Must be completed before production rollout
1. Confirm all first-party and third-party analytics (including Vercel Analytics) respect a decline. Audit requests in a fresh browser with no consent and after withdrawal.
2. Test keyboard navigation, focus return, screen readers, mobile layouts and reduced motion.
3. Verify that the consent component does not silently turn dismissal into an unrequested cloud write for signed-in users; no means no.
4. Validate the existing Statistics API origin allowlist and reporting accuracy. A client-submitted consent flag is not a verified identity or reward claim.
5. Cloud storage: authenticated account preferences, server-side authorization, deletion endpoint, encryption at rest, audit log and account-level revocation; never store interests before explicit opt-in.
6. Coins: create a server-side idempotent reward ledger, fraud prevention, a transparent reward schedule and terms. Do not reward consent to commercial data sharing more than refusal; assess whether consent is freely given.
7. Commercial reports: export aggregated, thresholded data only after privacy review and suppression of small or overlapping cohorts. Encrypted names, hashed IDs and pseudonyms are NOT anonymous.
8. Complete a GDPR legal-basis and DPIA screening; document recipients, retention, international transfers, withdrawal and DSAR process. Separate personalization, analytics and commercial-report permissions.
9. Build/test the Next.js app, review the draft PR, deploy to preview, test the actual consent network calls and then merge.
10. Human editorial review: check claims, sources, tone, SEO intent and publication disclosures. No AI-detector can guarantee text will be classified as human.

## Explicitly NOT shipped by this PR
- Selling data, exporting audience segments, cloud interest profiles, or awarding Vedoy Coins.
- Full verified compliance or successful production deployment.
