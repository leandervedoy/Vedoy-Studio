# Vedoy Studio / Link / PBX employee knowledge portals (beta)

Routes (all in the existing Next.js Vedoy-Studio project):

- `/studio/staff` — overview of all three internal employee areas and search.
- `/studio/staff/studio` — Studio, including 3D service profitability and Unity Web handoff.
- `/studio/staff/link` — Vedoy Link, including number economics and security/onboarding.
- `/studio/staff/pbx` — Vedoy PBX, including PBX economics and a local IVR/routing simulator.
- `/studio/staff/[area]/[slug]` — article reader, section anchors, interactive tool, checklist and knowledge test.

## Security

* Server-side auth check in `app/studio/staff/layout.tsx` and `lib/staff-access.ts`.
* **Never** treat a generic Studio login as proof of Vedoy employment: the login flow may auto-create `member` records.
* Vedoy owner verified by both reserved role and confirmed identity, or an explicitly assigned `owner`, `admin`, `manager` or `editor` team role in the internal `org_vedoy` team, may enter. Default `member` is denied.
* When the PostgreSQL team table is unavailable, access to anyone other than the verified Vedoy owner **fails closed**.
* No secrets, live customer data, PII, telephone configuration or executable HTML/JS are included in these examples.
* `metadata.robots.index=false` is supplementary; access control is enforced on the server.
* Editors are **not** yet enabled. Content is versioned in `lib/staff-knowledge.ts`; publish new articles through reviewed PRs until a server-backed CMS exists.

## Persistence

* Interactive calculators are stateless and use user-controlled local values.
* Checklist and read-completion progress are saved per browser using `localStorage`, not synced across devices or staff accounts. They are not authoritative HR/training records.
* Revenue, minutes and service prices are **illustrative assumptions**, not merchant, carrier or internal accounting data.

## Deployment & QA

* Routes remain under the existing `/studio` session layout. No new environment variables, Supabase migrations or `service_role` keys are required.
* Check that the existing session login works and an ordinary customer/member cannot load these routes.
* Run `npm run typecheck` and `npm run build` in the repository after merging. Current draft is source code only; backend integration was not exercised automatically.
* In a browser, test search, slider recalculation, quiz, checklist persistence, mobile layout and return navigation.
* If employee access needs a new role, build an explicit `staff.read` membership permission rather than treating all `member` or `employee` claims as safe.

## Next milestones

1. Server-backed article authoring (draft, approval, revision history) with per-organization RLS.
2. Progress sync tied to verified staff identity, after a legitimate training-record retention/privacy policy.
3. Real Link/PBX metrics from provisioned product accounts with server-side authorization and tenancy checks.
4. End-to-end accessibility, mobile and employee permission tests.
